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
 * Aptos Faucet Credentials
 *
 * Provides access to testnet/devnet faucet for funding test accounts.
 */
export class AptosFaucet implements ICredentialType {
  name = 'aptosFaucet';
  displayName = 'Aptos Faucet';
  documentationUrl = 'https://aptos.dev/guides/getting-started';

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Testnet',
          value: 'testnet',
          description: 'Aptos testnet faucet',
        },
        {
          name: 'Devnet',
          value: 'devnet',
          description: 'Aptos devnet faucet',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom faucet endpoint',
        },
      ],
      default: 'testnet',
      description: 'The Aptos faucet network to use',
    },
    {
      displayName: 'Faucet URL',
      name: 'faucetUrl',
      type: 'string',
      default: '',
      placeholder: 'https://faucet.testnet.aptoslabs.com',
      description: 'The Aptos Faucet URL',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Auth Token',
      name: 'authToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Optional authentication token for faucet access',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{$credentials.authToken ? "Bearer " + $credentials.authToken : ""}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.faucetUrl : ($credentials.network === "testnet" ? "https://faucet.testnet.aptoslabs.com" : "https://faucet.devnet.aptoslabs.com")}}',
      url: '/health',
      method: 'GET',
    },
  };
}
