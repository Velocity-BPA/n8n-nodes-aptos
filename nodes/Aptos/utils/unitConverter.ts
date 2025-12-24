/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Unit Converter Utilities for Aptos
 *
 * Handles conversion between APT and Octas, and other coin units.
 */

/**
 * Number of Octas in 1 APT (10^8)
 */
export const OCTAS_PER_APT = BigInt(100000000);

/**
 * Convert APT to Octas (smallest unit)
 *
 * @param apt - Amount in APT (can be string or number)
 * @returns Amount in Octas as bigint
 */
export function aptToOctas(apt: number | string): bigint {
  const aptNum = typeof apt === 'string' ? parseFloat(apt) : apt;
  // Handle floating point precision by multiplying first
  const scaled = Math.round(aptNum * 100000000);
  return BigInt(scaled);
}

/**
 * Convert Octas to APT
 *
 * @param octas - Amount in Octas
 * @returns Amount in APT as number
 */
export function octasToApt(octas: bigint | number | string): number {
  const octasNum = typeof octas === 'bigint' ? octas : BigInt(octas);
  return Number(octasNum) / Number(OCTAS_PER_APT);
}

/**
 * Format APT amount with specified decimals
 *
 * @param octas - Amount in Octas
 * @param decimals - Number of decimal places (default: 8)
 * @returns Formatted APT string
 */
export function formatApt(octas: bigint | number | string, decimals = 8): string {
  const apt = octasToApt(octas);
  return apt.toFixed(decimals);
}

/**
 * Parse a human-readable APT string to Octas
 *
 * @param aptString - Human-readable APT amount (e.g., "1.5", "0.001")
 * @returns Amount in Octas as bigint
 */
export function parseAptString(aptString: string): bigint {
  const cleaned = aptString.replace(/,/g, '').trim();
  return aptToOctas(cleaned);
}

/**
 * Convert amount between units with custom decimals
 *
 * @param amount - Amount to convert
 * @param fromDecimals - Source decimals
 * @param toDecimals - Target decimals
 * @returns Converted amount as bigint
 */
export function convertUnits(
  amount: bigint | number | string,
  fromDecimals: number,
  toDecimals: number,
): bigint {
  const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount);
  const decimalDiff = toDecimals - fromDecimals;

  if (decimalDiff > 0) {
    return amountBigInt * BigInt(10 ** decimalDiff);
  } else if (decimalDiff < 0) {
    return amountBigInt / BigInt(10 ** Math.abs(decimalDiff));
  }
  return amountBigInt;
}

/**
 * Format coin amount with custom decimals
 *
 * @param amount - Amount in smallest unit
 * @param decimals - Coin decimals
 * @param displayDecimals - Number of decimals to display
 * @returns Formatted amount string
 */
export function formatCoinAmount(
  amount: bigint | number | string,
  decimals: number,
  displayDecimals?: number,
): string {
  const amountNum =
    typeof amount === 'bigint' ? Number(amount) : typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = 10 ** decimals;
  const result = amountNum / divisor;
  return result.toFixed(displayDecimals ?? decimals);
}

/**
 * Parse coin amount to smallest unit
 *
 * @param amount - Human-readable amount
 * @param decimals - Coin decimals
 * @returns Amount in smallest unit as bigint
 */
export function parseCoinAmount(amount: number | string, decimals: number): bigint {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  const multiplier = 10 ** decimals;
  return BigInt(Math.round(amountNum * multiplier));
}

/**
 * Check if amount is valid (non-negative, not NaN)
 *
 * @param amount - Amount to validate
 * @returns True if valid
 */
export function isValidAmount(amount: number | string | bigint): boolean {
  try {
    if (typeof amount === 'bigint') {
      return amount >= BigInt(0);
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num >= 0;
  } catch {
    return false;
  }
}

/**
 * Compare two amounts
 *
 * @param a - First amount
 * @param b - Second amount
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareAmounts(
  a: bigint | number | string,
  b: bigint | number | string,
): -1 | 0 | 1 {
  const aBigInt = typeof a === 'bigint' ? a : BigInt(a);
  const bBigInt = typeof b === 'bigint' ? b : BigInt(b);

  if (aBigInt < bBigInt) return -1;
  if (aBigInt > bBigInt) return 1;
  return 0;
}
