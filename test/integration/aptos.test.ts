/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for Aptos node
 * 
 * These tests require network access to Aptos testnet/devnet.
 * Set APTOS_PRIVATE_KEY environment variable to run authenticated tests.
 */

describe('Aptos Integration Tests', () => {
  const SKIP_INTEGRATION = !process.env.RUN_INTEGRATION_TESTS;

  beforeAll(() => {
    if (SKIP_INTEGRATION) {
      console.log('Skipping integration tests. Set RUN_INTEGRATION_TESTS=1 to run.');
    }
  });

  it('should be able to import the node', async () => {
    const { Aptos } = await import('../../nodes/Aptos/Aptos.node');
    expect(Aptos).toBeDefined();
  });

  it('should be able to import the trigger node', async () => {
    const { AptosTrigger } = await import('../../nodes/Aptos/AptosTrigger.node');
    expect(AptosTrigger).toBeDefined();
  });

  it.skip('should connect to testnet', async () => {
    if (SKIP_INTEGRATION) return;
    // Add actual network tests here
  });
});
