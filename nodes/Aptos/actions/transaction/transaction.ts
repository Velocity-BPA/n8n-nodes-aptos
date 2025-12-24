/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';

export const transactionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['transaction'] } },
    options: [
      { name: 'Estimate Gas', value: 'estimateGas', action: 'Estimate gas' },
      { name: 'Get Account Transactions', value: 'getAccountTransactions', action: 'Get account transactions' },
      { name: 'Get Transaction (by Hash)', value: 'getByHash', action: 'Get by hash' },
      { name: 'Get Transaction (by Version)', value: 'getByVersion', action: 'Get by version' },
      { name: 'Simulate Transaction', value: 'simulate', action: 'Simulate transaction' },
      { name: 'Submit Transaction', value: 'submit', action: 'Submit transaction' },
      { name: 'Wait for Transaction', value: 'wait', action: 'Wait for transaction' },
    ],
    default: 'getByHash',
  },
];

export const transactionFields: INodeProperties[] = [
  {
    displayName: 'Transaction Hash',
    name: 'transactionHash',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['transaction'], operation: ['getByHash', 'wait'] } },
  },
  {
    displayName: 'Ledger Version',
    name: 'ledgerVersion',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['transaction'], operation: ['getByVersion'] } },
  },
  {
    displayName: 'Account Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['transaction'], operation: ['getAccountTransactions'] } },
  },
  {
    displayName: 'Function',
    name: 'function',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x1::aptos_account::transfer',
    displayOptions: { show: { resource: ['transaction'], operation: ['submit', 'simulate', 'estimateGas'] } },
  },
  {
    displayName: 'Type Arguments',
    name: 'typeArguments',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['transaction'], operation: ['submit', 'simulate', 'estimateGas'] } },
  },
  {
    displayName: 'Function Arguments',
    name: 'functionArguments',
    type: 'json',
    default: '[]',
    displayOptions: { show: { resource: ['transaction'], operation: ['submit', 'simulate', 'estimateGas'] } },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['transaction'], operation: ['getAccountTransactions'] } },
    options: [
      { displayName: 'Limit', name: 'limit', type: 'number', default: 25 },
      { displayName: 'Start', name: 'start', type: 'number', default: 0 },
    ],
  },
  {
    displayName: 'Gas Options',
    name: 'gasOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['transaction'], operation: ['submit'] } },
    options: [
      { displayName: 'Max Gas Amount', name: 'maxGasAmount', type: 'number', default: 100000 },
      { displayName: 'Gas Unit Price', name: 'gasUnitPrice', type: 'number', default: 100 },
    ],
  },
];

export async function executeTransactionOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'getByHash': {
      const hash = execFns.getNodeParameter('transactionHash', index) as string;
      const tx = await client.getTransactionByHash(hash);
      return { hash: tx.hash, version: tx.version, success: tx.success, vmStatus: tx.vm_status, sender: tx.sender, gasUsed: tx.gas_used, timestamp: tx.timestamp };
    }
    case 'getByVersion': {
      const version = execFns.getNodeParameter('ledgerVersion', index) as number;
      const tx = await client.getTransactionByVersion(version);
      return { hash: tx.hash, version: tx.version, success: tx.success, sender: tx.sender, gasUsed: tx.gas_used };
    }
    case 'getAccountTransactions': {
      const address = execFns.getNodeParameter('address', index) as string;
      const options = execFns.getNodeParameter('options', index) as IDataObject;
      const transactions = await client.getAccountTransactions(address, { start: (options.start as number) || 0, limit: (options.limit as number) || 25 });
      return { address, count: transactions.length, transactions: transactions.map((tx) => ({ hash: tx.hash, version: tx.version, success: tx.success, gasUsed: tx.gas_used })) };
    }
    case 'wait': {
      const hash = execFns.getNodeParameter('transactionHash', index) as string;
      const tx = await client.waitForTransaction(hash);
      return { hash: tx.hash, version: tx.version, success: tx.success, vmStatus: tx.vm_status, gasUsed: tx.gas_used };
    }
    case 'submit': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const functionId = execFns.getNodeParameter('function', index) as string;
      const typeArgsStr = execFns.getNodeParameter('typeArguments', index) as string;
      const functionArgs = execFns.getNodeParameter('functionArguments', index) as string;
      const gasOptions = execFns.getNodeParameter('gasOptions', index) as IDataObject;
      const typeArguments = typeArgsStr ? typeArgsStr.split(',').map((t) => t.trim()) : [];
      const args = JSON.parse(functionArgs || '[]');
      const payload = { function: functionId as any, typeArguments: typeArguments as any, functionArguments: args };
      const pendingTx = await client.submitTransaction(payload, { maxGasAmount: gasOptions.maxGasAmount as number, gasUnitPrice: gasOptions.gasUnitPrice as number });
      const confirmedTx = await client.waitForTransaction(pendingTx.hash);
      return { hash: confirmedTx.hash, version: confirmedTx.version, success: confirmedTx.success, gasUsed: confirmedTx.gas_used };
    }
    case 'simulate': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const functionId = execFns.getNodeParameter('function', index) as string;
      const typeArgsStr = execFns.getNodeParameter('typeArguments', index) as string;
      const functionArgs = execFns.getNodeParameter('functionArguments', index) as string;
      const typeArguments = typeArgsStr ? typeArgsStr.split(',').map((t) => t.trim()) : [];
      const args = JSON.parse(functionArgs || '[]');
      const payload = { function: functionId as any, typeArguments: typeArguments as any, functionArguments: args };
      const simulation = await client.simulateTransaction(payload);
      const sim = simulation[0];
      return { success: sim.success, vmStatus: sim.vm_status, gasUsed: sim.gas_used, gasUnitPrice: sim.gas_unit_price };
    }
    case 'estimateGas': {
      if (!client.hasSigner()) throw new Error('Authentication required');
      const functionId = execFns.getNodeParameter('function', index) as string;
      const typeArgsStr = execFns.getNodeParameter('typeArguments', index) as string;
      const functionArgs = execFns.getNodeParameter('functionArguments', index) as string;
      const typeArguments = typeArgsStr ? typeArgsStr.split(',').map((t) => t.trim()) : [];
      const args = JSON.parse(functionArgs || '[]');
      const payload = { function: functionId as any, typeArguments: typeArguments as any, functionArguments: args };
      const estimate = await client.estimateGas(payload);
      return { gasUsed: estimate.gasUsed, gasUnitPrice: estimate.gasUnitPrice, estimatedCostOctas: estimate.gasUsed * estimate.gasUnitPrice };
    }
    default:
      throw new Error('Unsupported transaction operation: ' + operation);
  }
}
