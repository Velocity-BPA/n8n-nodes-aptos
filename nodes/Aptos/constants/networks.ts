/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Aptos Network Configurations
 *
 * Defines the standard network endpoints for Aptos mainnet, testnet, and devnet.
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  nodeUrl: string;
  indexerUrl: string;
  faucetUrl?: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Mainnet',
    chainId: 1,
    nodeUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
    indexerUrl: 'https://indexer.mainnet.aptoslabs.com/v1/graphql',
  },
  testnet: {
    name: 'Testnet',
    chainId: 2,
    nodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
    indexerUrl: 'https://indexer.testnet.aptoslabs.com/v1/graphql',
    faucetUrl: 'https://faucet.testnet.aptoslabs.com',
  },
  devnet: {
    name: 'Devnet',
    chainId: 0,
    nodeUrl: 'https://fullnode.devnet.aptoslabs.com/v1',
    indexerUrl: 'https://indexer.devnet.aptoslabs.com/v1/graphql',
    faucetUrl: 'https://faucet.devnet.aptoslabs.com',
  },
};

/**
 * Get network configuration by network name
 */
export function getNetworkConfig(network: string): NetworkConfig {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  return config;
}

/**
 * Build network configuration from credentials
 */
export function buildNetworkConfig(
  network: string,
  customNodeUrl?: string,
  customIndexerUrl?: string,
  customFaucetUrl?: string,
): NetworkConfig {
  if (network === 'custom') {
    if (!customNodeUrl) {
      throw new Error('Custom network requires a Node URL');
    }
    return {
      name: 'Custom',
      chainId: 0,
      nodeUrl: customNodeUrl,
      indexerUrl: customIndexerUrl || '',
      faucetUrl: customFaucetUrl,
    };
  }
  return getNetworkConfig(network);
}
