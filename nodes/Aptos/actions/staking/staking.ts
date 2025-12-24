/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Staking Resource Actions
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';

export const stakingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['staking'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get staking' },
      { name: 'List', value: 'list', action: 'List stakings' },
    ],
    default: 'get',
  },
];

export const stakingFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['staking'] } },
  },
];

export async function executeStakingOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  const address = execFns.getNodeParameter('address', index) as string;
  return { resource: 'staking', operation, address, note: 'Operation placeholder' };
}
