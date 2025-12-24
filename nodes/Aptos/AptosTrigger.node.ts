/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { createAptosClientWrapper } from './transport/aptosClient';

/**
 * Aptos Trigger Node
 *
 * Polls the Aptos blockchain for new events, transactions, and blocks.
 * Uses polling mechanism since Aptos doesn't have native WebSocket support.
 */
export class AptosTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aptos Trigger',
    name: 'aptosTrigger',
    icon: 'file:aptos.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["triggerType"]}}',
    description: 'Trigger on Aptos blockchain events',
    defaults: {
      name: 'Aptos Trigger',
    },
    inputs: [],
    outputs: ['main'],
    polling: true,
    credentials: [
      {
        name: 'aptosNetwork',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Trigger Type',
        name: 'triggerType',
        type: 'options',
        options: [
          {
            name: 'Account Balance Changed',
            value: 'balanceChanged',
            description: 'Trigger when an account balance changes',
          },
          {
            name: 'New Block',
            value: 'newBlock',
            description: 'Trigger on new blocks',
          },
          {
            name: 'New Epoch',
            value: 'newEpoch',
            description: 'Trigger when a new epoch starts',
          },
          {
            name: 'Transaction Confirmed',
            value: 'transactionConfirmed',
            description: 'Trigger when a specific transaction is confirmed',
          },
        ],
        default: 'newBlock',
        description: 'The type of event to trigger on',
      },
      {
        displayName: 'Account Address',
        name: 'accountAddress',
        type: 'string',
        default: '',
        placeholder: '0x1234...',
        description: 'The account address to monitor',
        displayOptions: {
          show: {
            triggerType: ['balanceChanged'],
          },
        },
      },
      {
        displayName: 'Transaction Hash',
        name: 'transactionHash',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'The transaction hash to monitor',
        displayOptions: {
          show: {
            triggerType: ['transactionConfirmed'],
          },
        },
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const credentials = await this.getCredentials('aptosNetwork');
    const client = createAptosClientWrapper(credentials);
    const triggerType = this.getNodeParameter('triggerType') as string;

    // Get the last processed state from workflow static data
    const workflowStaticData = this.getWorkflowStaticData('node');
    const lastVersion = (workflowStaticData.lastVersion as number) || 0;
    const lastBalance = (workflowStaticData.lastBalance as string) || '0';
    const lastEpoch = (workflowStaticData.lastEpoch as string) || '0';

    try {
      const ledgerInfo = await client.getLedgerInfo();
      const currentVersion = parseInt(ledgerInfo.ledger_version, 10);

      switch (triggerType) {
        case 'newBlock': {
          if (currentVersion > lastVersion) {
            workflowStaticData.lastVersion = currentVersion;
            return [
              [
                {
                  json: {
                    triggerType: 'newBlock',
                    blockHeight: ledgerInfo.block_height,
                    ledgerVersion: ledgerInfo.ledger_version,
                    ledgerTimestamp: ledgerInfo.ledger_timestamp,
                    epoch: ledgerInfo.epoch,
                    chainId: ledgerInfo.chain_id,
                  },
                },
              ],
            ];
          }
          break;
        }

        case 'newEpoch': {
          const currentEpoch = ledgerInfo.epoch;
          if (currentEpoch !== lastEpoch) {
            workflowStaticData.lastEpoch = currentEpoch;
            if (lastEpoch !== '0') {
              return [
                [
                  {
                    json: {
                      triggerType: 'newEpoch',
                      previousEpoch: lastEpoch,
                      currentEpoch,
                      blockHeight: ledgerInfo.block_height,
                      ledgerVersion: ledgerInfo.ledger_version,
                    },
                  },
                ],
              ];
            }
          }
          break;
        }

        case 'balanceChanged': {
          const address = this.getNodeParameter('accountAddress') as string;
          if (!address) break;

          const balance = await client.getAccountBalance(address);
          const balanceStr = balance.toString();

          if (balanceStr !== lastBalance) {
            const previousBalance = lastBalance;
            workflowStaticData.lastBalance = balanceStr;

            if (previousBalance !== '0') {
              const change = balance - BigInt(previousBalance);
              return [
                [
                  {
                    json: {
                      triggerType: 'balanceChanged',
                      address,
                      previousBalance,
                      currentBalance: balanceStr,
                      change: change.toString(),
                      increased: change > 0,
                    },
                  },
                ],
              ];
            }
          }
          break;
        }

        case 'transactionConfirmed': {
          const hash = this.getNodeParameter('transactionHash') as string;
          if (!hash) break;

          try {
            const tx = await client.getTransactionByHash(hash);
            // Transaction found - it's confirmed
            return [
              [
                {
                  json: {
                    triggerType: 'transactionConfirmed',
                    hash: tx.hash,
                    version: tx.version,
                    success: tx.success,
                    vmStatus: tx.vm_status,
                    sender: tx.sender,
                    gasUsed: tx.gas_used,
                    timestamp: tx.timestamp,
                  },
                },
              ],
            ];
          } catch {
            // Transaction not found yet
          }
          break;
        }
      }
    } catch (error) {
      console.error('Aptos Trigger error:', (error as Error).message);
    }

    return null;
  }
}
