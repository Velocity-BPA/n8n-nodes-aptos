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
describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        token: 'test-api-key',
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

  describe('getAccount', () => {
    it('should successfully get account data', async () => {
      const mockAccount = {
        sequence_number: '12345',
        authentication_key: '0x1234567890abcdef',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccount';
          case 'address': return '0x1';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccount);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockAccount, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors for getAccount', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccount';
          case 'address': return '0xinvalid';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));

      const items = [{ json: {} }];

      await expect(executeAccountsOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Account not found');
    });
  });

  describe('getAccountResources', () => {
    it('should successfully get account resources with pagination', async () => {
      const mockResources = [
        { type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>' },
        { type: '0x1::account::Account' }
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccountResources';
          case 'address': return '0x1';
          case 'ledgerVersion': return '12345';
          case 'start': return '';
          case 'limit': return 100;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResources);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResources, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x1/resources?ledger_version=12345&limit=100',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getAccountModules', () => {
    it('should successfully get account modules', async () => {
      const mockModules = [
        { bytecode: '0xa11ceb0b...' },
        { bytecode: '0xdeadbeef...' }
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccountModules';
          case 'address': return '0x1';
          case 'ledgerVersion': return '';
          case 'start': return '';
          case 'limit': return 25;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockModules);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockModules, pairedItem: { item: 0 } }]);
    });
  });

  describe('getAccountResource', () => {
    it('should successfully get specific account resource', async () => {
      const mockResource = {
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          coin: { value: '1000000' },
          deposit_events: { counter: '5' },
          withdraw_events: { counter: '3' }
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccountResource';
          case 'address': return '0x1';
          case 'resourceType': return '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>';
          case 'ledgerVersion': return '';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResource);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResource, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x1/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });
});

describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearerToken: 'test-bearer-token',
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

  test('submitTransaction should submit transaction successfully', async () => {
    const transactionData = { sender: '0x123', payload: {} };
    const mockResponse = { hash: '0xabc123', success: true };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'submitTransaction';
      if (param === 'transactionData') return transactionData;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.mainnet.aptoslabs.com/v1/transactions',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getTransactions should fetch transactions list', async () => {
    const mockResponse = [{ hash: '0x123' }, { hash: '0x456' }];

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getTransactions';
      if (param === 'start') return 0;
      if (param === 'limit') return 25;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.mainnet.aptoslabs.com/v1/transactions',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getTransaction should fetch specific transaction', async () => {
    const txnHash = '0xabcdef123456';
    const mockResponse = { hash: txnHash, success: true };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getTransaction';
      if (param === 'txnHashOrVersion') return txnHash;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: `https://api.mainnet.aptoslabs.com/v1/transactions/${txnHash}`,
      headers: {
        'Authorization': 'Bearer test-bearer-token',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('simulateTransaction should simulate transaction', async () => {
    const transactionData = { sender: '0x123', payload: {} };
    const mockResponse = { gas_used: '1000', success: true };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'simulateTransaction';
      if (param === 'transactionData') return transactionData;
      if (param === 'estimateGasUnitPrice') return true;
      if (param === 'estimateMaxGasAmount') return false;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.mainnet.aptoslabs.com/v1/transactions/simulate?estimate_gas_unit_price=true',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('submitBatchTransactions should submit multiple transactions', async () => {
    const transactionsArray = [{ sender: '0x123' }, { sender: '0x456' }];
    const mockResponse = { batch_id: 'batch123', success: true };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'submitBatchTransactions';
      if (param === 'transactionsArray') return transactionsArray;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.mainnet.aptoslabs.com/v1/transactions/batch',
      headers: {
        'Authorization': 'Bearer test-bearer-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionsArray),
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getAccountTransactions should fetch account transactions', async () => {
    const address = '0x1234567890abcdef';
    const mockResponse = [{ hash: '0x111' }, { hash: '0x222' }];

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getAccountTransactions';
      if (param === 'address') return address;
      if (param === 'start') return 10;
      if (param === 'limit') return 50;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: `https://api.mainnet.aptoslabs.com/v1/accounts/${address}/transactions?start=10&limit=50`,
      headers: {
        'Authorization': 'Bearer test-bearer-token',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getTransactions';
    });

    const error = new Error('API Error');
    (error as any).httpCode = 400;
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

    await expect(
      executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should handle continueOnFail', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getTransactions';
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: { error: 'API Error' },
      pairedItem: { item: 0 },
    }]);
  });
});

describe('Blocks Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearerToken: 'test-bearer-token',
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

  describe('getBlockByHeight', () => {
    it('should get block by height successfully', async () => {
      const mockBlockData = {
        block_height: '12345',
        block_hash: '0xabc123',
        block_timestamp: '1640995200000000',
        first_version: '100000',
        last_version: '100010',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBlockByHeight';
          case 'blockHeight': return 12345;
          case 'withTransactions': return false;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/blocks/by_height/12345',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        qs: {},
        json: true,
      });

      expect(result).toEqual([{ json: mockBlockData, pairedItem: { item: 0 } }]);
    });

    it('should get block by height with transactions', async () => {
      const mockBlockData = {
        block_height: '12345',
        block_hash: '0xabc123',
        transactions: [],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBlockByHeight';
          case 'blockHeight': return 12345;
          case 'withTransactions': return true;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/blocks/by_height/12345',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        qs: { with_transactions: 'true' },
        json: true,
      });

      expect(result).toEqual([{ json: mockBlockData, pairedItem: { item: 0 } }]);
    });

    it('should handle error when getting block by height', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBlockByHeight';
          case 'blockHeight': return 999999;
          case 'withTransactions': return false;
          default: return undefined;
        }
      });

      const error = new Error('Block not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const items = [{ json: {} }];

      await expect(
        executeBlocksOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('Block not found');
    });
  });

  describe('getBlockByVersion', () => {
    it('should get block by version successfully', async () => {
      const mockBlockData = {
        block_height: '12345',
        block_hash: '0xdef456',
        block_timestamp: '1640995200000000',
        first_version: '100000',
        last_version: '100010',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBlockByVersion';
          case 'version': return 100005;
          case 'withTransactions': return false;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/blocks/by_version/100005',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        qs: {},
        json: true,
      });

      expect(result).toEqual([{ json: mockBlockData, pairedItem: { item: 0 } }]);
    });

    it('should get block by version with transactions', async () => {
      const mockBlockData = {
        block_height: '12345',
        block_hash: '0xdef456',
        transactions: [],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBlockByVersion';
          case 'version': return 100005;
          case 'withTransactions': return true;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/blocks/by_version/100005',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        qs: { with_transactions: 'true' },
        json: true,
      });

      expect(result).toEqual([{ json: mockBlockData, pairedItem: { item: 0 } }]);
    });

    it('should handle error when getting block by version', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBlockByVersion';
          case 'version': return 999999;
          case 'withTransactions': return false;
          default: return undefined;
        }
      });

      const error = new Error('Version not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const items = [{ json: {} }];

      await expect(
        executeBlocksOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('Version not found');
    });
  });

  it('should handle continue on fail', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getBlockByHeight';
        case 'blockHeight': return 12345;
        case 'withTransactions': return false;
        default: return undefined;
      }
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    const error = new Error('API Error');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

    const items = [{ json: {} }];
    const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ 
      json: { error: 'API Error' }, 
      pairedItem: { item: 0 } 
    }]);
  });
});

