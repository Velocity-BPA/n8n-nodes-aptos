/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Aptos Client Transport
 *
 * Provides the main client for interacting with the Aptos blockchain.
 * Wraps the official @aptos-labs/ts-sdk with n8n-specific helpers.
 */

import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
  AccountAddress,
  PendingTransactionResponse,
  MoveResource,
  AccountData,
  LedgerInfo,
  Block,
  MoveModuleBytecode,
  UserTransactionResponse,
  InputGenerateTransactionPayloadData,
  InputViewFunctionData,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { NETWORKS, NetworkConfig } from '../constants/networks';

/**
 * Logging notice for BSL 1.1 licensing - logged once per client instantiation
 */
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingNoticeLogged = false;

function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(LICENSING_NOTICE);
    licensingNoticeLogged = true;
  }
}

/**
 * Get network configuration from credential network string
 */
export function getNetworkFromCredentials(
  credentials: ICredentialDataDecryptedObject,
): NetworkConfig {
  const network = credentials.network as string;

  if (network === 'custom') {
    return {
      name: 'Custom',
      chainId: 0,
      nodeUrl: credentials.nodeUrl as string,
      indexerUrl: (credentials.indexerUrl as string) || '',
      faucetUrl: credentials.faucetUrl as string,
    };
  }

  return NETWORKS[network] || NETWORKS.mainnet;
}

/**
 * Get the Aptos SDK Network enum from network string
 */
export function getSdkNetwork(network: string): Network {
  switch (network) {
    case 'mainnet':
      return Network.MAINNET;
    case 'testnet':
      return Network.TESTNET;
    case 'devnet':
      return Network.DEVNET;
    default:
      return Network.CUSTOM;
  }
}

/**
 * Create an Aptos SDK client from credentials
 */
export function createAptosClient(credentials: ICredentialDataDecryptedObject): Aptos {
  logLicensingNotice();

  const networkConfig = getNetworkFromCredentials(credentials);
  const network = credentials.network as string;

  let config: AptosConfig;

  if (network === 'custom') {
    config = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: networkConfig.nodeUrl,
      indexer: networkConfig.indexerUrl || undefined,
      faucet: networkConfig.faucetUrl || undefined,
    });
  } else {
    config = new AptosConfig({
      network: getSdkNetwork(network),
    });
  }

  return new Aptos(config);
}

/**
 * Create an Account from credentials
 */
export function createAccountFromCredentials(
  credentials: ICredentialDataDecryptedObject,
): Account | null {
  const authMethod = credentials.authMethod as string;

  if (authMethod === 'none') {
    return null;
  }

  if (authMethod === 'privateKey') {
    const privateKeyHex = credentials.privateKey as string;
    if (!privateKeyHex) {
      throw new Error('Private key is required for privateKey authentication');
    }
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    return Account.fromPrivateKey({ privateKey });
  }

  if (authMethod === 'mnemonic') {
    const mnemonic = credentials.mnemonic as string;
    const derivationPath = (credentials.derivationPath as string) || "m/44'/637'/0'/0'/0'";

    if (!mnemonic) {
      throw new Error('Mnemonic phrase is required for mnemonic authentication');
    }

    return Account.fromDerivationPath({
      mnemonic,
      path: derivationPath,
    });
  }

  return null;
}

/**
 * Aptos Client wrapper with helper methods
 */
export class AptosClientWrapper {
  public client: Aptos;
  public account: Account | null;
  public networkConfig: NetworkConfig;

  constructor(credentials: ICredentialDataDecryptedObject) {
    this.client = createAptosClient(credentials);
    this.account = createAccountFromCredentials(credentials);
    this.networkConfig = getNetworkFromCredentials(credentials);
  }

  /**
   * Get the signer account address
   */
  getSignerAddress(): string {
    if (!this.account) {
      throw new Error('No account configured. Authentication is required for this operation.');
    }
    return this.account.accountAddress.toString();
  }

  /**
   * Check if the client has a signer account
   */
  hasSigner(): boolean {
    return this.account !== null;
  }

  /**
   * Get ledger info
   */
  async getLedgerInfo(): Promise<LedgerInfo> {
    return this.client.getLedgerInfo();
  }

  /**
   * Get account data
   */
  async getAccount(address: string): Promise<AccountData> {
    return this.client.getAccountInfo({
      accountAddress: AccountAddress.from(address),
    });
  }

  /**
   * Get account balance in octas
   */
  async getAccountBalance(address: string): Promise<bigint> {
    const balance = await this.client.getAccountAPTAmount({
      accountAddress: AccountAddress.from(address),
    });
    return BigInt(balance);
  }

  /**
   * Get account resources
   */
  async getAccountResources(address: string): Promise<MoveResource[]> {
    return this.client.getAccountResources({
      accountAddress: AccountAddress.from(address),
    });
  }

  /**
   * Get specific account resource
   */
  async getAccountResource(address: string, resourceType: string): Promise<MoveResource> {
    return this.client.getAccountResource({
      accountAddress: AccountAddress.from(address),
      resourceType,
    });
  }

  /**
   * Get account modules
   */
  async getAccountModules(address: string): Promise<MoveModuleBytecode[]> {
    return this.client.getAccountModules({
      accountAddress: AccountAddress.from(address),
    });
  }

  /**
   * Get block by height
   */
  async getBlockByHeight(height: number, withTransactions = false): Promise<Block> {
    return this.client.getBlockByHeight({
      blockHeight: height,
      options: { withTransactions },
    });
  }

