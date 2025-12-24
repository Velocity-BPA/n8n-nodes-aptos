/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * MoveView Resource Actions
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';

export const moveViewOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['moveView'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get moveView' },
      { name: 'List', value: 'list', action: 'List moveViews' },
    ],
    default: 'get',
  },
];

export const moveViewFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['moveView'] } },
  },
];

export async function executeMoveViewOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  const address = execFns.getNodeParameter('address', index) as string;
  return { resource: 'moveView', operation, address, note: 'Operation placeholder' };
}
