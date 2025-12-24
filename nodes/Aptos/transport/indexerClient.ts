/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Aptos Indexer Client Transport
 *
 * Provides GraphQL client for querying the Aptos Indexer.
 * The Indexer provides historical and aggregate data about on-chain activity.
 */

import { GraphQLClient } from 'graphql-request';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { NETWORKS } from '../constants/networks';

/**
 * Get indexer URL from credentials
 */
export function getIndexerUrl(credentials: ICredentialDataDecryptedObject): string {
  const network = credentials.network as string;

  if (network === 'custom') {
    const customUrl = credentials.indexerUrl as string;
    if (!customUrl) {
      throw new Error('Indexer URL is required for custom network');
    }
    return customUrl;
  }

  const networkConfig = NETWORKS[network];
  if (!networkConfig) {
    throw new Error(`Unknown network: ${network}`);
  }

  return networkConfig.indexerUrl;
}

/**
 * Create a GraphQL client for the Aptos Indexer
 */
export function createIndexerClient(credentials: ICredentialDataDecryptedObject): GraphQLClient {
  const url = getIndexerUrl(credentials);
  const apiKey = credentials.apiKey as string;
  const customHeaders = credentials.customHeaders as { headers?: Array<{ name: string; value: string }> };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (customHeaders?.headers) {
    for (const header of customHeaders.headers) {
      headers[header.name] = header.value;
    }
  }

  return new GraphQLClient(url, { headers });
}

/**
 * Common Indexer GraphQL queries
 */
export const INDEXER_QUERIES = {
  /**
   * Get account transactions with details
   */
  accountTransactions: `
    query GetAccountTransactions($address: String!, $limit: Int, $offset: Int) {
      account_transactions(
        where: { account_address: { _eq: $address } }
        order_by: { transaction_version: desc }
        limit: $limit
        offset: $offset
      ) {
        transaction_version
        account_address
        coin_activities {
          activity_type
          amount
          coin_type
          entry_function_id_str
          is_gas_fee
          is_transaction_success
          transaction_timestamp
        }
      }
    }
  `,

  /**
   * Get token activities for an account
   */
  tokenActivities: `
    query GetTokenActivities($address: String!, $limit: Int, $offset: Int) {
      token_activities_v2(
        where: {
          _or: [
            { from_address: { _eq: $address } }
            { to_address: { _eq: $address } }
          ]
        }
        order_by: { transaction_version: desc }
        limit: $limit
        offset: $offset
      ) {
        transaction_version
        transaction_timestamp
        token_data_id
        from_address
        to_address
        type
        token_amount
        token_standard
        current_token_data {
          token_name
          collection_id
          description
          token_uri
        }
      }
    }
  `,

  /**
   * Get coin activities for an account
   */
  coinActivities: `
    query GetCoinActivities($address: String!, $limit: Int, $offset: Int) {
      coin_activities(
        where: { owner_address: { _eq: $address } }
        order_by: { transaction_version: desc }
        limit: $limit
        offset: $offset
      ) {
        activity_type
        amount
        coin_type
        entry_function_id_str
        event_account_address
        event_creation_number
        event_sequence_number
        is_gas_fee
        is_transaction_success
        owner_address
        transaction_timestamp
        transaction_version
      }
    }
  `,

  /**
   * Get account coins/token balances
   */
  accountCoins: `
    query GetAccountCoins($address: String!) {
      current_fungible_asset_balances(
        where: { owner_address: { _eq: $address } }
      ) {
        amount
        asset_type
        is_frozen
        is_primary
        last_transaction_timestamp
        last_transaction_version
        owner_address
        storage_id
        token_standard
        metadata {
          name
          symbol
          decimals
          asset_type
          icon_uri
          project_uri
        }
      }
    }
  `,

  /**
   * Get account NFTs (Digital Assets)
   */
  accountNfts: `
    query GetAccountNFTs($address: String!, $limit: Int, $offset: Int) {
      current_token_ownerships_v2(
        where: { owner_address: { _eq: $address }, amount: { _gt: "0" } }
        order_by: { last_transaction_version: desc }
        limit: $limit
        offset: $offset
      ) {
        token_data_id
        amount
        owner_address
        last_transaction_timestamp
        last_transaction_version
        is_soulbound_v2
        token_standard
        current_token_data {
          token_name
          token_uri
          description
          collection_id
          current_collection {
            collection_name
            creator_address
            description
            uri
          }
        }
      }
    }
  `,

  /**
   * Get collection data
   */
  collectionData: `
    query GetCollectionData($collectionId: String!) {
      current_collections_v2(
        where: { collection_id: { _eq: $collectionId } }
      ) {
        collection_id
        collection_name
        creator_address
        current_supply
        description
        max_supply
        mutable_description
        mutable_uri
        table_handle_v1
        token_standard
        total_minted_v2
        uri
      }
    }
  `,

  /**
   * Get token data
   */
  tokenData: `
    query GetTokenData($tokenDataId: String!) {
      current_token_datas_v2(
        where: { token_data_id: { _eq: $tokenDataId } }
      ) {
        token_data_id
        token_name
        token_uri
        description
        token_standard
        collection_id
        decimals
        is_fungible_v2
        largest_property_version_v1
        maximum
        supply
        current_collection {
          collection_name
          creator_address
          description
          uri
        }
        current_token_ownerships {
          amount
          owner_address
        }
      }
    }
  `,

  /**
   * Get events by type
   */
  eventsByType: `
    query GetEventsByType($eventType: String!, $limit: Int, $offset: Int) {
      events(
        where: { type: { _eq: $eventType } }
        order_by: { transaction_version: desc }
        limit: $limit
        offset: $offset
      ) {
        account_address
        creation_number
        data
        event_index
        sequence_number
        transaction_block_height
        transaction_version
        type
      }
    }
  `,

  /**
   * Get ledger info
   */
  ledgerInfo: `
    query GetLedgerInfo {
      ledger_infos {
        chain_id
      }
    }
  `,

  /**
   * Get processor status
   */
  processorStatus: `
    query GetProcessorStatus {
      processor_status {
        processor
        last_success_version
        last_updated
        last_transaction_timestamp
      }
    }
  `,

  /**
   * Get validator set
   */
  validatorSet: `
    query GetValidatorSet($limit: Int) {
      current_staking_pool_voter(
        limit: $limit
        order_by: { staking_pool_address: asc }
      ) {
        staking_pool_address
        voter_address
        operator_address
        last_transaction_version
      }
    }
  `,

  /**
   * Get delegated staking activities
   */
  delegatedStaking: `
    query GetDelegatedStaking($address: String!) {
      delegated_staking_activities(
        where: { delegator_address: { _eq: $address } }
        order_by: { transaction_version: desc }
      ) {
        amount
        delegator_address
        event_index
        event_type
        pool_address
        transaction_version
      }
    }
  `,
};

