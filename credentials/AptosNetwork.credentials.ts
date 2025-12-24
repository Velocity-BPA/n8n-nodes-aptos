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
 * Aptos Network Credentials
 *
 * Supports multiple Aptos networks with automatic URL configuration.
 * Handles both private key and mnemonic-based authentication.
 */
export class AptosNetwork implements ICredentialType {
  name = 'aptosNetwork';
  displayName = 'Aptos Network';
  documentationUrl = 'https://aptos.dev/guides/getting-started';

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
          description: 'Aptos production network',
        },
        {
          name: 'Testnet',
          value: 'testnet',
          description: 'Aptos test network for development',
        },
        {
          name: 'Devnet',
          value: 'devnet',
          description: 'Aptos development network (resets periodically)',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom Aptos network endpoint',
        },
      ],
      default: 'mainnet',
      description: 'The Aptos network to connect to',
    },
    {
      displayName: 'Node URL',
      name: 'nodeUrl',
      type: 'string',
      default: '',
      placeholder: 'https://fullnode.mainnet.aptoslabs.com/v1',
      description: 'The Aptos fullnode REST API URL. Auto-populated based on network selection.',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Indexer URL',
      name: 'indexerUrl',
      type: 'string',
      default: '',
      placeholder: 'https://indexer.mainnet.aptoslabs.com/v1/graphql',
      description: 'The Aptos Indexer GraphQL endpoint. Auto-populated based on network selection.',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Faucet URL',
      name: 'faucetUrl',
      type: 'string',
      default: '',
      placeholder: 'https://faucet.testnet.aptoslabs.com',
      description: 'The Aptos Faucet URL (testnet/devnet only)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Authentication Method',
      name: 'authMethod',
      type: 'options',
      options: [
        {
          name: 'Private Key',
          value: 'privateKey',
          description: 'Authenticate using a hex-encoded private key',
        },
        {
          name: 'Mnemonic Phrase',
          value: 'mnemonic',
          description: 'Authenticate using a BIP-39 mnemonic phrase',
        },
        {
          name: 'None (Read-Only)',
          value: 'none',
          description: 'No authentication - read-only operations only',
        },
      ],
      default: 'privateKey',
      description: 'The method to authenticate with the Aptos network',
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '0x...',
      description:
        'The hex-encoded private key for signing transactions. Never share this key.',
      displayOptions: {
        show: {
          authMethod: ['privateKey'],
        },
      },
    },
    {
      displayName: 'Mnemonic Phrase',
      name: 'mnemonic',
      type: 'string',
      typeOptions: {
        password: true,
        rows: 3,
      },
      default: '',
      placeholder: 'word1 word2 word3 ... word12',
      description:
        'The BIP-39 mnemonic phrase (12 or 24 words). Never share this phrase.',
      displayOptions: {
        show: {
          authMethod: ['mnemonic'],
        },
      },
    },
    {
      displayName: 'Derivation Path',
      name: 'derivationPath',
      type: 'string',
      default: "m/44'/637'/0'/0'/0'",
      placeholder: "m/44'/637'/0'/0'/0'",
      description: 'The BIP-44 derivation path for the Aptos account',
      displayOptions: {
        show: {
          authMethod: ['mnemonic'],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.nodeUrl : ($credentials.network === "mainnet" ? "https://fullnode.mainnet.aptoslabs.com/v1" : ($credentials.network === "testnet" ? "https://fullnode.testnet.aptoslabs.com/v1" : "https://fullnode.devnet.aptoslabs.com/v1"))}}',
      url: '/-/healthy',
      method: 'GET',
    },
  };
}
