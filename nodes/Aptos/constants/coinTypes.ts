/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Common Coin Types on Aptos
 *
 * These are well-known coin types that exist on Aptos mainnet.
 */

export const COIN_TYPES = {
  // Native APT token
  APT: '0x1::aptos_coin::AptosCoin',

  // Stablecoins
  USDC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
  USDT: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
  DAI: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::DAI',

  // Wrapped tokens
  WETH: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH',
  WBTC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WBTC',

  // LayerZero bridged tokens
  zUSDC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
  zUSDT: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
} as const;

/**
 * Coin metadata for common coins
 */
export interface CoinMetadata {
  name: string;
  symbol: string;
  decimals: number;
  coinType: string;
}

export const COIN_METADATA: Record<string, CoinMetadata> = {
  APT: {
    name: 'Aptos Coin',
    symbol: 'APT',
    decimals: 8,
    coinType: COIN_TYPES.APT,
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    coinType: COIN_TYPES.USDC,
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    coinType: COIN_TYPES.USDT,
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 8,
    coinType: COIN_TYPES.DAI,
  },
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 8,
    coinType: COIN_TYPES.WETH,
  },
  WBTC: {
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    coinType: COIN_TYPES.WBTC,
  },
};

/**
 * Unit conversion constants
 */
export const OCTAS_PER_APT = 100000000; // 10^8

/**
 * Convert APT to Octas (smallest unit)
 */
export function aptToOctas(apt: number | string): bigint {
  const aptNum = typeof apt === 'string' ? parseFloat(apt) : apt;
  return BigInt(Math.floor(aptNum * OCTAS_PER_APT));
}

/**
 * Convert Octas to APT
 */
export function octasToApt(octas: bigint | number | string): number {
  const octasNum = typeof octas === 'bigint' ? octas : BigInt(octas);
  return Number(octasNum) / OCTAS_PER_APT;
}

/**
 * Format APT amount with decimals
 */
export function formatApt(octas: bigint | number | string, decimals = 8): string {
  const apt = octasToApt(octas);
  return apt.toFixed(decimals);
}