describe('Coins Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('encodeCoinTransfer', () => {
    it('should encode a coin transfer transaction successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'encodeCoinTransfer';
          case 'sender': return '0x123';
          case 'receiver': return '0x456';
          case 'amount': return '1000000';
          case 'coinType': return '0x1::aptos_coin::AptosCoin';
          default: return '';
        }
      });

      const mockResponse = {
        encoded_transaction: 'encoded_hex_string',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeCoinsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.mainnet.aptoslabs.com/v1/transactions/encode_submission',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        body: expect.objectContaining({
          sender: '0x123',
          payload: {
            type: 'entry_function_payload',
            function: '0x1::coin::transfer',
            type_arguments: ['0x1::aptos_coin::AptosCoin'],
            arguments: ['0x456', '1000000'],
          },
        }),
      });
    });

    it('should handle errors in encode coin transfer', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'encodeCoinTransfer';
          case 'sender': return '0x123';
          case 'receiver': return '0x456';
          case 'amount': return '1000000';
          case 'coinType': return '0x1::aptos_coin::AptosCoin';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeCoinsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getCoinBalance', () => {
    it('should get coin balance successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCoinBalance';
          case 'address': return '0x123';
          case 'coinType': return '0x1::aptos_coin::AptosCoin';
          default: return '';
        }
      });

      const mockResponse = {
        type: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
        data: {
          coin: {
            value: '1000000',
          },
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeCoinsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x123/resource/0x1::coin::CoinStore<0x1%3A%3Aaptos_coin%3A%3AAptosCoin>',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getCoinWithdrawEvents', () => {
    it('should get coin withdraw events successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCoinWithdrawEvents';
          case 'address': return '0x123';
          case 'coinType': return '0x1::aptos_coin::AptosCoin';
          case 'start': return 0;
          case 'limit': return 25;
          default: return '';
        }
      });

      const mockResponse = [
        {
          version: '1234',
          guid: {
            creation_number: '2',
            account_address: '0x123',
          },
          sequence_number: '0',
          type: '0x1::coin::WithdrawEvent',
          data: {
            amount: '1000000',
          },
        },
      ];

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeCoinsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x123/events/0x1::coin::CoinStore<0x1%3A%3Aaptos_coin%3A%3AAptosCoin>/withdraw_events',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
        qs: {
          start: 0,
          limit: 25,
        },
      });
    });
  });

  describe('getCoinDepositEvents', () => {
    it('should get coin deposit events successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCoinDepositEvents';
          case 'address': return '0x123';
          case 'coinType': return '0x1::aptos_coin::AptosCoin';
          case 'start': return 0;
          case 'limit': return 25;
          default: return '';
        }
      });

      const mockResponse = [
        {
          version: '1234',
          guid: {
            creation_number: '3',
            account_address: '0x123',
          },
          sequence_number: '0',
          type: '0x1::coin::DepositEvent',
          data: {
            amount: '1000000',
          },
        },
      ];

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeCoinsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x123/events/0x1::coin::CoinStore<0x1%3A%3Aaptos_coin%3A%3AAptosCoin>/deposit_events',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
        qs: {
          start: 0,
          limit: 25,
        },
      });
    });
  });
});

