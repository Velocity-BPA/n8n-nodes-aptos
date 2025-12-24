/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Aptos Module Addresses and Framework Constants
 *
 * These are the well-known addresses for Aptos framework modules and
 * commonly used Move modules on the Aptos blockchain.
 */

/**
 * Core Aptos Framework Addresses
 */
export const APTOS_FRAMEWORK = '0x1';
export const APTOS_STD = '0x1';
export const APTOS_TOKEN = '0x3';
export const APTOS_TOKEN_OBJECTS = '0x4';

/**
 * Standard Module Names
 */
export const MODULES = {
  // Core framework modules (0x1)
  account: `${APTOS_FRAMEWORK}::account`,
  coin: `${APTOS_FRAMEWORK}::coin`,
  aptosCoin: `${APTOS_FRAMEWORK}::aptos_coin`,
  aptosAccount: `${APTOS_FRAMEWORK}::aptos_account`,
  object: `${APTOS_FRAMEWORK}::object`,
  fungibleAsset: `${APTOS_FRAMEWORK}::fungible_asset`,
  primaryFungibleStore: `${APTOS_FRAMEWORK}::primary_fungible_store`,
  stake: `${APTOS_FRAMEWORK}::stake`,
  stakingContract: `${APTOS_FRAMEWORK}::staking_contract`,
  delegation_pool: `${APTOS_FRAMEWORK}::delegation_pool`,
  voting: `${APTOS_FRAMEWORK}::voting`,
  governance: `${APTOS_FRAMEWORK}::aptos_governance`,
  multisigAccount: `${APTOS_FRAMEWORK}::multisig_account`,
  timestamp: `${APTOS_FRAMEWORK}::timestamp`,
  block: `${APTOS_FRAMEWORK}::block`,
  transactionFee: `${APTOS_FRAMEWORK}::transaction_fee`,
  gasSchedule: `${APTOS_FRAMEWORK}::gas_schedule`,

  // Token modules (0x3)
  token: `${APTOS_TOKEN}::token`,
  tokenTransfers: `${APTOS_TOKEN}::token_transfers`,
  tokenCoinSwap: `${APTOS_TOKEN}::token_coin_swap`,

  // Token Objects / Digital Assets (0x4)
  collection: `${APTOS_TOKEN_OBJECTS}::collection`,
  digitalAsset: `${APTOS_TOKEN_OBJECTS}::token`,
  propertyMap: `${APTOS_TOKEN_OBJECTS}::property_map`,
  royalty: `${APTOS_TOKEN_OBJECTS}::royalty`,
  aptos_token: `${APTOS_TOKEN_OBJECTS}::aptos_token`,
} as const;

/**
 * Common Resource Types
 */
export const RESOURCE_TYPES = {
  account: `${APTOS_FRAMEWORK}::account::Account`,
  coinStore: (coinType: string) => `${APTOS_FRAMEWORK}::coin::CoinStore<${coinType}>`,
  coinInfo: (coinType: string) => `${APTOS_FRAMEWORK}::coin::CoinInfo<${coinType}>`,
  aptCoinStore: `${APTOS_FRAMEWORK}::coin::CoinStore<${APTOS_FRAMEWORK}::aptos_coin::AptosCoin>`,
  aptCoinInfo: `${APTOS_FRAMEWORK}::coin::CoinInfo<${APTOS_FRAMEWORK}::aptos_coin::AptosCoin>`,
  object: `${APTOS_FRAMEWORK}::object::ObjectCore`,
  fungibleStore: `${APTOS_FRAMEWORK}::fungible_asset::FungibleStore`,
  metadata: `${APTOS_FRAMEWORK}::fungible_asset::Metadata`,
  stakePool: `${APTOS_FRAMEWORK}::stake::StakePool`,
  delegatedStake: `${APTOS_FRAMEWORK}::delegation_pool::DelegationPool`,
  votingRecords: `${APTOS_FRAMEWORK}::voting::VotingRecords`,
  multisigAccount: `${APTOS_FRAMEWORK}::multisig_account::MultisigAccount`,
  collection: `${APTOS_TOKEN_OBJECTS}::collection::Collection`,
  token: `${APTOS_TOKEN_OBJECTS}::token::Token`,
} as const;

