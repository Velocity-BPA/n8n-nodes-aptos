/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createAptosClientWrapper } from './transport/aptosClient';

// Import operations and fields from actions
import {
  accountOperations,
  accountFields,
  executeAccountOperation,
} from './actions/account';
import {
  transactionOperations,
  transactionFields,
  executeTransactionOperation,
} from './actions/transaction';
import {
  transferOperations,
  transferFields,
  executeTransferOperation,
} from './actions/transfer';
import {
  coinOperations,
  coinFields,
  executeCoinOperation,
} from './actions/coin';
import {
  blockOperations,
  blockFields,
  executeBlockOperation,
} from './actions/block';
import {
  utilityOperations,
  utilityFields,
  executeUtilityOperation,
} from './actions/utility';
import {
  faucetOperations,
  faucetFields,
  executeFaucetOperation,
} from './actions/faucet';

/**
 * Aptos Node
 *
 * Comprehensive n8n node for interacting with the Aptos blockchain.
 * Provides operations for accounts, transactions, transfers, coins,
 * NFTs, staking, governance, and more.
 */
export class Aptos implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aptos',
    name: 'aptos',
    icon: 'file:aptos.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Aptos blockchain',
    defaults: {
      name: 'Aptos',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'aptosNetwork',
        required: true,
      },
      {
        name: 'aptosIndexer',
        required: false,
      },
      {
        name: 'aptosFaucet',
        required: false,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Account', value: 'account' },
          { name: 'Block', value: 'block' },
          { name: 'Coin', value: 'coin' },
          { name: 'Faucet (Testnet/Devnet)', value: 'faucet' },
          { name: 'Transaction', value: 'transaction' },
          { name: 'Transfer', value: 'transfer' },
          { name: 'Utility', value: 'utility' },
        ],
        default: 'account',
      },

      // Account operations and fields
      ...accountOperations,
      ...accountFields,

      // Transaction operations and fields
      ...transactionOperations,
      ...transactionFields,

      // Transfer operations and fields
      ...transferOperations,
      ...transferFields,

      // Coin operations and fields
      ...coinOperations,
      ...coinFields,

      // Block operations and fields
      ...blockOperations,
      ...blockFields,

      // Utility operations and fields
      ...utilityOperations,
      ...utilityFields,

      // Faucet operations and fields
      ...faucetOperations,
      ...faucetFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('aptosNetwork');

    // Create Aptos client
    const client = createAptosClientWrapper(credentials);

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        let result: IDataObject;

        switch (resource) {
          case 'account':
            result = await executeAccountOperation.call(this, client, operation, i);
            break;

          case 'transaction':
            result = await executeTransactionOperation.call(this, client, operation, i);
            break;

          case 'transfer':
            result = await executeTransferOperation(this, client, operation, i);
            break;

          case 'coin':
            result = await executeCoinOperation(this, client, operation, i);
            break;

          case 'block':
            result = await executeBlockOperation(this, client, operation, i);
            break;

          case 'utility':
            result = await executeUtilityOperation(this, client, operation, i);
            break;

          case 'faucet':
            result = await executeFaucetOperation(this, client, operation, i);
            break;

          default:
            throw new NodeOperationError(
              this.getNode(),
              `Unknown resource: ${resource}`,
              { itemIndex: i }
            );
        }

        returnData.push({
          json: result,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, {
          itemIndex: i,
        });
      }
    }

    return [returnData];
  }
}
