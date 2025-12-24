/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';
import { isValidAddress, normalizeAddress } from '../../utils/accountUtils';
import { octasToApt, formatApt } from '../../utils/unitConverter';

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['account'] } },
    options: [
      { name: 'Check Account Exists', value: 'checkExists', action: 'Check if account exists' },
      { name: 'Create Account', value: 'create', action: 'Create new account' },
      { name: 'Derive Account', value: 'derive', action: 'Derive from mnemonic' },
      { name: 'Get Account', value: 'get', action: 'Get account info' },
      { name: 'Get Account Balance', value: 'getBalance', action: 'Get balance' },
      { name: 'Get Account Modules', value: 'getModules', action: 'Get modules' },
      { name: 'Get Account Resource', value: 'getResource', action: 'Get specific resource' },
      { name: 'Get Account Resources', value: 'getResources', action: 'Get all resources' },
      { name: 'Get Account Transactions', value: 'getTransactions', action: 'Get transactions' },
      { name: 'Get Sequence Number', value: 'getSequenceNumber', action: 'Get sequence number' },
      { name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
    ],
    default: 'get',
  },
];

export const accountFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['account'], operation: ['get', 'getBalance', 'getResources', 'getResource', 'getModules', 'getTransactions', 'checkExists', 'getSequenceNumber'] } },
  },
  {
    displayName: 'Resource Type',
    name: 'resourceType',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
    displayOptions: { show: { resource: ['account'], operation: ['getResource'] } },
  },
  {
    displayName: 'Address to Validate',
    name: 'addressToValidate',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['account'], operation: ['validateAddress'] } },
  },
  {
    displayName: 'Mnemonic Phrase',
    name: 'mnemonic',
    type: 'string',
    typeOptions: { password: true },
    required: true,
    default: '',
    displayOptions: { show: { resource: ['account'], operation: ['derive'] } },
  },
  {
    displayName: 'Derivation Path',
    name: 'derivationPath',
    type: 'string',
    default: "m/44'/637'/0'/0'/0'",
    displayOptions: { show: { resource: ['account'], operation: ['derive'] } },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['account'], operation: ['getTransactions'] } },
    options: [
      { displayName: 'Limit', name: 'limit', type: 'number', default: 25 },
      { displayName: 'Start', name: 'start', type: 'number', default: 0 },
    ],
  },
];

export async function executeAccountOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'get': {
      const address = execFns.getNodeParameter('address', index) as string;
      if (!isValidAddress(address)) throw new Error('Invalid address: ' + address);
      const account = await client.getAccount(normalizeAddress(address));
      return { address: account.address, sequenceNumber: account.sequence_number, authenticationKey: account.authentication_key };
    }
    case 'getBalance': {
      const address = execFns.getNodeParameter('address', index) as string;
      if (!isValidAddress(address)) throw new Error('Invalid address: ' + address);
      const balance = await client.getAccountBalance(normalizeAddress(address));
      return { address: normalizeAddress(address), balanceOctas: balance.toString(), balanceApt: octasToApt(balance), formatted: formatApt(balance) };
    }
    case 'getResources': {
      const address = execFns.getNodeParameter('address', index) as string;
      if (!isValidAddress(address)) throw new Error('Invalid address: ' + address);
      const resources = await client.getAccountResources(normalizeAddress(address));
      return { address: normalizeAddress(address), count: resources.length, resources: resources.map((r) => ({ type: r.type, data: r.data })) };
    }
    case 'getResource': {
      const address = execFns.getNodeParameter('address', index) as string;
      const resourceType = execFns.getNodeParameter('resourceType', index) as string;
      if (!isValidAddress(address)) throw new Error('Invalid address: ' + address);
      const resource = await client.getAccountResource(normalizeAddress(address), resourceType);
      return { address: normalizeAddress(address), type: resource.type, data: resource.data };
    }
    case 'getModules': {
      const address = execFns.getNodeParameter('address', index) as string;
      if (!isValidAddress(address)) throw new Error('Invalid address: ' + address);
      const modules = await client.getAccountModules(normalizeAddress(address));
      return { address: normalizeAddress(address), count: modules.length, modules: modules.map((m) => ({ bytecode: m.bytecode, abi: m.abi })) };
    }
    case 'getTransactions': {
      const address = execFns.getNodeParameter('address', index) as string;
      const options = execFns.getNodeParameter('options', index) as IDataObject;
      if (!isValidAddress(address)) throw new Error('Invalid address: ' + address);
      const transactions = await client.getAccountTransactions(normalizeAddress(address), { start: (options.start as number) || 0, limit: (options.limit as number) || 25 });
      return { address: normalizeAddress(address), count: transactions.length, transactions };
    }
    case 'getSequenceNumber': {
      const address = execFns.getNodeParameter('address', index) as string;
      if (!isValidAddress(address)) throw new Error('Invalid address: ' + address);
      const account = await client.getAccount(normalizeAddress(address));
      return { address: normalizeAddress(address), sequenceNumber: account.sequence_number };
    }
    case 'checkExists': {
      const address = execFns.getNodeParameter('address', index) as string;
      if (!isValidAddress(address)) return { address, exists: false, valid: false, error: 'Invalid address format' };
      const exists = await client.accountExists(normalizeAddress(address));
      return { address: normalizeAddress(address), exists, valid: true };
    }
    case 'validateAddress': {
      const addressToValidate = execFns.getNodeParameter('addressToValidate', index) as string;
      const isValid = isValidAddress(addressToValidate);
      return { address: addressToValidate, valid: isValid, normalized: isValid ? normalizeAddress(addressToValidate) : null };
    }
    case 'derive': {
      const mnemonic = execFns.getNodeParameter('mnemonic', index) as string;
      const derivationPath = execFns.getNodeParameter('derivationPath', index) as string;
      const { Account } = await import('@aptos-labs/ts-sdk');
      const account = Account.fromDerivationPath({ mnemonic, path: derivationPath });
      return { address: account.accountAddress.toString(), publicKey: account.publicKey.toString(), derivationPath };
    }
    case 'create': {
      const { Account } = await import('@aptos-labs/ts-sdk');
      const account = Account.generate();
      return { address: account.accountAddress.toString(), publicKey: account.publicKey.toString(), privateKey: account.privateKey.toString(), note: 'Save private key securely. Fund account to activate on-chain.' };
    }
    default:
      throw new Error('Unsupported account operation: ' + operation);
  }
}
