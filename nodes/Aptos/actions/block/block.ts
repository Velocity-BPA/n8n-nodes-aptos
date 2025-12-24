/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';

export const blockOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['block'] } },
    options: [
      { name: 'Get Block by Height', value: 'getByHeight', action: 'Get block by height' },
      { name: 'Get Block by Version', value: 'getByVersion', action: 'Get block by version' },
      { name: 'Get Epoch Info', value: 'getEpochInfo', action: 'Get epoch info' },
      { name: 'Get Latest Block', value: 'getLatest', action: 'Get latest block' },
    ],
    default: 'getLatest',
  },
];

export const blockFields: INodeProperties[] = [
  {
    displayName: 'Block Height',
    name: 'blockHeight',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['block'], operation: ['getByHeight'] } },
  },
  {
    displayName: 'Ledger Version',
    name: 'ledgerVersion',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['block'], operation: ['getByVersion'] } },
  },
  {
    displayName: 'Include Transactions',
    name: 'withTransactions',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['block'], operation: ['getByHeight', 'getByVersion'] } },
  },
];

export async function executeBlockOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'getLatest': {
      const ledgerInfo = await client.getLedgerInfo();
      return {
        blockHeight: ledgerInfo.block_height,
        ledgerVersion: ledgerInfo.ledger_version,
        ledgerTimestamp: ledgerInfo.ledger_timestamp,
        epoch: ledgerInfo.epoch,
        chainId: ledgerInfo.chain_id,
      };
    }
    case 'getByHeight': {
      const height = execFns.getNodeParameter('blockHeight', index) as number;
      const withTx = execFns.getNodeParameter('withTransactions', index) as boolean;
      const block = await client.getBlockByHeight(height, withTx);
      return {
        blockHeight: block.block_height,
        blockHash: block.block_hash,
        blockTimestamp: block.block_timestamp,
        firstVersion: block.first_version,
        lastVersion: block.last_version,
        transactionCount: block.transactions?.length || 0,
      };
    }
    case 'getByVersion': {
      const version = execFns.getNodeParameter('ledgerVersion', index) as number;
      const withTx = execFns.getNodeParameter('withTransactions', index) as boolean;
      const block = await client.getBlockByVersion(version, withTx);
      return {
        blockHeight: block.block_height,
        blockHash: block.block_hash,
        blockTimestamp: block.block_timestamp,
        firstVersion: block.first_version,
        lastVersion: block.last_version,
      };
    }
    case 'getEpochInfo': {
      const ledgerInfo = await client.getLedgerInfo();
      return {
        epoch: ledgerInfo.epoch,
        blockHeight: ledgerInfo.block_height,
        ledgerVersion: ledgerInfo.ledger_version,
        oldestBlockHeight: ledgerInfo.oldest_block_height,
        oldestLedgerVersion: ledgerInfo.oldest_ledger_version,
      };
    }
    default:
      throw new Error('Unsupported block operation: ' + operation);
  }
}
