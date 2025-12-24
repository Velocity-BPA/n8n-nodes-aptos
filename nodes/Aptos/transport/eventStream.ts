/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Aptos Event Stream Transport
 *
 * Provides polling-based event monitoring for the Aptos Trigger node.
 * Since Aptos doesn't have native WebSocket support, we poll for new events.
 */

import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { AptosClientWrapper, createAptosClientWrapper } from './aptosClient';
import { IndexerClientWrapper, createIndexerClientWrapper } from './indexerClient';

/**
 * Event polling options
 */
export interface EventPollingOptions {
  pollInterval: number; // Milliseconds between polls
  startVersion?: number; // Starting ledger version (optional)
  eventTypes?: string[]; // Filter to specific event types
  addresses?: string[]; // Filter to specific addresses
}

/**
 * Event stream state
 */
export interface EventStreamState {
  lastVersion: number;
  lastBlockHeight: number;
  lastTimestamp: number;
}

/**
 * Aptos event from the blockchain
 */
export interface AptosEvent {
  version: string;
  guid: {
    creation_number: string;
    account_address: string;
  };
  sequence_number: string;
  type: string;
  data: Record<string, unknown>;
}

/**
 * Event Stream Manager
 *
 * Manages polling for new events on the Aptos blockchain.
 */
export class EventStreamManager {
  private aptosClient: AptosClientWrapper;
  private indexerClient: IndexerClientWrapper | null = null;
  private state: EventStreamState;
  private pollingTimer: NodeJS.Timeout | null = null;
  private options: EventPollingOptions;

  constructor(
    aptosCredentials: ICredentialDataDecryptedObject,
    indexerCredentials?: ICredentialDataDecryptedObject,
    options: Partial<EventPollingOptions> = {},
  ) {
    this.aptosClient = createAptosClientWrapper(aptosCredentials);

    if (indexerCredentials) {
      this.indexerClient = createIndexerClientWrapper(indexerCredentials);
    }

    this.options = {
      pollInterval: options.pollInterval ?? 5000, // Default 5 seconds
      startVersion: options.startVersion,
      eventTypes: options.eventTypes,
      addresses: options.addresses,
    };

    this.state = {
      lastVersion: options.startVersion ?? 0,
      lastBlockHeight: 0,
      lastTimestamp: Date.now(),
    };
  }

  /**
   * Initialize the event stream with current ledger state
   */
  async initialize(): Promise<void> {
    const ledgerInfo = await this.aptosClient.getLedgerInfo();
    this.state = {
      lastVersion: this.options.startVersion ?? parseInt(ledgerInfo.ledger_version, 10),
      lastBlockHeight: parseInt(ledgerInfo.block_height, 10),
      lastTimestamp: parseInt(ledgerInfo.ledger_timestamp, 10),
    };
  }

  /**
   * Poll for new events since last check
   */
  async pollEvents(): Promise<AptosEvent[]> {
    const ledgerInfo = await this.aptosClient.getLedgerInfo();
    const currentVersion = parseInt(ledgerInfo.ledger_version, 10);

    if (currentVersion <= this.state.lastVersion) {
      return [];
    }

    const events: AptosEvent[] = [];

    // If we have specific addresses to monitor, poll their events
    if (this.options.addresses && this.options.addresses.length > 0) {
      for (const address of this.options.addresses) {
        const accountEvents = await this.getAccountEvents(address);
        events.push(...accountEvents);
      }
    }

    // Update state
    this.state.lastVersion = currentVersion;
    this.state.lastBlockHeight = parseInt(ledgerInfo.block_height, 10);
    this.state.lastTimestamp = parseInt(ledgerInfo.ledger_timestamp, 10);

    // Filter by event types if specified
    if (this.options.eventTypes && this.options.eventTypes.length > 0) {
      return events.filter((e) => this.options.eventTypes!.includes(e.type));
    }

    return events;
  }

  /**
   * Get events for a specific account
   */
  private async getAccountEvents(address: string): Promise<AptosEvent[]> {
    const events: AptosEvent[] = [];

    // Get coin deposit/withdraw events
    try {
      const coinStoreType = '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>';
      const resource = await this.aptosClient.getAccountResource(address, coinStoreType);

      if (resource && resource.data) {
        const data = resource.data as {
          deposit_events?: { counter: string; guid: { id: { creation_num: string; addr: string } } };
          withdraw_events?: { counter: string; guid: { id: { creation_num: string; addr: string } } };
        };

        // Note: This is a simplified approach. In production, you'd want to
        // fetch actual event data from the event stream endpoints
        if (data.deposit_events) {
          events.push({
            version: this.state.lastVersion.toString(),
            guid: {
              creation_number: data.deposit_events.guid.id.creation_num,
              account_address: address,
            },
            sequence_number: data.deposit_events.counter,
            type: '0x1::coin::DepositEvent',
            data: {},
          });
        }
      }
    } catch {
      // Resource may not exist, ignore
    }

    return events;
  }

  /**
   * Get new blocks since last poll
   */
  async pollBlocks(): Promise<Array<{ height: number; version: number; timestamp: number }>> {
    const ledgerInfo = await this.aptosClient.getLedgerInfo();
    const currentHeight = parseInt(ledgerInfo.block_height, 10);

    if (currentHeight <= this.state.lastBlockHeight) {
      return [];
    }

    const blocks: Array<{ height: number; version: number; timestamp: number }> = [];

    // Fetch new blocks (limit to prevent overwhelming)
    const maxBlocks = 10;
    const startHeight = Math.max(this.state.lastBlockHeight + 1, currentHeight - maxBlocks);

    for (let height = startHeight; height <= currentHeight; height++) {
      try {
        const block = await this.aptosClient.getBlockByHeight(height);
        blocks.push({
          height: parseInt(block.block_height, 10),
          version: parseInt(block.first_version, 10),
          timestamp: parseInt(block.block_timestamp, 10),
        });
      } catch {
        // Skip blocks we can't fetch
      }
    }

    this.state.lastBlockHeight = currentHeight;
    return blocks;
  }

  /**
   * Start polling with callback
   */
  startPolling(callback: (events: AptosEvent[]) => void): void {
    if (this.pollingTimer) {
      return;
    }

    const poll = async () => {
      try {
        const events = await this.pollEvents();
        if (events.length > 0) {
          callback(events);
        }
      } catch (error) {
        console.error('Error polling Aptos events:', error);
      }
    };

    this.pollingTimer = setInterval(poll, this.options.pollInterval);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * Get current state
   */
  getState(): EventStreamState {
    return { ...this.state };
  }

  /**
   * Set state (for resuming from checkpoint)
   */
  setState(state: Partial<EventStreamState>): void {
    this.state = { ...this.state, ...state };
  }
}

/**
 * Create a new EventStreamManager
 */
export function createEventStreamManager(
  aptosCredentials: ICredentialDataDecryptedObject,
  indexerCredentials?: ICredentialDataDecryptedObject,
  options?: Partial<EventPollingOptions>,
): EventStreamManager {
  return new EventStreamManager(aptosCredentials, indexerCredentials, options);
}
