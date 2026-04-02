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
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Block',
            value: 'block',
          },
          {
            name: 'Ledger',
            value: 'ledger',
          },
          {
            name: 'Event',
            value: 'event',
          },
          {
            name: 'Table',
            value: 'table',
          },
          {
            name: 'Coins',
            value: 'coins',
          }
        ],
        default: 'account',
      },
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['account'],
		},
	},
	options: [
		{
			name: 'Get Account',
			value: 'getAccount',
			description: 'Get account data including sequence number and authentication key',
			action: 'Get account data',
		},
		{
			name: 'Get Account Resources',
			value: 'getAccountResources',
			description: 'Get all resources stored under an account',
			action: 'Get account resources',
		},
		{
			name: 'Get Account Resource',
			value: 'getAccountResource',
			description: 'Get a specific resource from an account',
			action: 'Get specific account resource',
		},
		{
			name: 'Get Account Modules',
			value: 'getAccountModules',
			description: 'Get all modules published by an account',
			action: 'Get account modules',
		},
		{
			name: 'Get Account Module',
			value: 'getAccountModule',
			description: 'Get a specific module published by an account',
			action: 'Get specific account module',
		},
	],
	default: 'getAccount',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transaction'] } },
	options: [
		{
			name: 'Get Transactions',
			value: 'getTransactions',
			description: 'Get list of transactions',
			action: 'Get list of transactions',
		},
		{
			name: 'Get Transaction',
			value: 'getTransaction',
			description: 'Get transaction by hash or version',
			action: 'Get transaction by hash or version',
		},
		{
			name: 'Submit Transaction',
			value: 'submitTransaction',
			description: 'Submit a signed transaction',
			action: 'Submit a signed transaction',
		},
		{
			name: 'Simulate Transaction',
			value: 'simulateTransaction',
			description: 'Simulate a transaction without submitting',
			action: 'Simulate a transaction',
		},
		{
			name: 'Get Transaction By Hash',
			value: 'getTransactionByHash',
			description: 'Get transaction by hash',
			action: 'Get transaction by hash',
		},
		{
			name: 'Get Transaction By Version',
			value: 'getTransactionByVersion',
			description: 'Get transaction by version',
			action: 'Get transaction by version',
		},
		{
			name: 'Submit Batch Transactions',
			value: 'submitBatchTransactions',
			description: 'Submit multiple transactions',
			action: 'Submit multiple transactions',
		},
		{
			name: 'Get Account Transactions',
			value: 'getAccountTransactions',
			description: 'Get transactions for specific account',
			action: 'Get account transactions',
		},
	],
	default: 'getTransactions',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['block'],
    },
  },
  options: [
    {
      name: 'Get Block by Height',
      value: 'getBlockByHeight',
      description: 'Get block information by height',
      action: 'Get block by height',
    },
    {
      name: 'Get Block by Version',
      value: 'getBlockByVersion',
      description: 'Get block information by version',
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
  displayOptions: { show: { resource: ['ledger'] } },
  options: [
    { name: 'Get Ledger Info', value: 'getLedgerInfo', description: 'Get the latest ledger information', action: 'Get ledger info' },
    { name: 'Get Spec', value: 'getSpec', description: 'Get OpenAPI specification', action: 'Get spec' },
    { name: 'Estimate Gas Price', value: 'estimateGasPrice', description: 'Get current gas price estimate', action: 'Estimate gas price' }
  ],
  default: 'getLedgerInfo',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['event'],
    },
  },
  options: [
    {
      name: 'Get Account Events',
      value: 'getAccountEvents',
      description: 'Get events by account and creation number',
      action: 'Get account events',
    },
    {
      name: 'Get Events by Event Handle',
      value: 'getEventsByEventHandle',
      description: 'Get events by event handle',
      action: 'Get events by event handle',
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
			resource: ['table'],
		},
	},
	options: [
		{
			name: 'Get Table Item',
			value: 'getTableItem',
			description: 'Get table item by handle and key',
			action: 'Get table item',
		},
		{
			name: 'Get Raw Table Item',
			value: 'getRawTableItem',
			description: 'Get raw table item',
			action: 'Get raw table item',
		},
	],
	default: 'getTableItem',
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
	displayName: 'Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getAccount', 'getAccountResources', 'getAccountResource', 'getAccountModules', 'getAccountModule'],
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
			resource: ['account'],
			operation: ['getAccountResource'],
		},
	},
	default: '',
	description: 'The resource type to retrieve',
},
{
	displayName: 'Module Name',
	name: 'moduleName',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getAccountModule'],
		},
	},
	default: '',
	description: 'The module name to retrieve',
},
{
	displayName: 'Ledger Version',
	name: 'ledgerVersion',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getAccountResources', 'getAccountResource', 'getAccountModules', 'getAccountModule'],
		},
	},
	default: '',
	description: 'Ledger version to query at (optional)',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getAccountResources', 'getAccountModules'],
		},
	},
	default: 100,
	description: 'Maximum number of items to return',
},
{
	displayName: 'Start',
	name: 'start',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getAccountResources', 'getAccountModules'],
		},
	},
	default: '',
	description: 'Starting point for pagination',
},
{
	displayName: 'Start',
	name: 'start',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactions'],
		},
	},
	default: 0,
	description: 'Starting position for pagination',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transaction'],
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
			resource: ['transaction'],
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
			resource: ['transaction'],
			operation: ['submitTransaction'],
		},
	},
	default: '{}',
	description: 'The signed transaction data to submit',
},
{
	displayName: 'Transaction Data',
	name: 'transactionData',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
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
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['simulateTransaction'],
		},
	},
	default: false,
	description: 'Whether to estimate the gas unit price',
},
{
	displayName: 'Estimate Max Gas Amount',
	name: 'estimateMaxGasAmount',
	type: 'boolean',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['simulateTransaction'],
		},
	},
	default: false,
	description: 'Whether to estimate the maximum gas amount',
},
{
	displayName: 'Estimate Prioritized Gas Unit Price',
	name: 'estimatePrioritizedGasUnitPrice',
	type: 'boolean',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['simulateTransaction'],
		},
	},
	default: false,
	description: 'Whether to estimate the prioritized gas unit price',
},
{
	displayName: 'Transaction Hash',
	name: 'txnHash',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionByHash'],
		},
	},
	default: '',
	description: 'The transaction hash to lookup',
},
{
	displayName: 'Transaction Version',
	name: 'txnVersion',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionByVersion'],
		},
	},
	default: 0,
	description: 'The transaction version to lookup',
},
{
	displayName: 'Transactions Data',
	name: 'transactionsData',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['submitBatchTransactions'],
		},
	},
	default: '[]',
	description: 'Array of signed transaction data to submit',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
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
      resource: ['transaction'],
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
      resource: ['transaction'],
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
      resource: ['block'],
      operation: ['getBlockByHeight'],
    },
  },
  default: 0,
  description: 'The height of the block to retrieve',
},
{
  displayName: 'With Transactions',
  name: 'withTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
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
      resource: ['block'],
      operation: ['getBlockByVersion'],
    },
  },
  default: 0,
  description: 'The version of the block to retrieve',
},
{
  displayName: 'With Transactions',
  name: 'withTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByVersion'],
    },
  },
  default: false,
  description: 'Whether to include transactions in the response',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['event'],
      operation: ['getAccountEvents', 'getEventsByEventHandle'],
    },
  },
  default: '',
  description: 'The account address',
},
{
  displayName: 'Creation Number',
  name: 'creation_number',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['event'],
      operation: ['getAccountEvents'],
    },
  },
  default: '',
  description: 'The creation number for the event',
},
{
  displayName: 'Event Handle',
  name: 'event_handle',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['event'],
      operation: ['getEventsByEventHandle'],
    },
  },
  default: '',
  description: 'The event handle identifier',
},
{
  displayName: 'Field Name',
  name: 'field_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['event'],
      operation: ['getEventsByEventHandle'],
    },
  },
  default: '',
  description: 'The field name for the event handle',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['event'],
      operation: ['getAccountEvents', 'getEventsByEventHandle'],
    },
  },
  default: 0,
  description: 'The starting sequence number for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['event'],
      operation: ['getAccountEvents', 'getEventsByEventHandle'],
    },
  },
  default: 25,
  description: 'The maximum number of events to return',
},
{
  displayName: 'Event Key',
  name: 'event_key',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['event'],
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
      resource: ['event'],
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
      resource: ['event'],
      operation: ['getEventsByKey'],
    },
  },
  default: 25,
  description: 'Maximum number of events to return',
},
{
	displayName: 'Table Handle',
	name: 'tableHandle',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['table'],
			operation: ['getTableItem', 'getRawTableItem'],
		},
	},
	default: '',
	description: 'The handle of the table',
},
{
	displayName: 'Key Type',
	name: 'keyType',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['table'],
			operation: ['getTableItem'],
		},
	},
	default: '',
	description: 'The type of the key',
},
{
	displayName: 'Value Type',
	name: 'valueType',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['table'],
			operation: ['getTableItem'],
		},
	},
	default: '',
	description: 'The type of the value',
},
{
	displayName: 'Key',
	name: 'key',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['table'],
			operation: ['getTableItem', 'getRawTableItem'],
		},
	},
	default: '',
	description: 'The key to look up in the table',
},
{
	displayName: 'Ledger Version',
	name: 'ledgerVersion',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['table'],
			operation: ['getTableItem', 'getRawTableItem'],
		},
	},
	default: '',
	description: 'Ledger version to get state of table at (optional)',
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
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      case 'ledger':
        return [await executeLedgerOperations.call(this, items)];
      case 'event':
        return [await executeEventOperations.call(this, items)];
      case 'table':
        return [await executeTableOperations.call(this, items)];
      case 'coins':
        return [await executeCoinsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountOperations(
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
							'Accept': 'application/json',
						},
						json: true,
					};

					if (credentials.apiKey) {
						options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
					}

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAccountResources': {
					const address = this.getNodeParameter('address', i) as string;
					const ledgerVersion = this.getNodeParameter('ledgerVersion', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					const start = this.getNodeParameter('start', i) as string;

					const queryParams = new URLSearchParams();
					if (ledgerVersion) queryParams.append('ledger_version', ledgerVersion);
					if (limit) queryParams.append('limit', limit.toString());
					if (start) queryParams.append('start', start);

					const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/accounts/${address}/resources${queryString}`,
						headers: {
							'Accept': 'application/json',
						},
						json: true,
					};

					if (credentials.apiKey) {
						options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
					}

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAccountResource': {
					const address = this.getNodeParameter('address', i) as string;
					const resourceType = this.getNodeParameter('resourceType', i) as string;
					const ledgerVersion = this.getNodeParameter('ledgerVersion', i) as string;

					const queryParams = new URLSearchParams();
					if (ledgerVersion) queryParams.append('ledger_version', ledgerVersion);

					const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/accounts/${address}/resource/${resourceType}${queryString}`,
						headers: {
							'Accept': 'application/json',
						},
						json: true,
					};

					if (credentials.apiKey) {
						options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
					}

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAccountModules': {
					const address = this.getNodeParameter('address', i) as string;
					const ledgerVersion = this.getNodeParameter('ledgerVersion', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					const start = this.getNodeParameter('start', i) as string;

					const queryParams = new URLSearchParams();
					if (ledgerVersion) queryParams.append('ledger_version', ledgerVersion);
					if (limit) queryParams.append('limit', limit.toString());
					if (start) queryParams.append('start', start);

					const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/accounts/${address}/modules${queryString}`,
						headers: {
							'Accept': 'application/json',
						},
						json: true,
					};

					if (credentials.apiKey) {
						options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
					}

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAccountModule': {
					const address = this.getNodeParameter('address', i) as string;
					const moduleName = this.getNodeParameter('moduleName', i) as string;
					const ledgerVersion = this.getNodeParameter('ledgerVersion', i) as string;

					const queryParams = new URLSearchParams();
					if (ledgerVersion) queryParams.append('ledger_version', ledgerVersion);

					const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/accounts/${address}/module/${moduleName}${queryString}`,
						headers: {
							'Accept': 'application/json',
						},
						json: true,
					};

					if (credentials.apiKey) {
						options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
					}

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
				if (error.httpCode) {
					throw new NodeApiError(this.getNode(), error);
				}
				throw new NodeOperationError(this.getNode(), error.message);
			}
		}
	}

	return returnData;
}

