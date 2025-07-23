# Sabi Ride Web3 Integration

A comprehensive Web3-enabled ride-hailing platform with native blockchain rewards and tokenomics on Polygon zkEVM.

## 🚀 Features

### Core Web3 Features
- **Wallet Connection**: RainbowKit integration with multiple wallet support
- **Sabi Cash Token**: Native ERC-20 token with advanced tokenomics
- **Point Conversion**: Convert Sabi Ride app points to Sabi Cash (1 point = 0.5 SABI)
- **Token Purchase**: Buy Sabi Cash with Polygon (ETH) or USDT
- **DEX Functionality**: Token swapping capabilities
- **Staking & Mining**: Multiple reward plans for earning passive income
- **Task Rewards**: Earn tokens by completing social media tasks
- **Dashboard**: Comprehensive Web3 dashboard with real-time data

### Mining Plans
1. **Free Plan**: 0.9 SABI daily (manual claim every 24h)
2. **Basic Plan**: Deposit 100 SABI → Earn 15 SABI daily for 30 days
3. **Premium Plan**: Deposit 1000 SABI → Earn 170 SABI daily for 30 days (auto-claim)

### Task Rewards (7 SABI each)
- Referral program
- Follow on X (Twitter)
- Like social media posts
- Comment on posts

## 🛠 Tech Stack

- **Frontend**: React 19, Chakra UI, Vite
- **Web3**: Wagmi, RainbowKit, Viem, Ethers.js
- **Blockchain**: Polygon zkEVM (Testnet & Mainnet)
- **Smart Contracts**: Solidity 0.8.19, OpenZeppelin
- **Development**: Hardhat, TypeScript

## 📋 Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Test ETH for Polygon zkEVM testnet
- WalletConnect Project ID (for RainbowKit)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd sabi-ride-web3

# Install frontend dependencies
npm install

# Install Hardhat dependencies for contract deployment
npm install --prefix . -D @nomicfoundation/hardhat-toolbox @openzeppelin/contracts hardhat dotenv
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
PRIVATE_KEY=your_wallet_private_key
REACT_APP_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 3. Smart Contract Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Polygon zkEVM testnet
npx hardhat run scripts/deploy.js --network polygon-zkevm-testnet

# Verify contract (optional)
npx hardhat verify --network polygon-zkevm-testnet <CONTRACT_ADDRESS> "<USDT_ADDRESS>" "<OWNER_ADDRESS>"
```

### 4. Update Configuration

After deployment, update `src/config/web3Config.js` with the deployed contract address:

```javascript
export const SABI_CASH_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### 5. Run the Application

```bash
# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

## 🌐 Network Configuration

### Polygon zkEVM Testnet
- **Chain ID**: 1442
- **RPC URL**: https://rpc.public.zkevm-test.net
- **Explorer**: https://testnet-zkevm.polygonscan.com
- **Faucet**: https://faucet.polygon.technology

### Polygon zkEVM Mainnet
- **Chain ID**: 1101
- **RPC URL**: https://zkevm-rpc.com
- **Explorer**: https://zkevm.polygonscan.com

## 📱 Usage Guide

### For Users

1. **Connect Wallet**
   - Visit the homepage
   - Click "Connect Wallet" 
   - Choose your preferred wallet

2. **Access Dashboard**
   - After connecting, click "Go to Dashboard"
   - Login with Sabi Ride credentials to access points

3. **Convert Points**
   - Navigate to "Convert Tokens"
   - Login to Sabi Ride account
   - Convert minimum 500 points (1 point = 0.5 SABI)

4. **Buy Sabi Cash**
   - Go to "Buy Tokens"
   - Choose payment method (ETH or USDT)
   - Enter amount and purchase

5. **Start Mining/Staking**
   - Visit "Staking" page
   - Choose a mining plan
   - Stake tokens or start free mining

6. **Complete Tasks**
   - Go to "Rewards" page
   - Complete social media tasks
   - Earn 7 SABI per task

### For Developers

1. **Contract Interaction**
   ```javascript
   import { useWeb3 } from './hooks/useWeb3';
   
   const { buySabiWithPolygon, convertPointsToSabi } = useWeb3();
   ```

2. **Adding New Features**
   - Update smart contract in `contracts/SabiCash.sol`
   - Add functions to `src/hooks/useWeb3.js`
   - Create UI components in `src/components/`

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Owner-only functions for critical operations
- **Supply Cap**: Maximum 1 billion SABI tokens
- **Authorized Minters**: Controlled token minting for rewards
- **Time Locks**: 24-hour claim intervals for free mining

## 📊 Smart Contract Functions

### User Functions
- `buyWithPolygon()`: Purchase tokens with ETH
- `buyWithUSDT(uint256)`: Purchase tokens with USDT
- `stake(uint256, PlanType)`: Stake in mining plans
- `claimMiningRewards()`: Claim free mining rewards
- `claimStakingRewards()`: Claim staking rewards
- `unstake()`: Early unstaking (forfeit rewards)

### Admin Functions
- `mint(address, uint256)`: Mint tokens (authorized minters only)
- `updateRates(uint256, uint256)`: Update conversion rates
- `updateMiningPlan()`: Modify mining plan parameters
- `setAuthorizedMinter()`: Manage minter permissions

## 🔗 API Integration

### Backend Requirements

The frontend expects these API endpoints from the Sabi Ride backend:

```javascript
// Authentication
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password",
  "walletAddress": "0x..."
}

// User points
GET /api/user/points
Headers: { Authorization: "Bearer <token>" }

// Point conversion
POST /api/convert-points
{
  "points": 1000,
  "walletAddress": "0x...",
  "sabiAmount": 500
}
```

## 🧪 Testing

```bash
# Run contract tests
npx hardhat test

# Run frontend tests
npm test

# Gas reporting
REPORT_GAS=true npx hardhat test
```

## 📦 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting provider
# Files will be in ./dist directory
```

### Contract Deployment
```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network polygon-zkevm-mainnet

# Verify on explorer
npx hardhat verify --network polygon-zkevm-mainnet <CONTRACT_ADDRESS>
```

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure you have a Web3 wallet installed
   - Check network configuration
   - Verify WalletConnect Project ID

2. **Transaction Failed**
   - Check gas fees and balance
   - Ensure correct network (Polygon zkEVM)
   - Verify contract address

3. **Point Conversion Failed**
   - Ensure you're logged into Sabi Ride
   - Check minimum point requirement (500)
   - Verify backend API connectivity

### Support

- Create an issue on GitHub
- Check the documentation
- Join our Discord community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🔗 Links

- [Polygon zkEVM Documentation](https://wiki.polygon.technology/docs/zkEVM)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)
- [Hardhat Documentation](https://hardhat.org/docs)

---

**Built with ❤️ for the Sabi Ride ecosystem**