/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';
import { FaucetClientWrapper, createFaucetClientWrapper } from '../../transport/faucetClient';
import { normalizeAddress } from '../../utils/accountUtils';

export const faucetOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['faucet'] } },
    options: [
      { name: 'Check Faucet Status', value: 'checkStatus', action: 'Check faucet status' },
      { name: 'Fund Account', value: 'fundAccount', action: 'Fund account' },
    ],
    default: 'fundAccount',
  },
];

export const faucetFields: INodeProperties[] = [
  {
    displayName: 'Account Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['faucet'], operation: ['fundAccount'] } },
  },
  {
    displayName: 'Amount (Octas)',
    name: 'amount',
    type: 'number',
    default: 100000000,
    description: 'Amount in octas (default: 1 APT = 100000000 octas)',
    displayOptions: { show: { resource: ['faucet'], operation: ['fundAccount'] } },
  },
];

export async function executeFaucetOperation(
  execFns: IExecuteFunctions,
  _client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  const credentials = await execFns.getCredentials('aptosFaucet');
  const faucetClient = createFaucetClientWrapper(credentials);

  switch (operation) {
    case 'fundAccount': {
      const address = execFns.getNodeParameter('address', index) as string;
      const amount = execFns.getNodeParameter('amount', index) as number;
      const result = await faucetClient.fundAccount(normalizeAddress(address), amount);
      return {
        success: true,
        address: normalizeAddress(address),
        amount,
        transactionHashes: result.txn_hashes,
      };
    }
    case 'checkStatus': {
      const status = await faucetClient.getStatus();
      return status;
    }
    default:
      throw new Error('Unsupported faucet operation: ' + operation);
  }
}
