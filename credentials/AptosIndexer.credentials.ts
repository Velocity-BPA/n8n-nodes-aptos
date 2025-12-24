/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Aptos Indexer Credentials
 *
 * Provides access to the Aptos Indexer GraphQL API for advanced queries.
 */
export class AptosIndexer implements ICredentialType {
  name = 'aptosIndexer';
  displayName = 'Aptos Indexer';
  documentationUrl = 'https://aptos.dev/indexer/indexer-landing';

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
          description: 'Aptos mainnet indexer',
        },
        {
          name: 'Testnet',
          value: 'testnet',
          description: 'Aptos testnet indexer',
        },
        {
          name: 'Devnet',
          value: 'devnet',
          description: 'Aptos devnet indexer',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom indexer endpoint',
        },
      ],
      default: 'mainnet',
      description: 'The Aptos indexer network to connect to',
    },
    {
      displayName: 'Indexer GraphQL Endpoint',
      name: 'indexerUrl',
      type: 'string',
      default: '',
      placeholder: 'https://indexer.mainnet.aptoslabs.com/v1/graphql',
      description: 'The Aptos Indexer GraphQL endpoint URL',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Optional API key for authenticated indexer access',
    },
    {
      displayName: 'Custom Headers',
      name: 'customHeaders',
      type: 'fixedCollection',
      typeOptions: {
        multipleValues: true,
      },
      default: {},
      description: 'Custom headers to include with indexer requests',
      options: [
        {
          name: 'headers',
          displayName: 'Headers',
          values: [
            {
              displayName: 'Name',
              name: 'name',
              type: 'string',
              default: '',
              description: 'Header name',
            },
            {
              displayName: 'Value',
              name: 'value',
              type: 'string',
              default: '',
              description: 'Header value',
            },
          ],
        },
      ],
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{$credentials.apiKey ? "Bearer " + $credentials.apiKey : ""}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.indexerUrl : ($credentials.network === "mainnet" ? "https://indexer.mainnet.aptoslabs.com/v1/graphql" : ($credentials.network === "testnet" ? "https://indexer.testnet.aptoslabs.com/v1/graphql" : "https://indexer.devnet.aptoslabs.com/v1/graphql"))}}',
      url: '',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ ledger_infos { chain_id } }',
      }),
    },
  };
}
