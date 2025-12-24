/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Aptos Event Types
 *
 * Standard event types emitted by Aptos framework modules.
 */

import { APTOS_FRAMEWORK, APTOS_TOKEN, APTOS_TOKEN_OBJECTS } from './modules';

/**
 * Coin/Transfer Events
 */
export const COIN_EVENTS = {
  depositEvent: `${APTOS_FRAMEWORK}::coin::DepositEvent`,
  withdrawEvent: `${APTOS_FRAMEWORK}::coin::WithdrawEvent`,
  coinRegisterEvent: `${APTOS_FRAMEWORK}::coin::CoinRegisterEvent`,
} as const;

/**
 * Account Events
 */
export const ACCOUNT_EVENTS = {
  keyRotationEvent: `${APTOS_FRAMEWORK}::account::KeyRotationEvent`,
  coinRegisterEvent: `${APTOS_FRAMEWORK}::account::CoinRegisterEvent`,
} as const;

/**
 * Token V1 Events
 */
export const TOKEN_V1_EVENTS = {
  createCollectionEvent: `${APTOS_TOKEN}::token::CreateCollectionEvent`,
  createTokenDataEvent: `${APTOS_TOKEN}::token::CreateTokenDataEvent`,
  mintTokenEvent: `${APTOS_TOKEN}::token::MintTokenEvent`,
  burnTokenEvent: `${APTOS_TOKEN}::token::BurnTokenEvent`,
  mutateTokenPropertyMapEvent: `${APTOS_TOKEN}::token::MutateTokenPropertyMapEvent`,
  withdrawEvent: `${APTOS_TOKEN}::token::WithdrawEvent`,
  depositEvent: `${APTOS_TOKEN}::token::DepositEvent`,
  offerTokenEvent: `${APTOS_TOKEN}::token_transfers::TokenOfferEvent`,
  cancelOfferEvent: `${APTOS_TOKEN}::token_transfers::TokenCancelOfferEvent`,
  claimTokenEvent: `${APTOS_TOKEN}::token_transfers::TokenClaimEvent`,
} as const;

/**
 * Digital Asset / Token V2 Events
 */
export const DIGITAL_ASSET_EVENTS = {
  createCollectionEvent: `${APTOS_TOKEN_OBJECTS}::collection::CreateCollectionEvent`,
  mintEvent: `${APTOS_TOKEN_OBJECTS}::collection::MintEvent`,
  burnEvent: `${APTOS_TOKEN_OBJECTS}::collection::BurnEvent`,
  mutationEvent: `${APTOS_TOKEN_OBJECTS}::token::MutationEvent`,
  transferEvent: `${APTOS_FRAMEWORK}::object::TransferEvent`,
} as const;

/**
 * Staking Events
 */
export const STAKING_EVENTS = {
  addStakeEvent: `${APTOS_FRAMEWORK}::stake::AddStakeEvent`,
  unlockStakeEvent: `${APTOS_FRAMEWORK}::stake::UnlockStakeEvent`,
  withdrawStakeEvent: `${APTOS_FRAMEWORK}::stake::WithdrawStakeEvent`,
  reactivateStakeEvent: `${APTOS_FRAMEWORK}::stake::ReactivateStakeEvent`,
  distributeRewardsEvent: `${APTOS_FRAMEWORK}::stake::DistributeRewardsEvent`,
  updateNetworkAndFullnodeAddressEvent: `${APTOS_FRAMEWORK}::stake::UpdateNetworkAndFullnodeAddressesEvent`,
  increaseLockedStakeEvent: `${APTOS_FRAMEWORK}::stake::IncreaseLockupEvent`,
  joinValidatorSetEvent: `${APTOS_FRAMEWORK}::stake::JoinValidatorSetEvent`,
  leaveValidatorSetEvent: `${APTOS_FRAMEWORK}::stake::LeaveValidatorSetEvent`,
  setOperatorEvent: `${APTOS_FRAMEWORK}::stake::SetOperatorEvent`,
  setVoterEvent: `${APTOS_FRAMEWORK}::stake::VoteEvent`,
} as const;

/**
 * Governance Events
 */
export const GOVERNANCE_EVENTS = {
  createProposalEvent: `${APTOS_FRAMEWORK}::aptos_governance::CreateProposalEvent`,
  voteEvent: `${APTOS_FRAMEWORK}::aptos_governance::VoteEvent`,
  updateConfigEvent: `${APTOS_FRAMEWORK}::aptos_governance::UpdateConfigEvent`,
} as const;

/**
 * Multisig Events
 */
export const MULTISIG_EVENTS = {
  createTransactionEvent: `${APTOS_FRAMEWORK}::multisig_account::CreateTransactionEvent`,
  voteEvent: `${APTOS_FRAMEWORK}::multisig_account::VoteEvent`,
  executeRejectedTransactionEvent: `${APTOS_FRAMEWORK}::multisig_account::ExecuteRejectedTransactionEvent`,
  transactionExecutionSucceededEvent: `${APTOS_FRAMEWORK}::multisig_account::TransactionExecutionSucceededEvent`,
  transactionExecutionFailedEvent: `${APTOS_FRAMEWORK}::multisig_account::TransactionExecutionFailedEvent`,
  metadataUpdatedEvent: `${APTOS_FRAMEWORK}::multisig_account::MetadataUpdatedEvent`,
  addOwnersEvent: `${APTOS_FRAMEWORK}::multisig_account::AddOwnersEvent`,
  removeOwnersEvent: `${APTOS_FRAMEWORK}::multisig_account::RemoveOwnersEvent`,
  updateSignaturesRequiredEvent: `${APTOS_FRAMEWORK}::multisig_account::UpdateSignaturesRequiredEvent`,
} as const;

/**
 * Block/Epoch Events
 */
export const BLOCK_EVENTS = {
  newBlockEvent: `${APTOS_FRAMEWORK}::block::NewBlockEvent`,
  newEpochEvent: `${APTOS_FRAMEWORK}::reconfiguration::NewEpochEvent`,
} as const;

/**
 * All event types combined
 */
export const ALL_EVENTS = {
  ...COIN_EVENTS,
  ...ACCOUNT_EVENTS,
  ...TOKEN_V1_EVENTS,
  ...DIGITAL_ASSET_EVENTS,
  ...STAKING_EVENTS,
  ...GOVERNANCE_EVENTS,
  ...MULTISIG_EVENTS,
  ...BLOCK_EVENTS,
} as const;

/**
 * Event category enum for triggers
 */
export enum EventCategory {
  ACCOUNT = 'account',
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  DIGITAL_ASSET = 'digitalAsset',
  STAKING = 'staking',
  GOVERNANCE = 'governance',
  MULTISIG = 'multisig',
  BLOCK = 'block',
}