async function executeTransactionOperations(
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

				case 'getTransactionByHash': {
					const txnHash = this.getNodeParameter('txnHash', i) as string;
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/transactions/by_hash/${txnHash}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Accept': 'application/json',
						},
						json: true,
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransactionByVersion': {
					const txnVersion = this.getNodeParameter('txnVersion', i) as number;
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/transactions/by_version/${txnVersion}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Accept': 'application/json',
						},
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

async function executeBlockOperations(
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
          
          let url = `${credentials.baseUrl}/blocks/by_height/${blockHeight}`;
          if (withTransactions) {
            url += '?with_transactions=true';
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Accept': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockByVersion': {
          const version = this.getNodeParameter('version', i) as number;
          const withTransactions = this.getNodeParameter('withTransactions', i, false) as boolean;
          
          let url = `${credentials.baseUrl}/blocks/by_version/${version}`;
          if (withTransactions) {
            url += '?with_transactions=true';
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Accept': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

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
        if (error.statusCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeLedgerOperations(
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
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Accept': 'application/json'
            },
            json: true
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        case 'getSpec': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/spec`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Accept': 'application/json'
            },
            json: true
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
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
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
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeEventOperations(
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
          const creationNumber = this.getNodeParameter('creation_number', i) as string;
          const start = this.getNodeParameter('start', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const qs: any = {};
          if (start !== undefined) qs.start = start;
          if (limit !== undefined) qs.limit = limit;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/events/${creationNumber}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Accept': 'application/json',
            },
            qs,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getEventsByEventHandle': {
          const address = this.getNodeParameter('address', i) as string;
          const eventHandle = this.getNodeParameter('event_handle', i) as string;
          const fieldName = this.getNodeParameter('field_name', i) as string;
          const start = this.getNodeParameter('start', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const qs: any = {};
          if (start !== undefined) qs.start = start;
          if (limit !== undefined) qs.limit = limit;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${address}/events/${eventHandle}/${fieldName}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Accept': 'application/json',
            },
            qs,
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
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
            { itemIndex: i },
          );
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
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeTableOperations(
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
				case 'getTableItem': {
					const tableHandle = this.getNodeParameter('tableHandle', i) as string;
					const keyType = this.getNodeParameter('keyType', i) as string;
					const valueType = this.getNodeParameter('valueType', i) as string;
					const key = this.getNodeParameter('key', i) as string;
					const ledgerVersion = this.getNodeParameter('ledgerVersion', i) as string;

					const requestBody: any = {
						key_type: keyType,
						value_type: valueType,
						key: key,
					};

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/tables/${tableHandle}/item`,
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json',
						},
						body: JSON.stringify(requestBody),
						json: true,
					};

					if (credentials.apiKey) {
						options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
					}

					if (ledgerVersion) {
						options.qs = { ledger_version: ledgerVersion };
					}

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getRawTableItem': {
					const tableHandle = this.getNodeParameter('tableHandle', i) as string;
					const key = this.getNodeParameter('key', i) as string;
					const ledgerVersion = this.getNodeParameter('ledgerVersion', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/tables/${tableHandle}/raw_item`,
						headers: {
							'Accept': 'application/json',
						},
						qs: {
							key: key,
						},
						json: true,
					};

					if (credentials.apiKey) {
						options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
					}

					if (ledgerVersion) {
						options.qs.ledger_version = ledgerVersion;
					}

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
				throw error;
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