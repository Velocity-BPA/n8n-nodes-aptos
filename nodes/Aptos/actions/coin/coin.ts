/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';
import { normalizeAddress } from '../../utils/accountUtils';
import { octasToApt } from '../../utils/unitConverter';

export const coinOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['coin'] } },
    options: [
      { name: 'Check Coin Exists', value: 'checkExists', action: 'Check coin exists' },
      { name: 'Get All Coins', value: 'getAllCoins', action: 'Get all coins by account' },
      { name: 'Get Coin Balance', value: 'getBalance', action: 'Get coin balance' },
      { name: 'Get Coin Info', value: 'getInfo', action: 'Get coin info' },
      { name: 'Get Coin Metadata', value: 'getMetadata', action: 'Get coin metadata' },
      { name: 'Get Coin Supply', value: 'getSupply', action: 'Get coin supply' },
      { name: 'Register Coin', value: 'register', action: 'Register coin' },
      { name: 'Transfer Coin', value: 'transfer', action: 'Transfer coin' },
    ],
    default: 'getBalance',
  },
];

export const coinFields: INodeProperties[] = [
  {
    displayName: 'Account Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['coin'], operation: ['getBalance', 'getAllCoins', 'register'] } },
  },
  {
    displayName: 'Coin Type',
    name: 'coinType',
    type: 'string',
    required: true,
    default: '0x1::aptos_coin::AptosCoin',
    displayOptions: { show: { resource: ['coin'], operation: ['getBalance', 'getInfo', 'getMetadata', 'getSupply', 'checkExists', 'register', 'transfer'] } },
  },
  {
    displayName: 'Recipient Address',
    name: 'recipientAddress',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['coin'], operation: ['transfer'] } },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    description: 'Amount in smallest unit',
    displayOptions: { show: { resource: ['coin'], operation: ['transfer'] } },
  },
];

export async function executeCoinOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'getBalance': {
      const address = execFns.getNodeParameter('address', index) as string;
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      const balance = await client.getCoinBalance(normalizeAddress(address), coinType);
      const isApt = coinType === '0x1::aptos_coin::AptosCoin';
      return {
        address: normalizeAddress(address),
        coinType,
        balance: balance.toString(),
        formatted: isApt ? octasToApt(balance).toString() + ' APT' : balance.toString(),
      };
    }
    case 'getInfo': {
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      const parts = coinType.split('::');
      const coinAddress = parts[0];
      const resourceType = '0x1::coin::CoinInfo<' + coinType + '>';
      const resource = await client.getAccountResource(normalizeAddress(coinAddress), resourceType);
      return { coinType, info: resource.data };
    }
    case 'getSupply': {
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      const parts = coinType.split('::');
      const coinAddress = parts[0];
      const resourceType = '0x1::coin::CoinInfo<' + coinType + '>';
      const resource = await client.getAccountResource(normalizeAddress(coinAddress), resourceType);
      const data = resource.data as { supply?: { vec: Array<{ integer: { vec: Array<{ value: string }> } }> } };
      const supply = data.supply?.vec?.[0]?.integer?.vec?.[0]?.value || '0';
      return { coinType, supply };
    }
    case 'checkExists': {
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      try {
        const parts = coinType.split('::');
        const coinAddress = parts[0];
        await client.getAccountResource(normalizeAddress(coinAddress), '0x1::coin::CoinInfo<' + coinType + '>');
        return { coinType, exists: true };
      } catch {
        return { coinType, exists: false };
      }
    }
    case 'register': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      const payload = {
        function: '0x1::managed_coin::register' as const,
        typeArguments: [coinType],
        functionArguments: [],
      };
      const pendingTx = await client.submitTransaction(payload as any);
      const tx = await client.waitForTransaction(pendingTx.hash);
      return { success: true, hash: tx.hash, coinType };
    }
    case 'transfer': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      const recipient = execFns.getNodeParameter('recipientAddress', index) as string;
      const amount = execFns.getNodeParameter('amount', index) as string;
      const payload = {
        function: '0x1::aptos_account::transfer_coins' as const,
        typeArguments: [coinType],
        functionArguments: [normalizeAddress(recipient), amount],
      };
      const pendingTx = await client.submitTransaction(payload as any);
      const tx = await client.waitForTransaction(pendingTx.hash);
      return { success: true, hash: tx.hash, recipient: normalizeAddress(recipient), amount, coinType };
    }
    case 'getAllCoins':
    case 'getMetadata':
    default:
      return { note: 'Use Indexer resource for detailed coin queries', operation };
  }
}
