/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  aptToOctas,
  octasToApt,
  formatApt,
  isValidAmount,
} from '../../nodes/Aptos/utils/unitConverter';
import {
  isValidAddress,
  normalizeAddress,
  shortenAddress,
} from '../../nodes/Aptos/utils/accountUtils';

describe('Unit Converter Utils', () => {
  describe('aptToOctas', () => {
    it('should convert APT to octas correctly', () => {
      expect(aptToOctas(1)).toBe(BigInt(100000000));
      expect(aptToOctas(0.5)).toBe(BigInt(50000000));
    });

    it('should handle zero', () => {
      expect(aptToOctas(0)).toBe(BigInt(0));
    });
  });

  describe('octasToApt', () => {
    it('should convert octas to APT correctly', () => {
      expect(octasToApt(BigInt(100000000))).toBe(1);
      expect(octasToApt(BigInt(50000000))).toBe(0.5);
    });
  });

  describe('formatApt', () => {
    it('should format APT with default decimals', () => {
      expect(formatApt(BigInt(100000000))).toBe('1.00000000');
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive amounts', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(BigInt(100))).toBe(true);
    });

    it('should reject negative amounts', () => {
      expect(isValidAmount(-1)).toBe(false);
    });
  });
});

describe('Account Utils', () => {
  describe('isValidAddress', () => {
    it('should validate correct addresses', () => {
      expect(isValidAddress('0x1')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('not-an-address')).toBe(false);
    });
  });

  describe('normalizeAddress', () => {
    it('should normalize short addresses', () => {
      const normalized = normalizeAddress('0x1');
      expect(normalized).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long addresses', () => {
      const address = '0x0000000000000000000000000000000000000000000000000000000000000001';
      const shortened = shortenAddress(address);
      expect(shortened).toBe('0x0000...0001');
    });
  });
});
