/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Event Resource Actions
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';

export const eventOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['event'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get event' },
      { name: 'List', value: 'list', action: 'List events' },
    ],
    default: 'get',
  },
];

export const eventFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['event'] } },
  },
];

export async function executeEventOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  const address = execFns.getNodeParameter('address', index) as string;
  return { resource: 'event', operation, address, note: 'Operation placeholder' };
}