/**
 * APT Coin Type
 */
export const APT_COIN_TYPE = `${APTOS_FRAMEWORK}::aptos_coin::AptosCoin`;

/**
 * Entry Function Identifiers
 */
export const ENTRY_FUNCTIONS = {
  // Coin operations
  transfer: `${APTOS_FRAMEWORK}::aptos_account::transfer`,
  transferCoins: `${APTOS_FRAMEWORK}::aptos_account::transfer_coins`,
  registerCoin: `${APTOS_FRAMEWORK}::managed_coin::register`,

  // Account operations
  rotateAuthKey: `${APTOS_FRAMEWORK}::account::rotate_authentication_key`,

  // Token V1 operations
  createCollection: `${APTOS_TOKEN}::token::create_collection_script`,
  createToken: `${APTOS_TOKEN}::token::create_token_script`,
  mintToken: `${APTOS_TOKEN}::token::mint_script`,
  directTransferToken: `${APTOS_TOKEN}::token::direct_transfer_script`,
  burnToken: `${APTOS_TOKEN}::token::burn`,
  offerToken: `${APTOS_TOKEN}::token_transfers::offer_script`,
  claimToken: `${APTOS_TOKEN}::token_transfers::claim_script`,

  // Digital Asset / Token V2 operations
  createCollectionV2: `${APTOS_TOKEN_OBJECTS}::aptos_token::create_collection`,
  mintDigitalAsset: `${APTOS_TOKEN_OBJECTS}::aptos_token::mint`,
  transferDigitalAsset: `${APTOS_FRAMEWORK}::object::transfer`,
  burnDigitalAsset: `${APTOS_TOKEN_OBJECTS}::aptos_token::burn`,

  // Staking operations
  addStake: `${APTOS_FRAMEWORK}::stake::add_stake`,
  unlockStake: `${APTOS_FRAMEWORK}::stake::unlock`,
  withdrawStake: `${APTOS_FRAMEWORK}::stake::withdraw`,
  reactivateStake: `${APTOS_FRAMEWORK}::stake::reactivate_stake`,

  // Governance operations
  vote: `${APTOS_FRAMEWORK}::aptos_governance::vote`,
  createProposal: `${APTOS_FRAMEWORK}::aptos_governance::create_proposal`,

  // Multisig operations
  createMultisig: `${APTOS_FRAMEWORK}::multisig_account::create`,
  createMultisigTx: `${APTOS_FRAMEWORK}::multisig_account::create_transaction`,
  approveMultisigTx: `${APTOS_FRAMEWORK}::multisig_account::approve_transaction`,
  rejectMultisigTx: `${APTOS_FRAMEWORK}::multisig_account::reject_transaction`,
  executeMultisigTx: `${APTOS_FRAMEWORK}::multisig_account::execute_rejected_transaction`,
} as const;

/**
 * View Function Identifiers
 */
export const VIEW_FUNCTIONS = {
  // Coin views
  balance: `${APTOS_FRAMEWORK}::coin::balance`,
  coinSupply: `${APTOS_FRAMEWORK}::coin::supply`,
  coinDecimals: `${APTOS_FRAMEWORK}::coin::decimals`,
  coinName: `${APTOS_FRAMEWORK}::coin::name`,
  coinSymbol: `${APTOS_FRAMEWORK}::coin::symbol`,

  // Account views
  sequenceNumber: `${APTOS_FRAMEWORK}::account::get_sequence_number`,
  authKey: `${APTOS_FRAMEWORK}::account::get_authentication_key`,

  // Staking views
  stakePoolTotalActiveStake: `${APTOS_FRAMEWORK}::stake::get_stake`,
  validatorState: `${APTOS_FRAMEWORK}::stake::get_validator_state`,

  // Governance views
  votingPower: `${APTOS_FRAMEWORK}::aptos_governance::get_voting_power`,
  proposalState: `${APTOS_FRAMEWORK}::aptos_governance::get_proposal_state`,
} as const;

/**
 * ANS (Aptos Name Service) Constants
 */
export const ANS = {
  address: '0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c',
  routerAddress: '0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c',
  primaryNameReverse: '0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c::domains::ReverseLookupRegistry',
} as const;