describe('Events Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getAccountEvents operation', () => {
    it('should get account events successfully', async () => {
      const mockResponse = [
        {
          key: '0x1',
          sequence_number: '0',
          type: 'test_event',
          data: { value: 100 }
        }
      ];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountEvents')
        .mockReturnValueOnce('0x123')
        .mockReturnValueOnce('test_handle')
        .mockReturnValueOnce('test_field')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeEventsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/accounts/0x123/events/test_handle/test_field?start=0&limit=25',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getAccountEvents errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountEvents')
        .mockReturnValueOnce('0x123')
        .mockReturnValueOnce('test_handle')
        .mockReturnValueOnce('test_field')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const items = [{ json: {} }];

      await expect(executeEventsOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('API Error');
    });
  });

  describe('getEventsByKey operation', () => {
    it('should get events by key successfully', async () => {
      const mockResponse = [
        {
          key: '0x1',
          sequence_number: '0',
          type: 'test_event',
          data: { value: 100 }
        }
      ];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEventsByKey')
        .mockReturnValueOnce('0xabc123')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeEventsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/events/0xabc123?start=0&limit=25',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getEventsByKey errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEventsByKey')
        .mockReturnValueOnce('0xabc123')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      const error = new Error('Invalid event key');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const items = [{ json: {} }];

      await expect(executeEventsOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('Invalid event key');
    });
  });
});

describe('LedgerInfo Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearerToken: 'test-bearer-token',
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

  describe('getLedgerInfo operation', () => {
    it('should get ledger info successfully', async () => {
      const mockLedgerInfo = {
        chain_id: 1,
        epoch: '100',
        ledger_version: '1000000',
        oldest_ledger_version: '0',
        ledger_timestamp: '1680000000000000',
        node_role: 'full_node',
        oldest_block_height: '0',
        block_height: '500000',
        git_hash: 'abc123',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLedgerInfo';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockLedgerInfo);

      const items = [{ json: {} }];
      const result = await executeLedgerInfoOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockLedgerInfo);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when getting ledger info', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLedgerInfo';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeLedgerInfoOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('estimateGasPrice operation', () => {
    it('should estimate gas price successfully', async () => {
      const mockGasEstimate = {
        gas_estimate: '100',
        deprioritized_gas_estimate: '200',
        prioritized_gas_estimate: '300',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'estimateGasPrice';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockGasEstimate);

      const items = [{ json: {} }];
      const result = await executeLedgerInfoOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockGasEstimate);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.mainnet.aptoslabs.com/v1/estimate_gas_price',
        headers: {
          'Authorization': 'Bearer test-bearer-token',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when estimating gas price', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'estimateGasPrice';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Gas estimation failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeLedgerInfoOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Gas estimation failed');
    });
  });
});
});
