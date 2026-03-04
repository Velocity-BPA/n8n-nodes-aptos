/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-aptos/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Aptos implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aptos',
    name: 'aptos',
    icon: 'file:aptos.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Aptos API',
    defaults: {
      name: 'Aptos',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'aptosApi',
        required: true,
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
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Blocks',
            value: 'blocks',
          },
          {
            name: 'Coins',
            value: 'coins',
          },
          {
            name: 'Events',
            value: 'events',
          },
          {
            name: 'LedgerInfo',
            value: 'ledgerInfo',
          }
        ],
        default: 'accounts',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Account',
      value: 'getAccount',
      description: 'Get account data by address',
      action: 'Get account data',
    },
    {
      name: 'Get Account Resources',
      value: 'getAccountResources',
      description: 'Get account resources',
      action: 'Get account resources',
    },
    {
      name: 'Get Account Modules',
      value: 'getAccountModules',
      description: 'Get account modules',
      action: 'Get account modules',
    },
    {
      name: 'Get Account Resource',
      value: 'getAccountResource',
      description: 'Get specific account resource',
      action: 'Get specific account resource',
    },
  ],
  default: 'getAccount',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Submit Transaction',
      value: 'submitTransaction',
      description: 'Submit a signed transaction',
      action: 'Submit transaction',
    },
    {
      name: 'Get Transactions',
      value: 'getTransactions',
      description: 'Get list of transactions',
      action: 'Get transactions',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction by hash or version',
      action: 'Get transaction',
    },
    {
      name: 'Simulate Transaction',
      value: 'simulateTransaction',
      description: 'Simulate transaction execution',
      action: 'Simulate transaction',
    },
    {
      name: 'Submit Batch Transactions',
      value: 'submitBatchTransactions',
      description: 'Submit multiple transactions',
      action: 'Submit batch transactions',
    },
    {
      name: 'Get Account Transactions',
      value: 'getAccountTransactions',
      description: 'Get transactions for specific account',
      action: 'Get account transactions',
    },
  ],
  default: 'submitTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
    },
  },
  options: [
    {
      name: 'Get Block by Height',
      value: 'getBlockByHeight',
      description: 'Get block information by block height',
      action: 'Get block by height',
    },
    {
      name: 'Get Block by Version',
      value: 'getBlockByVersion',
      description: 'Get block information by version number',
      action: 'Get block by version',
    },
  ],
  default: 'getBlockByHeight',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['coins'],
    },
  },
  options: [
    {
      name: 'Encode Coin Transfer',
      value: 'encodeCoinTransfer',
      description: 'Encode a coin transfer transaction for submission',
      action: 'Encode coin transfer transaction',
    },
    {
      name: 'Get Coin Balance',
      value: 'getCoinBalance',
      description: 'Get coin balance for an account',
      action: 'Get coin balance for account',
    },
    {
      name: 'Get Coin Withdraw Events',
      value: 'getCoinWithdrawEvents',
      description: 'Get coin withdraw events for an account',
      action: 'Get coin withdraw events',
    },
    {
      name: 'Get Coin Deposit Events',
      value: 'getCoinDepositEvents',
      description: 'Get coin deposit events for an account',
      action: 'Get coin deposit events',
    },
  ],
  default: 'encodeCoinTransfer',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['events'],
    },
  },
  options: [
    {
      name: 'Get Account Events',
      value: 'getAccountEvents',
      description: 'Get events by account and event handle',
      action: 'Get account events',
    },
    {
      name: 'Get Events By Key',
      value: 'getEventsByKey',
      description: 'Get events by event key',
      action: 'Get events by key',
    },
  ],
  default: 'getAccountEvents',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['ledgerInfo'],
    },
  },
  options: [
    {
      name: 'Get Ledger Info',
      value: 'getLedgerInfo',
      description: 'Get current ledger information',
      action: 'Get ledger info',
    },
    {
      name: 'Estimate Gas Price',
      value: 'estimateGasPrice',
      description: 'Get current gas price estimate',
      action: 'Estimate gas price',
    },
  ],
  default: 'getLedgerInfo',
},
      // Parameter definitions
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount', 'getAccountResources', 'getAccountModules', 'getAccountResource'],
    },
  },
  default: '',
  description: 'The account address',
},
{
  displayName: 'Resource Type',
  name: 'resourceType',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountResource'],
    },
  },
  default: '',
  description: 'The specific resource type to retrieve',
},
{
  displayName: 'Ledger Version',
  name: 'ledgerVersion',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountResources', 'getAccountModules', 'getAccountResource'],
    },
  },
  default: '',
  description: 'Ledger version to query for account resource',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountResources', 'getAccountModules'],
    },
  },
  default: '',
  description: 'Cursor specifying where to start for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountResources', 'getAccountModules'],
    },
  },
  default: 25,
  description: 'Max number of items to retrieve',
  typeOptions: {
    minValue: 1,
    maxValue: 1000,
  },
},
{
  displayName: 'Transaction Data',
  name: 'transactionData',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['submitTransaction'],
    },
  },
  default: '{}',
  description: 'The signed transaction data to submit',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: 0,
  description: 'Start index for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactions'],
    },
  },
  default: 25,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Transaction Hash or Version',
  name: 'txnHashOrVersion',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'Transaction hash or version number',
},
{
  displayName: 'Transaction Data',
  name: 'transactionData',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: '{}',
  description: 'The transaction data to simulate',
},
{
  displayName: 'Estimate Gas Unit Price',
  name: 'estimateGasUnitPrice',
  type: 'boolean',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: false,
  description: 'Whether to estimate gas unit price',
},
{
  displayName: 'Estimate Max Gas Amount',
  name: 'estimateMaxGasAmount',
  type: 'boolean',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: false,
  description: 'Whether to estimate maximum gas amount',
},
{
  displayName: 'Transactions Array',
  name: 'transactionsArray',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['submitBatchTransactions'],
    },
  },
  default: '[]',
  description: 'Array of signed transactions to submit',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'The account address',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 0,
  description: 'Start index for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 25,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Block Height',
  name: 'blockHeight',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockByHeight'],
    },
  },
  default: 0,
  description: 'The block height to retrieve',
},
{
  displayName: 'Include Transactions',
  name: 'withTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockByHeight'],
    },
  },
  default: false,
  description: 'Whether to include transactions in the response',
},
{
  displayName: 'Version',
  name: 'version',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockByVersion'],
    },
  },
  default: 0,
  description: 'The version number to retrieve the block for',
},
{
  displayName: 'Include Transactions',
  name: 'withTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockByVersion'],
    },
  },
  default: false,
  description: 'Whether to include transactions in the response',
},
{
  displayName: 'Sender Address',
  name: 'sender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['coins'],
      operation: ['encodeCoinTransfer'],
    },
  },
  default: '',
  description: 'The sender account address',
},
{
  displayName: 'Receiver Address',
  name: 'receiver',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['coins'],
      operation: ['encodeCoinTransfer'],
    },
  },
  default: '',
  description: 'The receiver account address',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['coins'],
      operation: ['encodeCoinTransfer'],
    },
  },
  default: '',
  description: 'The amount to transfer',
},
{
  displayName: 'Coin Type',
  name: 'coinType',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['coins'],
      operation: ['encodeCoinTransfer', 'getCoinBalance', 'getCoinWithdrawEvents', 'getCoinDepositEvents'],
    },
  },
  default: '0x1::aptos_coin::AptosCoin',
  description: 'The coin type (e.g., 0x1::aptos_coin::AptosCoin)',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['coins'],
      operation: ['getCoinBalance', 'getCoinWithdrawEvents', 'getCoinDepositEvents'],
    },
  },
  default: '',
  description: 'The account address',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['coins'],
      operation: ['getCoinWithdrawEvents', 'getCoinDepositEvents'],
    },
  },
  default: 0,
  description: 'Start index for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['coins'],
      operation: ['getCoinWithdrawEvents', 'getCoinDepositEvents'],
    },
  },
  default: 25,
  description: 'Maximum number of events to return',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAccountEvents'],
    },
  },
  default: '',
  description: 'The account address',
},
{
  displayName: 'Event Handle',
  name: 'event_handle',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAccountEvents'],
    },
  },
  default: '',
  description: 'The event handle',
},
{
  displayName: 'Field Name',
  name: 'field_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAccountEvents'],
    },
  },
  default: '',
  description: 'The field name',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAccountEvents'],
    },
  },
  default: 0,
  description: 'Start position for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAccountEvents'],
    },
  },
  default: 25,
  description: 'Maximum number of events to return',
},
{
  displayName: 'Event Key',
  name: 'event_key',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventsByKey'],
    },
  },
  default: '',
  description: 'The event key',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventsByKey'],
    },
  },
  default: 0,
  description: 'Start position for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventsByKey'],
    },
  },
  default: 25,
  description: 'Maximum number of events to return',
},
// No additional parameters needed for this resource as both operations don't require parameters,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'blocks':
        return [await executeBlocksOperations.call(this, items)];
      case 'coins':
        return [await executeCoinsOperations.call(this, items)];
      case 'events':
        return [await executeEventsOperations.call(this, items)];
      case 'ledgerInfo':
        return [await executeLedgerInfoOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('aptosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAccount': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountResources': {
          const address = this.getNodeParameter('address', i) as string;
          const ledgerVersion = this.getNodeParameter('ledgerVersion', i, '') as string;
          const start = this.getNodeParameter('start', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 25) as number;

          const queryParams: string[] = [];
          if (ledgerVersion) queryParams.push(`ledger_version=${ledgerVersion}`);
          if (start) queryParams.push(`start=${start}`);
          if (limit) queryParams.push(`limit=${limit}`);
          
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/resources${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountModules': {
          const address = this.getNodeParameter('address', i) as string;
          const ledgerVersion = this.getNodeParameter('ledgerVersion', i, '') as string;
          const start = this.getNodeParameter('start', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 25) as number;

          const queryParams: string[] = [];
          if (ledgerVersion) queryParams.push(`ledger_version=${ledgerVersion}`);
          if (start) queryParams.push(`start=${start}`);
          if (limit) queryParams.push(`limit=${limit}`);
          
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/modules${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountResource': {
          const address = this.getNodeParameter('address', i) as string;
          const resourceType = this.getNodeParameter('resourceType', i) as string;
          const ledgerVersion = this.getNodeParameter('ledgerVersion', i, '') as string;

          const queryParams: string[] = [];
          if (ledgerVersion) queryParams.push(`ledger_version=${ledgerVersion}`);
          
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/resource/${resourceType}${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeTransactionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('aptosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'submitTransaction': {
          const transactionData = this.getNodeParameter('transactionData', i) as any;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactions': {
          const start = this.getNodeParameter('start', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 25) as number;

          const queryParams: string[] = [];
          if (start > 0) queryParams.push(`start=${start}`);
          if (limit !== 25) queryParams.push(`limit=${limit}`);
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransaction': {
          const txnHashOrVersion = this.getNodeParameter('txnHashOrVersion', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${txnHashOrVersion}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'simulateTransaction': {
          const transactionData = this.getNodeParameter('transactionData', i) as any;
          const estimateGasUnitPrice = this.getNodeParameter('estimateGasUnitPrice', i, false) as boolean;
          const estimateMaxGasAmount = this.getNodeParameter('estimateMaxGasAmount', i, false) as boolean;

          const queryParams: string[] = [];
          if (estimateGasUnitPrice) queryParams.push('estimate_gas_unit_price=true');
          if (estimateMaxGasAmount) queryParams.push('estimate_max_gas_amount=true');
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions/simulate${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'submitBatchTransactions': {
          const transactionsArray = this.getNodeParameter('transactionsArray', i) as any[];

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions/batch`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionsArray),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const start = this.getNodeParameter('start', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 25) as number;

          const queryParams: string[] = [];
          if (start > 0) queryParams.push(`start=${start}`);
          if (limit !== 25) queryParams.push(`limit=${limit}`);
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/transactions${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        } else {
          throw new NodeOperationError(this.getNode(), error.message);
        }
      }
    }
  }

  return returnData;
}

async function executeBlocksOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('aptosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getBlockByHeight': {
          const blockHeight = this.getNodeParameter('blockHeight', i) as number;
          const withTransactions = this.getNodeParameter('withTransactions', i, false) as boolean;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/by_height/${blockHeight}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            qs: {},
            json: true,
          };
          
          if (withTransactions) {
            options.qs.with_transactions = 'true';
          }
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getBlockByVersion': {
          const version = this.getNodeParameter('version', i) as number;
          const withTransactions = this.getNodeParameter('withTransactions', i, false) as boolean;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/by_version/${version}`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            qs: {},
            json: true,
          };
          
          if (withTransactions) {
            options.qs.with_transactions = 'true';
          }
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.statusCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}

async function executeCoinsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('aptosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'encodeCoinTransfer': {
          const sender = this.getNodeParameter('sender', i) as string;
          const receiver = this.getNodeParameter('receiver', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const coinType = this.getNodeParameter('coinType', i) as string;

          const payload = {
            type: 'entry_function_payload',
            function: '0x1::coin::transfer',
            type_arguments: [coinType],
            arguments: [receiver, amount],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions/encode_submission`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              sender: sender,
              sequence_number: '0',
              max_gas_amount: '1000',
              gas_unit_price: '1',
              expiration_timestamp_secs: Math.floor(Date.now() / 1000 + 600).toString(),
              payload: payload,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCoinBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const coinType = this.getNodeParameter('coinType', i) as string;
          const encodedCoinType = encodeURIComponent(coinType);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/resource/0x1::coin::CoinStore<${encodedCoinType}>`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCoinWithdrawEvents': {
          const address = this.getNodeParameter('address', i) as string;
          const coinType = this.getNodeParameter('coinType', i) as string;
          const start = this.getNodeParameter('start', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;
          const encodedCoinType = encodeURIComponent(coinType);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/events/0x1::coin::CoinStore<${encodedCoinType}>/withdraw_events`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
            qs: {
              start: start,
              limit: limit,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCoinDepositEvents': {
          const address = this.getNodeParameter('address', i) as string;
          const coinType = this.getNodeParameter('coinType', i) as string;
          const start = this.getNodeParameter('start', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;
          const encodedCoinType = encodeURIComponent(coinType);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/events/0x1::coin::CoinStore<${encodedCoinType}>/deposit_events`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
            qs: {
              start: start,
              limit: limit,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeEventsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('aptosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAccountEvents': {
          const address = this.getNodeParameter('address', i) as string;
          const eventHandle = this.getNodeParameter('event_handle', i) as string;
          const fieldName = this.getNodeParameter('field_name', i) as string;
          const start = this.getNodeParameter('start', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams = new URLSearchParams();
          if (start !== undefined) queryParams.append('start', start.toString());
          if (limit !== undefined) queryParams.append('limit', limit.toString());

          const url = `${credentials.baseUrl}/accounts/${address}/events/${eventHandle}/${fieldName}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

          const options: any = {
            method: 'GET',
            url: url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getEventsByKey': {
          const eventKey = this.getNodeParameter('event_key', i) as string;
          const start = this.getNodeParameter('start', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams = new URLSearchParams();
          if (start !== undefined) queryParams.append('start', start.toString());
          if (limit !== undefined) queryParams.append('limit', limit.toString());

          const url = `${credentials.baseUrl}/events/${eventKey}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

          const options: any = {
            method: 'GET',
            url: url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
            itemIndex: i,
          });
      }

      returnData.push({ 
        json: result, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeLedgerInfoOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('aptosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getLedgerInfo': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'estimateGasPrice': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/estimate_gas_price`,
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
            itemIndex: i,
          });
      }
      
      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }
    }
  }
  
  return returnData;
}
