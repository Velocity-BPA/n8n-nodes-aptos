/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * DigitalAsset Resource Actions
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { AptosClientWrapper } from '../../transport/aptosClient';

export const digitalAssetOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['digitalAsset'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get digitalAsset' },
      { name: 'List', value: 'list', action: 'List digitalAssets' },
    ],
    default: 'get',
  },
];

export const digitalAssetFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['digitalAsset'] } },
  },
];

export async function executeDigitalAssetOperation(
  execFns: IExecuteFunctions,
  client: AptosClientWrapper,
  operation: string,
  index: number,
): Promise<IDataObject> {
  const address = execFns.getNodeParameter('address', index) as string;
  return { resource: 'digitalAsset', operation, address, note: 'Operation placeholder' };
}
