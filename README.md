# n8n-nodes-aptos

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the Aptos blockchain network, providing access to 6 core resources with over 20 operations. Query accounts, transactions, blocks, coin balances, events, and ledger information directly from your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Aptos](https://img.shields.io/badge/Aptos-Blockchain-green)
![REST API](https://img.shields.io/badge/REST-API-orange)
![Web3](https://img.shields.io/badge/Web3-Compatible-purple)

## Features

- **Account Operations** - Retrieve account information, resources, modules, and transaction history
- **Transaction Management** - Submit, query, and simulate transactions with detailed metadata
- **Block Explorer** - Access block data, transaction lists, and blockchain state information
- **Coin & Token Support** - Query coin balances, activities, and token metadata across accounts
- **Event Monitoring** - Stream and filter blockchain events with flexible query parameters
- **Network Information** - Access ledger info, node health, and network configuration data
- **Multiple Networks** - Support for mainnet, testnet, and devnet endpoints
- **Error Handling** - Comprehensive error responses with detailed debugging information

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-aptos`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-aptos
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-aptos.git
cd n8n-nodes-aptos
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aptos
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Aptos API key for authenticated requests | No |
| Network | Target network (mainnet, testnet, devnet) | Yes |
| Base URL | Custom RPC endpoint URL (optional) | No |

## Resources & Operations

### 1. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account | Retrieve account information by address |
| Get Account Resources | List all resources owned by an account |
| Get Account Resource | Get a specific resource from an account |
| Get Account Modules | List all modules published by an account |
| Get Account Module | Get a specific module from an account |
| Get Account Transactions | Get transaction history for an account |

### 2. Transactions

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve transaction details by hash |
| Get Transactions | List recent transactions with pagination |
| Submit Transaction | Submit a signed transaction to the network |
| Simulate Transaction | Simulate transaction execution without submitting |
| Get Transaction by Version | Get transaction by ledger version |
| Batch Get Transactions | Retrieve multiple transactions by hash |

### 3. Blocks

| Operation | Description |
|-----------|-------------|
| Get Block by Height | Retrieve block information by height |
| Get Block by Version | Get block by ledger version |
| Get Latest Block | Get the most recent block |
| Get Block Transactions | List all transactions in a block |

### 4. Coins

| Operation | Description |
|-----------|-------------|
| Get Account Coins | Get all coin balances for an account |
| Get Coin Balance | Get balance of a specific coin type |
| Get Coin Activities | Get coin transfer activities |
| Get Coin Info | Retrieve coin metadata and information |

### 5. Events

| Operation | Description |
|-----------|-------------|
| Get Events by Event Handle | Query events by event handle |
| Get Events by Creation Number | Get events by account and creation number |
| Get Account Events | List all events for an account |
| Stream Events | Subscribe to real-time event stream |

### 6. LedgerInfo

| Operation | Description |
|-----------|-------------|
| Get Ledger Info | Get current ledger state and version |
| Get Node Health | Check node health and status |
| Get Network Config | Retrieve network configuration |
| Get Gas Estimation | Get current gas price estimates |

## Usage Examples

```javascript
// Get account information
{
  "resource": "accounts",
  "operation": "getAccount",
  "address": "0x1"
}
```

```javascript
// Query recent transactions
{
  "resource": "transactions", 
  "operation": "getTransactions",
  "limit": 25,
  "start": 1000000
}
```

```javascript
// Get coin balances for an account
{
  "resource": "coins",
  "operation": "getAccountCoins", 
  "address": "0xa61e1e86e9f596e099283c26b07bbff59a2e78181f9d0c38bfe6b67d2a0de0f2",
  "limit": 100
}
```

```javascript
// Stream events by event handle
{
  "resource": "events",
  "operation": "getEventsByEventHandle",
  "address": "0x1",
  "eventHandle": "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  "fieldName": "withdraw_events"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid Address | Account address format is incorrect | Ensure address starts with 0x and is 64 characters |
| Transaction Not Found | Transaction hash doesn't exist | Verify transaction hash and network selection |
| Insufficient Gas | Transaction gas limit too low | Increase gas limit or check gas estimation |
| Network Timeout | Request timed out | Check network connectivity and try again |
| Rate Limited | Too many requests to API | Implement request throttling or upgrade API plan |
| Invalid Resource Type | Resource type doesn't exist | Verify resource type format and account ownership |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
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
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aptos/issues)
- **Aptos Documentation**: [Aptos Developer Docs](https://aptos.dev/)
- **Aptos Community**: [Aptos Discord](https://discord.gg/aptosnetwork)