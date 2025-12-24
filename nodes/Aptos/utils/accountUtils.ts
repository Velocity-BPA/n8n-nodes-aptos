/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Account Utilities for Aptos
 *
 * Provides helper functions for working with Aptos accounts and addresses.
 */

/**
 * Address validation regex (32 bytes hex with 0x prefix)
 */
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{1,64}$/;

/**
 * Validate an Aptos address
 *
 * @param address - Address to validate
 * @returns True if valid Aptos address
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return ADDRESS_REGEX.test(address);
}

/**
 * Normalize an Aptos address to full 64-character hex
 *
 * @param address - Address to normalize
 * @returns Normalized address with 0x prefix and 64 hex chars
 */
export function normalizeAddress(address: string): string {
  if (!address.startsWith('0x')) {
    address = '0x' + address;
  }
  // Remove 0x prefix, pad to 64 chars, add prefix back
  const hex = address.slice(2).toLowerCase();
  return '0x' + hex.padStart(64, '0');
}

/**
 * Shorten address for display
 *
 * @param address - Full address
 * @param startChars - Characters to show at start (default: 6)
 * @param endChars - Characters to show at end (default: 4)
 * @returns Shortened address (e.g., "0x1234...abcd")
 */
export function shortenAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Check if address is a framework address (0x1, 0x3, 0x4)
 *
 * @param address - Address to check
 * @returns True if framework address
 */
export function isFrameworkAddress(address: string): boolean {
  const normalized = normalizeAddress(address);
  const frameworkAddresses = [
    normalizeAddress('0x1'),
    normalizeAddress('0x3'),
    normalizeAddress('0x4'),
  ];
  return frameworkAddresses.includes(normalized);
}

/**
 * Parse derivation path for BIP-44
 *
 * @param path - Derivation path string (e.g., "m/44'/637'/0'/0'/0'")
 * @returns Parsed path components
 */
export function parseDerivationPath(path: string): number[] {
  const components = path
    .replace(/^m\//, '')
    .split('/')
    .map((component) => {
      const isHardened = component.endsWith("'");
      const index = parseInt(component.replace("'", ''), 10);
      return isHardened ? index + 0x80000000 : index;
    });
  return components;
}

/**
 * Generate a resource type string for CoinStore
 *
 * @param coinType - The coin type (e.g., "0x1::aptos_coin::AptosCoin")
 * @returns Full CoinStore resource type
 */
export function getCoinStoreResourceType(coinType: string): string {
  return `0x1::coin::CoinStore<${coinType}>`;
}

/**
 * Parse a Move type from a resource type string
 *
 * @param resourceType - Full resource type string
 * @returns Parsed type components
 */
export function parseMoveType(resourceType: string): {
  address: string;
  module: string;
  name: string;
  typeArgs?: string[];
} {
  // Match pattern: address::module::Name<TypeArgs>
  const match = resourceType.match(/^(0x[a-fA-F0-9]+)::([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z_][a-zA-Z0-9_]*)(?:<(.+)>)?$/);
  
  if (!match) {
    throw new Error(`Invalid Move type: ${resourceType}`);
  }

  const [, address, module, name, typeArgsStr] = match;
  const typeArgs = typeArgsStr ? typeArgsStr.split(',').map((t) => t.trim()) : undefined;

  return { address, module, name, typeArgs };
}

/**
 * Build a fully qualified Move type string
 *
 * @param address - Module address
 * @param module - Module name
 * @param name - Type name
 * @param typeArgs - Optional type arguments
 * @returns Fully qualified type string
 */
export function buildMoveType(
  address: string,
  module: string,
  name: string,
  typeArgs?: string[],
): string {
  const baseType = `${address}::${module}::${name}`;
  if (typeArgs && typeArgs.length > 0) {
    return `${baseType}<${typeArgs.join(', ')}>`;
  }
  return baseType;
}

/**
 * Extract account address from an object address
 *
 * @param objectAddress - Object address
 * @returns Account address that owns the object
 */
export function getAccountFromObjectAddress(objectAddress: string): string {
  // Objects in Aptos are created with a deterministic address
  // The owner is not directly derivable from the object address
  // This is a placeholder - actual ownership must be queried from chain
  return objectAddress;
}

/**
 * Convert hex string to Uint8Array
 *
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Uint8Array of bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 *
 * @param bytes - Uint8Array of bytes
 * @param prefix - Whether to include 0x prefix (default: true)
 * @returns Hex string
 */
export function bytesToHex(bytes: Uint8Array, prefix = true): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return prefix ? '0x' + hex : hex;
}
