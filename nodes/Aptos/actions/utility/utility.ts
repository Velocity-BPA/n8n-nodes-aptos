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

export const utilityOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['utility'] } },
    options: [
      { name: 'Convert from Octas', value: 'fromOctas', action: 'Convert from octas' },
      { name: 'Convert to Octas', value: 'toOctas', action: 'Convert to octas' },
      { name: 'Generate Account', value: 'generateAccount', action: 'Generate new account' },
      { name: 'Get Chain ID', value: 'getChainId', action: 'Get chain ID' },
      { name: 'Get Ledger Info', value: 'getLedgerInfo', action: 'Get ledger info' },
      { name: 'Get Node Info', value: 'getNodeInfo', action: 'Get node info' },
      { name: 'Health Check', value: 'healthCheck', action: 'Health check' },
      { name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
    ],
    default: 'getLedgerInfo',
  },
];

export const utilityFields: INodeProperties[] = [
  {
    displayName: 'Amount (APT)',
    name: 'amountApt',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['utility'], operation: ['toOctas'] } },
  },
  {
    displayName: 'Amount (Octas)',
    name: 'amountOctas',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['utility'], operation: ['fromOctas'] } },
  },
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['utility'], operation: ['validateAddress'] } },
  },
];

export async function executeUtilityOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'toOctas': {
      const apt = execFns.getNodeParameter('amountApt', index) as number;
      const octas = aptToOctas(apt);
      return { apt, octas: octas.toString() };
    }
    case 'fromOctas': {
      const octasStr = execFns.getNodeParameter('amountOctas', index) as string;
      const apt = octasToApt(BigInt(octasStr));
      return { octas: octasStr, apt };
    }
    case 'validateAddress': {
      const address = execFns.getNodeParameter('address', index) as string;
      const valid = isValidAddress(address);
      return { address, valid, normalized: valid ? normalizeAddress(address) : null };
    }
    case 'generateAccount': {
      const { Account } = await import('@aptos-labs/ts-sdk');
      const account = Account.generate();
      return {
        address: account.accountAddress.toString(),
        publicKey: account.publicKey.toString(),
        privateKey: account.privateKey.toString(),
        note: 'Save private key securely. Account must be funded to exist on-chain.',
      };
    }
    case 'getLedgerInfo': {
      const info = await client.getLedgerInfo();
      return {
        chainId: info.chain_id,
        epoch: info.epoch,
        ledgerVersion: info.ledger_version,
        blockHeight: info.block_height,
        ledgerTimestamp: info.ledger_timestamp,
        nodeRole: info.node_role,
        oldestLedgerVersion: info.oldest_ledger_version,
        oldestBlockHeight: info.oldest_block_height,
        gitHash: info.git_hash,
      };
    }
    case 'getChainId': {
      const info = await client.getLedgerInfo();
      return { chainId: info.chain_id };
    }
    case 'getNodeInfo': {
      const info = await client.getLedgerInfo();
      return {
        nodeRole: info.node_role,
        gitHash: info.git_hash,
        chainId: info.chain_id,
      };
    }
    case 'healthCheck': {
      try {
        await client.getLedgerInfo();
        return { healthy: true, network: client.networkConfig.name };
      } catch (error) {
        return { healthy: false, error: (error as Error).message };
      }
    }
    default:
      throw new Error('Unsupported utility operation: ' + operation);
  }
}
