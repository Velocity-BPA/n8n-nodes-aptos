/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Aptos } from '../nodes/Aptos/Aptos.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Aptos Node', () => {
  let node: Aptos;

  beforeAll(() => {
    node = new Aptos();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Aptos');
      expect(node.description.name).toBe('aptos');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.mainnet.aptoslabs.com/v1'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn()
			},
		};
	});

	describe('getAccount operation', () => {
		it('should get account data successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccount')
				.mockReturnValueOnce('0x1234567890abcdef');

			const mockResponse = {
				sequence_number: '123',
				authentication_key: '0xabcdef'
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});

		it('should handle errors in getAccount', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccount')
				.mockReturnValueOnce('invalid-address');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAccountOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toBe('Invalid address');
		});
	});

	describe('getAccountResources operation', () => {
		it('should get account resources successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountResources')
				.mockReturnValueOnce('0x1234567890abcdef')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(10)
				.mockReturnValueOnce('');

			const mockResponse = [{ type: '0x1::coin::CoinStore', data: {} }];
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getAccountResource operation', () => {
		it('should get specific account resource successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountResource')
				.mockReturnValueOnce('0x1234567890abcdef')
				.mockReturnValueOnce('0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>')
				.mockReturnValueOnce('');

			const mockResponse = { type: '0x1::coin::CoinStore', data: { coin: { value: '1000000' } } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getAccountModules operation', () => {
		it('should get account modules successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountModules')
				.mockReturnValueOnce('0x1234567890abcdef')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(10)
				.mockReturnValueOnce('');

			const mockResponse = [{ abi: { name: 'TestModule' } }];
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getAccountModule operation', () => {
		it('should get specific account module successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountModule')
				.mockReturnValueOnce('0x1234567890abcdef')
				.mockReturnValueOnce('TestModule')
				.mockReturnValueOnce('');

			const mockResponse = { abi: { name: 'TestModule', functions: [] } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.mainnet.aptoslabs.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getTransactions', () => {
		it('should get transactions list successfully', async () => {
			const mockResponse = [{ hash: '0x123', version: '1' }];
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactions')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(25);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.mainnet.aptoslabs.com/v1/transactions',
				headers: {
					'Authorization': 'Bearer test-key',
					'Accept': 'application/json',
				},
				qs: { start: 0, limit: 25 },
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getTransactions error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactions')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(25);
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getTransaction', () => {
		it('should get transaction by hash or version successfully', async () => {
			const mockResponse = { hash: '0x123', version: '1' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('0x123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.mainnet.aptoslabs.com/v1/transactions/0x123',
				headers: {
					'Authorization': 'Bearer test-key',
					'Accept': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('submitTransaction', () => {
		it('should submit transaction successfully', async () => {
			const mockTransactionData = { sender: '0x123', sequence_number: '1' };
			const mockResponse = { hash: '0x456', success: true };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('submitTransaction')
				.mockReturnValueOnce(mockTransactionData);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.mainnet.aptoslabs.com/v1/transactions',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: mockTransactionData,
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('simulateTransaction', () => {
		it('should simulate transaction successfully', async () => {
			const mockTransactionData = { sender: '0x123', sequence_number: '1' };
			const mockResponse = { gas_used: '100', success: true };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('simulateTransaction')
				.mockReturnValueOnce(mockTransactionData)
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.mainnet.aptoslabs.com/v1/transactions/simulate',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: mockTransactionData,
				qs: {
					estimate_gas_unit_price: true,
					estimate_prioritized_gas_unit_price: true,
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('submitBatchTransactions', () => {
		it('should submit batch transactions successfully', async () => {
			const mockTransactionsData = [{ sender: '0x123' }, { sender: '0x456' }];
			const mockResponse = { batch_id: 'batch_123', success: true };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('submitBatchTransactions')
				.mockReturnValueOnce(mockTransactionsData);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.mainnet.aptoslabs.com/v1/transactions/batch',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: mockTransactionsData,
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.mainnet.aptoslabs.com/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  describe('getBlockByHeight', () => {
    it('should get block by height successfully', async () => {
      const mockBlock = {
        block_height: '123',
        block_hash: '0xabc123',
        block_timestamp: '1234567890',
        first_version: '456',
        last_version: '789',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlockByHeight')
        .mockReturnValueOnce(123)
        .mockReturnValueOnce(false);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlock);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/blocks/by_height/123',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-key',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockBlock, pairedItem: { item: 0 } }]);
    });

    it('should handle error when getting block by height', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlockByHeight')
        .mockReturnValueOnce(123)
        .mockReturnValueOnce(false);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Block not found' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getBlockByVersion', () => {
    it('should get block by version successfully', async () => {
      const mockBlock = {
        block_height: '456',
        block_hash: '0xdef456',
        block_timestamp: '1234567891',
        first_version: '789',
        last_version: '1000',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlockByVersion')
        .mockReturnValueOnce(789)
        .mockReturnValueOnce(true);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlock);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/blocks/by_version/789?with_transactions=true',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-key',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockBlock, pairedItem: { item: 0 } }]);
    });

    it('should handle error when getting block by version', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBlockByVersion')
        .mockReturnValueOnce(789)
        .mockReturnValueOnce(false);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Version not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Version not found' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Ledger Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.mainnet.aptoslabs.com/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getLedgerInfo operation', () => {
    it('should get ledger info successfully', async () => {
      const mockLedgerInfo = {
        chain_id: 1,
        ledger_version: '123456',
        ledger_timestamp: '1234567890000000'
      };
      
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getLedgerInfo');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockLedgerInfo);

      const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/',
        headers: {
          'Authorization': 'Bearer test-key',
          'Accept': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{
        json: mockLedgerInfo,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getLedgerInfo error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getLedgerInfo');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getSpec operation', () => {
    it('should get OpenAPI spec successfully', async () => {
      const mockSpec = {
        openapi: '3.0.0',
        info: { title: 'Aptos API', version: '1.0' }
      };
      
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getSpec');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSpec);

      const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/spec',
        headers: {
          'Authorization': 'Bearer test-key',
          'Accept': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{
        json: mockSpec,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getSpec error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getSpec');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Spec Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Spec Error' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

    await expect(executeLedgerOperations.call(mockExecuteFunctions, [{ json: {} }]))
      .rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Event Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.mainnet.aptoslabs.com/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAccountEvents', () => {
    it('should get account events successfully', async () => {
      const mockEvents = [
        {
          version: '123',
          guid: { creation_number: '1', account_address: '0x123' },
          sequence_number: '0',
          type: 'test_type',
          data: {},
        },
      ];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountEvents')
        .mockReturnValueOnce('0x123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockEvents);

      const result = await executeEventOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockEvents);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x123/events/1',
        headers: {
          Authorization: 'Bearer test-key',
          Accept: 'application/json',
        },
        qs: { start: 0, limit: 25 },
        json: true,
      });
    });

    it('should handle getAccountEvents error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountEvents')
        .mockReturnValueOnce('0x123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
        new Error('Account not found'),
      );
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeEventOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Account not found');
    });
  });

  describe('getEventsByEventHandle', () => {
    it('should get events by event handle successfully', async () => {
      const mockEvents = [
        {
          version: '123',
          guid: { creation_number: '1', account_address: '0x123' },
          sequence_number: '0',
          type: 'test_type',
          data: {},
        },
      ];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEventsByEventHandle')
        .mockReturnValueOnce('0x123')
        .mockReturnValueOnce('handle123')
        .mockReturnValueOnce('field_name')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockEvents);

      const result = await executeEventOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockEvents);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x123/events/handle123/field_name',
        headers: {
          Authorization: 'Bearer test-key',
          Accept: 'application/json',
        },
        qs: { start: 0, limit: 25 },
        json: true,
      });
    });

    it('should handle getEventsByEventHandle error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEventsByEventHandle')
        .mockReturnValueOnce('0x123')
        .mockReturnValueOnce('handle123')
        .mockReturnValueOnce('field_name')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
        new Error('Event handle not found'),
      );

      await expect(
        executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Event handle not found');
    });
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

    await expect(
      executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]),
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Table Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.mainnet.aptoslabs.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getTableItem operation', () => {
		it('should successfully get table item', async () => {
			const mockResponse = { value: 'test-value' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTableItem')
				.mockReturnValueOnce('0x1234')
				.mockReturnValueOnce('address')
				.mockReturnValueOnce('u64')
				.mockReturnValueOnce('test-key')
				.mockReturnValueOnce('');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTableOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.mainnet.aptoslabs.com/v1/tables/0x1234/item',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer test-key',
				},
				body: JSON.stringify({
					key_type: 'address',
					value_type: 'u64',
					key: 'test-key',
				}),
				json: true,
			});
		});

		it('should handle getTableItem error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTableItem')
				.mockReturnValueOnce('0x1234')
				.mockReturnValueOnce('address')
				.mockReturnValueOnce('u64')
				.mockReturnValueOnce('test-key')
				.mockReturnValueOnce('');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			await expect(executeTableOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
		});
	});

	describe('getRawTableItem operation', () => {
		it('should successfully get raw table item', async () => {
			const mockResponse = { raw_data: 'raw-value' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getRawTableItem')
				.mockReturnValueOnce('0x1234')
				.mockReturnValueOnce('test-key')
				.mockReturnValueOnce('');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTableOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.mainnet.aptoslabs.com/v1/tables/0x1234/raw_item',
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Bearer test-key',
				},
				qs: {
					key: 'test-key',
				},
				json: true,
			});
		});

		it('should handle getRawTableItem error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getRawTableItem')
				.mockReturnValueOnce('0x1234')
				.mockReturnValueOnce('test-key')
				.mockReturnValueOnce('');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			await expect(executeTableOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
		});
	});
});
});
