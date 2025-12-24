/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Move Utilities for Aptos
 *
 * Provides helper functions for working with Move modules, functions, and types.
 */

/**
 * Move function visibility types
 */
export enum MoveVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  FRIEND = 'friend',
  ENTRY = 'entry',
}

/**
 * Move type ability flags
 */
export enum MoveAbility {
  COPY = 'copy',
  DROP = 'drop',
  STORE = 'store',
  KEY = 'key',
}

/**
 * Interface for Move function argument
 */
export interface MoveFunctionArg {
  name: string;
  type: string;
  description?: string;
}

/**
 * Interface for Move function ABI
 */
export interface MoveFunctionAbi {
  name: string;
  visibility: MoveVisibility;
  isEntry: boolean;
  isView: boolean;
  genericTypeParams: string[];
  params: string[];
  return: string[];
}

/**
 * Interface for Move module ABI
 */
export interface MoveModuleAbi {
  address: string;
  name: string;
  friends: string[];
  exposedFunctions: MoveFunctionAbi[];
  structs: MoveStructAbi[];
}

/**
 * Interface for Move struct ABI
 */
export interface MoveStructAbi {
  name: string;
  isNative: boolean;
  abilities: MoveAbility[];
  genericTypeParams: string[];
  fields: Array<{
    name: string;
    type: string;
  }>;
}

/**
 * Parse a fully qualified function identifier
 * Format: address::module::function
 *
 * @param functionId - Fully qualified function ID
 * @returns Parsed components
 */
export function parseFunctionId(functionId: string): {
  address: string;
  module: string;
  function: string;
} {
  const parts = functionId.split('::');
  if (parts.length !== 3) {
    throw new Error(`Invalid function ID format: ${functionId}. Expected address::module::function`);
  }
  return {
    address: parts[0],
    module: parts[1],
    function: parts[2],
  };
}

/**
 * Build a fully qualified function identifier
 *
 * @param address - Module address
 * @param module - Module name
 * @param functionName - Function name
 * @returns Fully qualified function ID
 */
export function buildFunctionId(address: string, module: string, functionName: string): string {
  return `${address}::${module}::${functionName}`;
}

/**
 * Parse Move type string to extract generics
 *
 * @param typeStr - Move type string (e.g., "vector<u8>", "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>")
 * @returns Type name and generic arguments
 */
export function parseMoveTypeString(typeStr: string): {
  baseType: string;
  typeArgs: string[];
} {
  const genericStart = typeStr.indexOf('<');
  if (genericStart === -1) {
    return { baseType: typeStr, typeArgs: [] };
  }

  const baseType = typeStr.slice(0, genericStart);
  const genericPart = typeStr.slice(genericStart + 1, -1);

  // Handle nested generics by tracking depth
  const typeArgs: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of genericPart) {
    if (char === '<') {
      depth++;
      current += char;
    } else if (char === '>') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      typeArgs.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    typeArgs.push(current.trim());
  }

  return { baseType, typeArgs };
}

/**
 * Check if a type is a primitive Move type
 *
 * @param type - Move type string
 * @returns True if primitive type
 */
export function isPrimitiveType(type: string): boolean {
  const primitives = ['bool', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'address', 'signer'];
  return primitives.includes(type.toLowerCase());
}

/**
 * Check if a type is a vector type
 *
 * @param type - Move type string
 * @returns True if vector type
 */
export function isVectorType(type: string): boolean {
  return type.toLowerCase().startsWith('vector<');
}

/**
 * Get the inner type of a vector
 *
 * @param vectorType - Vector type string (e.g., "vector<u8>")
 * @returns Inner type string
 */
export function getVectorInnerType(vectorType: string): string {
  const { typeArgs } = parseMoveTypeString(vectorType);
  return typeArgs[0] || '';
}

/**
 * Check if a type is an optional type (Move option)
 *
 * @param type - Move type string
 * @returns True if optional type
 */
export function isOptionType(type: string): boolean {
  const { baseType } = parseMoveTypeString(type);
  return baseType === '0x1::option::Option' || baseType === 'option::Option';
}

/**
 * Convert JavaScript value to Move argument based on type
 *
 * @param value - JavaScript value
 * @param type - Move type string
 * @returns Converted value for Move
 */
export function convertToMoveArg(value: unknown, type: string): unknown {
  if (isPrimitiveType(type)) {
    switch (type.toLowerCase()) {
      case 'bool':
        return Boolean(value);
      case 'u8':
      case 'u16':
      case 'u32':
        return Number(value);
      case 'u64':
      case 'u128':
      case 'u256':
        return BigInt(value as string | number);
      case 'address':
        return String(value);
      default:
        return value;
    }
  }

  if (isVectorType(type)) {
    const innerType = getVectorInnerType(type);
    if (Array.isArray(value)) {
      return value.map((v) => convertToMoveArg(v, innerType));
    }
    // Handle vector<u8> from hex string
    if (innerType === 'u8' && typeof value === 'string') {
      const hex = value.startsWith('0x') ? value.slice(2) : value;
      return Array.from(Buffer.from(hex, 'hex'));
    }
    return value;
  }

  // For complex types, return as-is
  return value;
}

/**
 * Convert Move value to JavaScript value
 *
 * @param value - Move value from API
 * @param type - Move type string
 * @returns JavaScript value
 */
export function convertFromMoveValue(value: unknown, type?: string): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle string representations of big numbers
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    // Large numbers returned as strings
    if (type && ['u64', 'u128', 'u256'].includes(type.toLowerCase())) {
      return BigInt(value);
    }
    // Small numbers can be converted
    const num = parseInt(value, 10);
    if (num <= Number.MAX_SAFE_INTEGER) {
      return num;
    }
    return BigInt(value);
  }

  // Handle arrays (vectors)
  if (Array.isArray(value)) {
    return value.map((v) => convertFromMoveValue(v));
  }

  // Handle objects (structs)
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = convertFromMoveValue(v);
    }
    return result;
  }

  return value;
}

/**
 * Build entry function payload
 *
 * @param functionId - Fully qualified function ID
 * @param typeArgs - Type arguments
 * @param args - Function arguments
 * @returns Entry function payload
 */
export function buildEntryFunctionPayload(
  functionId: string,
  typeArgs: string[],
  args: unknown[],
): {
  function: string;
  type_arguments: string[];
  arguments: unknown[];
} {
  return {
    function: functionId,
    type_arguments: typeArgs,
    arguments: args,
  };
}

/**
 * Build view function payload
 *
 * @param functionId - Fully qualified function ID
 * @param typeArgs - Type arguments
 * @param args - Function arguments
 * @returns View function payload
 */
export function buildViewFunctionPayload(
  functionId: string,
  typeArgs: string[],
  args: unknown[],
): {
  function: string;
  type_arguments: string[];
  arguments: unknown[];
} {
  return {
    function: functionId,
    type_arguments: typeArgs,
    arguments: args,
  };
}
