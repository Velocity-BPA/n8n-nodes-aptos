/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * SponsoredTx Resource Actions
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';

export const sponsoredTxOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['sponsoredTx'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get sponsoredTx' },
      { name: 'List', value: 'list', action: 'List sponsoredTxs' },
    ],
    default: 'get',
  },
];

export const sponsoredTxFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['sponsoredTx'] } },
  },
];

export async function executeSponsoredTxOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  const address = execFns.getNodeParameter('address', index) as string;
  return { resource: 'sponsoredTx', operation, address, note: 'Operation placeholder' };
}
