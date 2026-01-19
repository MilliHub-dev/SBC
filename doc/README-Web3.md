# Sabi Ride Web3 Integration

A comprehensive Web3-enabled ride-hailing platform with native blockchain rewards and tokenomics on Solana.

## 🚀 Features

### Core Web3 Features
- **Wallet Connection**: Solana Wallet Adapter integration with multiple wallet support
- **Sabi Cash Token**: Native SPL token with advanced tokenomics
- **Point Conversion**: Convert Sabi Ride app points to Sabi Cash (1 point = 0.5 SABI)
- **Token Purchase**: Buy Sabi Cash with Solana (SOL) or USDT
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
- **Web3**: @solana/web3.js, @solana/wallet-adapter
- **Blockchain**: Solana (Devnet & Mainnet)
- **Programs**: Rust, Anchor (if applicable) or SPL Token
- **Development**: TypeScript

## 📋 Prerequisites

- Node.js 18+ and npm
- Phantom, Solflare, or compatible Solana wallet
- Test SOL for Solana Devnet
- Solana RPC URL (optional)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd sabi-ride-web3

# Install frontend dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
PRIVATE_KEY=your_wallet_private_key # Solana private key (base58)
REACT_APP_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Smart Contract Deployment

```bash
# Build Solana program
cargo build-bpf

# Deploy to Solana Devnet
solana program deploy target/deploy/sabi_cash.so --url devnet

# Save the Program ID returned by the deploy command
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

### Solana Devnet
- **RPC URL**: https://api.devnet.solana.com
- **Explorer**: https://explorer.solana.com/?cluster=devnet

### Solana Mainnet Beta
- **RPC URL**: https://api.mainnet-beta.solana.com
- **Explorer**: https://explorer.solana.com/

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
   - Choose payment method (SOL or USDT)
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
   
   const { buyWithSOL, convertPointsToSabi } = useWeb3();
   ```

2. **Adding New Features**
   - Update smart contract in Solana Program
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
- `buyWithSOL(uint64)`: Purchase tokens with SOL
- `buyWithUSDT(uint64)`: Purchase tokens with USDT
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
solana program deploy dist/program/sabi_cash.so --url mainnet-beta
```

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure you have a Solana wallet installed (Phantom/Solflare)
   - Check network configuration
   - Verify RPC URL connectivity

2. **Transaction Failed**
   - Check SOL balance for gas fees
   - Ensure correct network (Devnet/Mainnet)
   - Verify program ID

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

- [Solana Documentation](https://docs.solana.com)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [SPL Token](https://spl.solana.com/token)

---

**Built with ❤️ for the Sabi Ride ecosystem**