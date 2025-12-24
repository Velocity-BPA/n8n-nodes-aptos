# n8n-nodes-aptos

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the Aptos blockchain, providing extensive operations for account management, transactions, transfers, NFTs, staking, governance, and Move smart contracts.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Aptos](https://img.shields.io/badge/Aptos-blockchain-06B6D4)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Account Management**: Create, derive, and manage Aptos accounts with ED25519 key support
- **Transactions**: Submit, simulate, and monitor blockchain transactions
- **Transfers**: Send APT and custom coins with gas estimation
- **Coin Operations**: Query balances, register coins, and transfer fungible tokens
- **Block & Ledger**: Access block data, ledger info, and epoch information
- **Faucet Integration**: Fund test accounts on testnet/devnet
- **Utility Functions**: Address validation, unit conversion, and health checks
- **Trigger Node**: Poll for new blocks, balance changes, and transaction confirmations

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-aptos` and agree to the risks
5. Select **Install**

### Manual Installation

```bash
npm install n8n-nodes-aptos
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-aptos.git
cd n8n-nodes-aptos

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aptos

# Restart n8n
n8n start
```

## Credentials Setup

### Aptos Network Credentials

| Field | Description |
|-------|-------------|
| Network | Select mainnet, testnet, devnet, or custom |
| Authentication Method | Private key, mnemonic, or none (read-only) |
| Private Key | Hex-encoded ED25519 private key |
| Mnemonic Phrase | BIP-39 mnemonic (12 or 24 words) |
| Derivation Path | BIP-44 path (default: m/44'/637'/0'/0'/0') |

### Aptos Faucet Credentials (Testnet/Devnet)

| Field | Description |
|-------|-------------|
| Network | Select testnet or devnet |
| Auth Token | Optional authentication token |

## Resources & Operations

### Account Resource
- Get Account - Retrieve account information
- Get Account Balance - Get APT balance
- Get Account Resources - List all resources
- Get Account Resource - Get specific resource
- Get Account Modules - List published modules
- Get Account Transactions - Transaction history
- Get Sequence Number - Current nonce
- Check Account Exists - Verify on-chain existence
- Validate Address - Check address format
- Create Account - Generate new keypair
- Derive Account - Derive from mnemonic

### Transaction Resource
- Submit Transaction - Execute on-chain transaction
- Simulate Transaction - Dry-run without submitting
- Estimate Gas - Calculate gas requirements
- Get Transaction (by Hash) - Lookup by hash
- Get Transaction (by Version) - Lookup by version
- Get Account Transactions - List by account
- Wait for Transaction - Poll until confirmed

### Transfer Resource
- Transfer APT - Send native tokens
- Transfer Coin - Send any coin type
- Check Balance Sufficient - Verify funds
- Estimate Transfer Fee - Calculate gas cost
- Get Coin Store - Query coin storage
- Register Coin - Enable coin type

### Coin Resource
- Get Coin Balance - Query balance
- Get Coin Info - Coin metadata
- Get Coin Supply - Total supply
- Check Coin Exists - Verify coin type
- Register Coin - Enable for account
- Transfer Coin - Send tokens

### Block Resource
- Get Block by Height - Fetch by height
- Get Block by Version - Fetch by version
- Get Latest Block - Current head
- Get Epoch Info - Epoch details

### Utility Resource
- Convert to Octas - APT → octas
- Convert from Octas - octas → APT
- Generate Account - New keypair
- Get Chain ID - Network identifier
- Get Ledger Info - Chain state
- Get Node Info - Node details
- Health Check - Connectivity test
- Validate Address - Format check

### Faucet Resource (Testnet/Devnet)
- Fund Account - Request test APT
- Check Faucet Status - Verify availability

## Trigger Node

The Aptos Trigger node polls for blockchain events:

- **New Block** - Trigger on new blocks
- **New Epoch** - Trigger on epoch changes
- **Balance Changed** - Monitor account balance
- **Transaction Confirmed** - Wait for confirmation

## Usage Examples

### Transfer APT

```json
{
  "resource": "transfer",
  "operation": "transferApt",
  "recipientAddress": "0x123...",
  "amountApt": 1.5
}
```

### Get Account Balance

```json
{
  "resource": "account",
  "operation": "getBalance",
  "address": "0x123..."
}
```

### Submit Transaction

```json
{
  "resource": "transaction",
  "operation": "submit",
  "function": "0x1::aptos_account::transfer",
  "typeArguments": "",
  "functionArguments": "[\"0x456...\", \"100000000\"]"
}
```

### Fund Test Account

```json
{
  "resource": "faucet",
  "operation": "fundAccount",
  "address": "0x123...",
  "amount": 100000000
}
```

## Aptos Concepts

| Term | Description |
|------|-------------|
| APT | Native token of Aptos |
| Octas | Smallest unit (10^-8 APT) |
| Move | Smart contract language |
| Module | Published Move code |
| Resource | Account-stored data |
| Entry Function | Callable Move function |
| View Function | Read-only function |
| Sequence Number | Account transaction nonce |
| Gas Unit Price | Transaction fee pricing |
| Epoch | Staking/consensus period |

## Networks

| Network | Chain ID | Description |
|---------|----------|-------------|
| Mainnet | 1 | Production network |
| Testnet | 2 | Persistent test network |
| Devnet | Variable | Development network (resets) |

## Error Handling

The node provides detailed error messages including:
- Invalid address format errors
- Insufficient balance errors
- Transaction simulation failures
- Network connectivity issues
- Authentication errors

## Security Best Practices

1. **Never share private keys** - Store securely in n8n credentials
2. **Use testnet first** - Test workflows before mainnet
3. **Validate addresses** - Use the validateAddress operation
4. **Estimate gas** - Check costs before submitting
5. **Monitor balances** - Ensure sufficient funds

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Support

- [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aptos/issues)
- [Aptos Documentation](https://aptos.dev)
- [n8n Community](https://community.n8n.io)

## Acknowledgments

- [Aptos Labs](https://aptoslabs.com) - Aptos blockchain
- [n8n](https://n8n.io) - Workflow automation platform
- [@aptos-labs/ts-sdk](https://github.com/aptos-labs/aptos-ts-sdk) - Official TypeScript SDK
