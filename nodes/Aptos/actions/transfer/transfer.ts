/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';
import { isValidAddress, normalizeAddress } from '../../utils/accountUtils';
import { aptToOctas, octasToApt } from '../../utils/unitConverter';

export const transferOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['transfer'] } },
    options: [
      { name: 'Check Balance Sufficient', value: 'checkBalanceSufficient', action: 'Check balance' },
      { name: 'Estimate Transfer Fee', value: 'estimateFee', action: 'Estimate fee' },
      { name: 'Get Coin Store', value: 'getCoinStore', action: 'Get coin store' },
      { name: 'Register Coin', value: 'registerCoin', action: 'Register coin' },
      { name: 'Transfer APT', value: 'transferApt', action: 'Transfer APT' },
      { name: 'Transfer Coin', value: 'transferCoin', action: 'Transfer coin' },
    ],
    default: 'transferApt',
  },
];

export const transferFields: INodeProperties[] = [
  {
    displayName: 'Recipient Address',
    name: 'recipientAddress',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['transfer'], operation: ['transferApt', 'transferCoin', 'estimateFee'] } },
  },
  {
    displayName: 'Amount (APT)',
    name: 'amountApt',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['transfer'], operation: ['transferApt', 'estimateFee', 'checkBalanceSufficient'] } },
  },
  {
    displayName: 'Amount (Smallest Unit)',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['transfer'], operation: ['transferCoin'] } },
  },
  {
    displayName: 'Coin Type',
    name: 'coinType',
    type: 'string',
    required: true,
    default: '0x1::aptos_coin::AptosCoin',
    displayOptions: { show: { resource: ['transfer'], operation: ['transferCoin', 'registerCoin', 'getCoinStore'] } },
  },
  {
    displayName: 'Account Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['transfer'], operation: ['getCoinStore', 'checkBalanceSufficient'] } },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['transfer'], operation: ['transferApt', 'transferCoin'] } },
    options: [
      { displayName: 'Max Gas Amount', name: 'maxGasAmount', type: 'number', default: 100000 },
      { displayName: 'Wait for Confirmation', name: 'waitForConfirmation', type: 'boolean', default: true },
    ],
  },
];

export async function executeTransferOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'transferApt': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const recipient = execFns.getNodeParameter('recipientAddress', index) as string;
      const amountApt = execFns.getNodeParameter('amountApt', index) as number;
      const options = execFns.getNodeParameter('options', index) as IDataObject;
      if (!isValidAddress(recipient)) throw new Error('Invalid address: ' + recipient);
      const amountOctas = aptToOctas(amountApt);
      const pendingTx = await client.transferApt(normalizeAddress(recipient), amountOctas);
      if (options.waitForConfirmation !== false) {
        const tx = await client.waitForTransaction(pendingTx.hash);
        return { success: true, hash: tx.hash, version: tx.version, recipient: normalizeAddress(recipient), amountApt, gasUsed: tx.gas_used };
      }
      return { hash: pendingTx.hash, status: 'pending', recipient: normalizeAddress(recipient), amountApt };
    }
    case 'transferCoin': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const recipient = execFns.getNodeParameter('recipientAddress', index) as string;
      const amount = execFns.getNodeParameter('amount', index) as string;
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      const options = execFns.getNodeParameter('options', index) as IDataObject;
      if (!isValidAddress(recipient)) throw new Error('Invalid address: ' + recipient);
      const payload = {
        function: '0x1::aptos_account::transfer_coins' as const,
        typeArguments: [coinType],
        functionArguments: [normalizeAddress(recipient), amount],
      };
      const pendingTx = await client.submitTransaction(payload as any, { maxGasAmount: options.maxGasAmount as number });
      if (options.waitForConfirmation !== false) {
        const tx = await client.waitForTransaction(pendingTx.hash);
        return { success: true, hash: tx.hash, recipient: normalizeAddress(recipient), amount, coinType };
      }
      return { hash: pendingTx.hash, status: 'pending' };
    }
    case 'getCoinStore': {
      const address = execFns.getNodeParameter('address', index) as string;
      const coinType = execFns.getNodeParameter('coinType', index) as string;
      const resourceType = '0x1::coin::CoinStore<' + coinType + '>';
      const resource = await client.getAccountResource(normalizeAddress(address), resourceType);
      return { address: normalizeAddress(address), coinType, data: resource.data };
    }
    case 'checkBalanceSufficient': {
      const address = execFns.getNodeParameter('address', index) as string;
      const amountApt = execFns.getNodeParameter('amountApt', index) as number;
      const balance = await client.getAccountBalance(normalizeAddress(address));
      const required = aptToOctas(amountApt);
      return { address: normalizeAddress(address), balanceApt: octasToApt(balance), requiredApt: amountApt, sufficient: balance >= required };
    }
    case 'registerCoin': {
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
    case 'estimateFee': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const recipient = execFns.getNodeParameter('recipientAddress', index) as string;
      const amountApt = execFns.getNodeParameter('amountApt', index) as number;
      const payload = {
        function: '0x1::aptos_account::transfer' as const,
        typeArguments: [],
        functionArguments: [normalizeAddress(recipient), aptToOctas(amountApt).toString()],
      };
      const estimate = await client.estimateGas(payload as any);
      return { gasUsed: estimate.gasUsed, gasUnitPrice: estimate.gasUnitPrice, estimatedCostOctas: estimate.gasUsed * estimate.gasUnitPrice };
    }
    default:
      throw new Error('Unsupported transfer operation: ' + operation);
  }
}
