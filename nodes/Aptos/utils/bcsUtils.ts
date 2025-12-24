/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * BCS (Binary Canonical Serialization) Utilities for Aptos
 *
 * Provides helper functions for encoding and decoding Move values
 * using BCS serialization format.
 */

import { hexToBytes, bytesToHex } from './accountUtils';

/**
 * Supported BCS types for encoding/decoding
 */
export type BcsType =
  | 'bool'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'u128'
  | 'u256'
  | 'address'
  | 'string'
  | 'vector'
  | 'struct';

/**
 * BCS value type for encoding
 */
export interface BcsValue {
  type: BcsType;
  value: unknown;
  innerType?: BcsType; // For vectors
}

/**
 * Encode a u8 value
 */
export function encodeU8(value: number): Uint8Array {
  return new Uint8Array([value & 0xff]);
}

/**
 * Encode a u16 value (little-endian)
 */
export function encodeU16(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  bytes[0] = value & 0xff;
  bytes[1] = (value >> 8) & 0xff;
  return bytes;
}

/**
 * Encode a u32 value (little-endian)
 */
export function encodeU32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  bytes[0] = value & 0xff;
  bytes[1] = (value >> 8) & 0xff;
  bytes[2] = (value >> 16) & 0xff;
  bytes[3] = (value >> 24) & 0xff;
  return bytes;
}

/**
 * Encode a u64 value (little-endian)
 */
export function encodeU64(value: bigint | number): Uint8Array {
  const bigValue = BigInt(value);
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number((bigValue >> BigInt(i * 8)) & BigInt(0xff));
  }
  return bytes;
}

/**
 * Encode a u128 value (little-endian)
 */
export function encodeU128(value: bigint | string): Uint8Array {
  const bigValue = typeof value === 'string' ? BigInt(value) : value;
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Number((bigValue >> BigInt(i * 8)) & BigInt(0xff));
  }
  return bytes;
}

/**
 * Encode a u256 value (little-endian)
 */
export function encodeU256(value: bigint | string): Uint8Array {
  const bigValue = typeof value === 'string' ? BigInt(value) : value;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number((bigValue >> BigInt(i * 8)) & BigInt(0xff));
  }
  return bytes;
}

/**
 * Encode a boolean value
 */
export function encodeBool(value: boolean): Uint8Array {
  return new Uint8Array([value ? 1 : 0]);
}

/**
 * Encode an Aptos address (32 bytes)
 */
export function encodeAddress(address: string): Uint8Array {
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  const paddedAddress = cleanAddress.padStart(64, '0');
  return hexToBytes(paddedAddress);
}

/**
 * Encode ULEB128 (unsigned LEB128) for length prefix
 */
export function encodeUleb128(value: number): Uint8Array {
  const bytes: number[] = [];
  do {
    let byte = value & 0x7f;
    value >>= 7;
    if (value !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (value !== 0);
  return new Uint8Array(bytes);
}

/**
 * Encode a string (UTF-8 with ULEB128 length prefix)
 */
export function encodeString(value: string): Uint8Array {
  const encoder = new TextEncoder();
  const stringBytes = encoder.encode(value);
  const lengthPrefix = encodeUleb128(stringBytes.length);
  const result = new Uint8Array(lengthPrefix.length + stringBytes.length);
  result.set(lengthPrefix, 0);
  result.set(stringBytes, lengthPrefix.length);
  return result;
}

/**
 * Encode a vector/array with length prefix
 */
export function encodeVector(items: Uint8Array[]): Uint8Array {
  const lengthPrefix = encodeUleb128(items.length);
  const totalLength = items.reduce((sum, item) => sum + item.length, 0);
  const result = new Uint8Array(lengthPrefix.length + totalLength);

  result.set(lengthPrefix, 0);
  let offset = lengthPrefix.length;
  for (const item of items) {
    result.set(item, offset);
    offset += item.length;
  }

  return result;
}

/**
 * Concatenate multiple Uint8Arrays
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Decode a u64 value from bytes (little-endian)
 */
export function decodeU64(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  for (let i = 0; i < 8 && i < bytes.length; i++) {
    result |= BigInt(bytes[i]) << BigInt(i * 8);
  }
  return result;
}

/**
 * Decode ULEB128 from bytes
 */
export function decodeUleb128(
  bytes: Uint8Array,
  offset = 0,
): { value: number; bytesRead: number } {
  let result = 0;
  let shift = 0;
  let bytesRead = 0;

  while (offset + bytesRead < bytes.length) {
    const byte = bytes[offset + bytesRead];
    result |= (byte & 0x7f) << shift;
    bytesRead++;
    if ((byte & 0x80) === 0) {
      break;
    }
    shift += 7;
  }

  return { value: result, bytesRead };
}

/**
 * Decode a string from BCS bytes
 */
export function decodeString(
  bytes: Uint8Array,
  offset = 0,
): { value: string; bytesRead: number } {
  const { value: length, bytesRead: lengthBytes } = decodeUleb128(bytes, offset);
  const stringBytes = bytes.slice(offset + lengthBytes, offset + lengthBytes + length);
  const decoder = new TextDecoder();
  return {
    value: decoder.decode(stringBytes),
    bytesRead: lengthBytes + length,
  };
}

/**
 * Encode Move script arguments based on type
 */
export function encodeMoveArg(type: string, value: unknown): Uint8Array {
  switch (type.toLowerCase()) {
    case 'bool':
      return encodeBool(value as boolean);
    case 'u8':
      return encodeU8(value as number);
    case 'u16':
      return encodeU16(value as number);
    case 'u32':
      return encodeU32(value as number);
    case 'u64':
      return encodeU64(value as bigint | number);
    case 'u128':
      return encodeU128(value as bigint | string);
    case 'u256':
      return encodeU256(value as bigint | string);
    case 'address':
      return encodeAddress(value as string);
    case 'string':
    case '0x1::string::String':
      return encodeString(value as string);
    default:
      if (type.startsWith('vector<')) {
        const innerType = type.slice(7, -1);
        const items = (value as unknown[]).map((v) => encodeMoveArg(innerType, v));
        return encodeVector(items);
      }
      throw new Error(`Unsupported BCS type: ${type}`);
  }
}

/**
 * Convert BCS-encoded bytes to hex string
 */
export function bcsToHex(bcs: Uint8Array): string {
  return bytesToHex(bcs);
}

/**
 * Convert hex string to BCS bytes
 */
export function hexToBcs(hex: string): Uint8Array {
  return hexToBytes(hex);
}
