/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Aptos Faucet Client Transport
 *
 * Provides client for funding test accounts on testnet/devnet.
 */

import axios, { AxiosInstance } from 'axios';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { NETWORKS } from '../constants/networks';

/**
 * Faucet response interface
 */
export interface FaucetResponse {
  txn_hashes: string[];
}

/**
 * Get faucet URL from credentials
 */
export function getFaucetUrl(credentials: ICredentialDataDecryptedObject): string {
  const network = credentials.network as string;

  if (network === 'custom') {
    const customUrl = credentials.faucetUrl as string;
    if (!customUrl) {
      throw new Error('Faucet URL is required for custom network');
    }
    return customUrl;
  }

  if (network === 'mainnet') {
    throw new Error('Faucet is not available on mainnet');
  }

  const networkConfig = NETWORKS[network];
  if (!networkConfig?.faucetUrl) {
    throw new Error(`Faucet not available for network: ${network}`);
  }

  return networkConfig.faucetUrl;
}

/**
 * Create an Axios client for the Aptos Faucet
 */
export function createFaucetHttpClient(credentials: ICredentialDataDecryptedObject): AxiosInstance {
  const url = getFaucetUrl(credentials);
  const authToken = credentials.authToken as string;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return axios.create({
    baseURL: url,
    headers,
    timeout: 30000,
  });
}

/**
 * Faucet Client Wrapper
 */
export class FaucetClientWrapper {
  private httpClient: AxiosInstance;
  private faucetUrl: string;

  constructor(credentials: ICredentialDataDecryptedObject) {
    this.httpClient = createFaucetHttpClient(credentials);
    this.faucetUrl = getFaucetUrl(credentials);
  }

  /**
   * Fund an account with test APT
   *
   * @param address - Account address to fund
   * @param amount - Amount in octas (default: 100000000 = 1 APT)
   * @returns Transaction hashes
   */
  async fundAccount(address: string, amount = 100000000): Promise<FaucetResponse> {
    const response = await this.httpClient.post<FaucetResponse>('/mint', null, {
      params: {
        address,
        amount,
      },
    });
    return response.data;
  }

  /**
   * Check faucet health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get faucet status information
   */
  async getStatus(): Promise<{ healthy: boolean; url: string }> {
    const healthy = await this.checkHealth();
    return {
      healthy,
      url: this.faucetUrl,
    };
  }
}

/**
 * Create a new FaucetClientWrapper from credentials
 */
export function createFaucetClientWrapper(
  credentials: ICredentialDataDecryptedObject,
): FaucetClientWrapper {
  return new FaucetClientWrapper(credentials);
}