/**
 * Indexer Client Wrapper
 */
export class IndexerClientWrapper {
  private client: GraphQLClient;

  constructor(credentials: ICredentialDataDecryptedObject) {
    this.client = createIndexerClient(credentials);
  }

  /**
   * Execute a custom GraphQL query
   */
  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return this.client.request<T>(query, variables);
  }

  /**
   * Get account transactions
   */
  async getAccountTransactions(
    address: string,
    options?: { limit?: number; offset?: number },
  ) {
    return this.query<{
      account_transactions: Array<{
        transaction_version: string;
        account_address: string;
        coin_activities: Array<{
          activity_type: string;
          amount: string;
          coin_type: string;
          entry_function_id_str: string;
          is_gas_fee: boolean;
          is_transaction_success: boolean;
          transaction_timestamp: string;
        }>;
      }>;
    }>(INDEXER_QUERIES.accountTransactions, {
      address,
      limit: options?.limit ?? 25,
      offset: options?.offset ?? 0,
    });
  }

  /**
   * Get token activities
   */
  async getTokenActivities(
    address: string,
    options?: { limit?: number; offset?: number },
  ) {
    return this.query(INDEXER_QUERIES.tokenActivities, {
      address,
      limit: options?.limit ?? 25,
      offset: options?.offset ?? 0,
    });
  }

  /**
   * Get coin activities
   */
  async getCoinActivities(
    address: string,
    options?: { limit?: number; offset?: number },
  ) {
    return this.query(INDEXER_QUERIES.coinActivities, {
      address,
      limit: options?.limit ?? 25,
      offset: options?.offset ?? 0,
    });
  }

  /**
   * Get account coins
   */
  async getAccountCoins(address: string) {
    return this.query(INDEXER_QUERIES.accountCoins, { address });
  }

  /**
   * Get account NFTs
   */
  async getAccountNfts(
    address: string,
    options?: { limit?: number; offset?: number },
  ) {
    return this.query(INDEXER_QUERIES.accountNfts, {
      address,
      limit: options?.limit ?? 25,
      offset: options?.offset ?? 0,
    });
  }

  /**
   * Get collection data
   */
  async getCollectionData(collectionId: string) {
    return this.query(INDEXER_QUERIES.collectionData, { collectionId });
  }

  /**
   * Get token data
   */
  async getTokenData(tokenDataId: string) {
    return this.query(INDEXER_QUERIES.tokenData, { tokenDataId });
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    eventType: string,
    options?: { limit?: number; offset?: number },
  ) {
    return this.query(INDEXER_QUERIES.eventsByType, {
      eventType,
      limit: options?.limit ?? 25,
      offset: options?.offset ?? 0,
    });
  }

  /**
   * Get processor status
   */
  async getProcessorStatus() {
    return this.query(INDEXER_QUERIES.processorStatus);
  }

  /**
   * Get ledger info
   */
  async getLedgerInfo() {
    return this.query(INDEXER_QUERIES.ledgerInfo);
  }

  /**
   * Get delegated staking for address
   */
  async getDelegatedStaking(address: string) {
    return this.query(INDEXER_QUERIES.delegatedStaking, { address });
  }
}

/**
 * Create a new IndexerClientWrapper from credentials
 */
export function createIndexerClientWrapper(
  credentials: ICredentialDataDecryptedObject,
): IndexerClientWrapper {
  return new IndexerClientWrapper(credentials);
}