  /**
   * Get block by version
   */
  async getBlockByVersion(version: number, withTransactions = false): Promise<Block> {
    return this.client.getBlockByVersion({
      ledgerVersion: version,
      options: { withTransactions },
    });
  }

  /**
   * Submit a transaction
   */
  async submitTransaction(
    payload: InputGenerateTransactionPayloadData,
    options?: {
      maxGasAmount?: number;
      gasUnitPrice?: number;
      expireTimestamp?: number;
    },
  ): Promise<PendingTransactionResponse> {
    if (!this.account) {
      throw new Error('Account required to submit transaction');
    }

    const transaction = await this.client.transaction.build.simple({
      sender: this.account.accountAddress,
      data: payload,
      options: {
        maxGasAmount: options?.maxGasAmount,
        gasUnitPrice: options?.gasUnitPrice,
        expireTimestamp: options?.expireTimestamp,
      },
    });

    const signedTx = await this.client.transaction.sign({
      signer: this.account,
      transaction,
    });

    return this.client.transaction.submit.simple({
      senderAuthenticator: signedTx,
      transaction,
    });
  }

  /**
   * Simulate a transaction
   */
  async simulateTransaction(
    payload: InputGenerateTransactionPayloadData,
  ): Promise<UserTransactionResponse[]> {
    if (!this.account) {
      throw new Error('Account required to simulate transaction');
    }

    const transaction = await this.client.transaction.build.simple({
      sender: this.account.accountAddress,
      data: payload,
    });

    return this.client.transaction.simulate.simple({
      signerPublicKey: this.account.publicKey,
      transaction,
    });
  }

  /**
   * Wait for transaction to complete
   */
  async waitForTransaction(
    hash: string,
    options?: { timeoutSecs?: number; checkSuccess?: boolean },
  ): Promise<UserTransactionResponse> {
    return this.client.waitForTransaction({
      transactionHash: hash,
      options: {
        timeoutSecs: options?.timeoutSecs,
        checkSuccess: options?.checkSuccess ?? true,
      },
    }) as Promise<UserTransactionResponse>;
  }

  /**
   * Call a view function
   */
  async viewFunction<T>(payload: InputViewFunctionData): Promise<T[]> {
    return this.client.view<T[]>(payload);
  }

  /**
   * Transfer APT
   */
  async transferApt(
    to: string,
    amount: bigint,
  ): Promise<PendingTransactionResponse> {
    if (!this.account) {
      throw new Error('Account required to transfer APT');
    }

    const transaction = await this.client.transferCoinTransaction({
      sender: this.account.accountAddress,
      recipient: AccountAddress.from(to),
      amount,
    });

    const signedTx = await this.client.transaction.sign({
      signer: this.account,
      transaction,
    });

    return this.client.transaction.submit.simple({
      senderAuthenticator: signedTx,
      transaction,
    });
  }

  /**
   * Get coin balance
   */
  async getCoinBalance(address: string, coinType: string): Promise<bigint> {
    try {
      const balance = await this.client.getAccountCoinAmount({
        accountAddress: AccountAddress.from(address),
        coinType,
      });
      return BigInt(balance);
    } catch {
      return BigInt(0);
    }
  }

  /**
   * Check if account exists
   */
  async accountExists(address: string): Promise<boolean> {
    try {
      await this.getAccount(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string): Promise<UserTransactionResponse> {
    return this.client.getTransactionByHash({
      transactionHash: hash,
    }) as Promise<UserTransactionResponse>;
  }

  /**
   * Get transaction by version
   */
  async getTransactionByVersion(version: number): Promise<UserTransactionResponse> {
    return this.client.getTransactionByVersion({
      ledgerVersion: version,
    }) as Promise<UserTransactionResponse>;
  }

  /**
   * Get account transactions
   */
  async getAccountTransactions(
    address: string,
    options?: { start?: number; limit?: number },
  ): Promise<UserTransactionResponse[]> {
    return this.client.getAccountTransactions({
      accountAddress: AccountAddress.from(address),
      options: {
        offset: options?.start,
        limit: options?.limit,
      },
    }) as Promise<UserTransactionResponse[]>;
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(payload: InputGenerateTransactionPayloadData): Promise<{
    gasUsed: number;
    gasUnitPrice: number;
    maxGasAmount: number;
  }> {
    const simulation = await this.simulateTransaction(payload);
    const result = simulation[0];

    return {
      gasUsed: parseInt(result.gas_used, 10),
      gasUnitPrice: parseInt(result.gas_unit_price, 10),
      maxGasAmount: parseInt(result.max_gas_amount, 10),
    };
  }

  /**
   * Get events by event handle
   */
  async getEventsByEventHandle(
    address: string,
    eventHandleStruct: string,
    fieldName: string,
    options?: { start?: number; limit?: number },
  ) {
    return this.client.getAccountEventsByEventType({
      accountAddress: AccountAddress.from(address),
      eventType: `${eventHandleStruct}::${fieldName}`,
      options: {
        offset: options?.start,
        limit: options?.limit,
      },
    });
  }

  /**
   * Get table item
   */
  async getTableItem<T>(
    tableHandle: string,
    keyType: string,
    valueType: string,
    key: unknown,
  ): Promise<T> {
    return this.client.getTableItem<T>({
      handle: tableHandle,
      data: {
        key_type: keyType,
        value_type: valueType,
        key,
      },
    });
  }
}

/**
 * Create a new AptosClientWrapper from credentials
 */
export function createAptosClientWrapper(
  credentials: ICredentialDataDecryptedObject,
): AptosClientWrapper {
  return new AptosClientWrapper(credentials);
}
