import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonZkEvm, polygonZkEvmTestnet } from 'wagmi/chains';

// Custom Polygon zkEVM Testnet configuration
const polygonZkEvmTestnetCustom = {
  ...polygonZkEvmTestnet,
  id: 1442,
  name: 'Polygon zkEVM Testnet',
  network: 'polygon-zkevm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.public.zkevm-test.net'],
    },
    public: {
      http: ['https://rpc.public.zkevm-test.net'],
    },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://testnet-zkevm.polygonscan.com' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'Sabi Ride',
  projectId: '2f05ae7f1116030fde2d36508f472bfb', // Updated with a valid project ID
  chains: [polygonZkEvmTestnetCustom, polygonZkEvm],
  ssr: false,
});

// Sabi Cash Token Contract Address (demo address for testing)
export const SABI_CASH_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Demo address for testing

// Contract ABI for Sabi Cash Token
export const SABI_CASH_ABI = [
  // ERC20 Standard Functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Custom Sabi Cash Functions
  'function mint(address to, uint256 amount) returns (bool)',
  'function burn(uint256 amount) returns (bool)',
  'function buyWithPolygon() payable returns (bool)',
  'function buyWithUSDT(uint256 amount) returns (bool)',
  'function stake(uint256 amount, uint256 plan) returns (bool)',
  'function unstake() returns (bool)',
  'function claimStakingRewards() returns (bool)',
  'function claimMiningRewards() returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event Staked(address indexed user, uint256 amount, uint256 plan)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
];

// USDT Contract Address on Polygon zkEVM Testnet
export const USDT_CONTRACT_ADDRESS = '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035'; // Demo USDT address

// Mining Plans Configuration
export const MINING_PLANS = {
  FREE: {
    id: 0,
    name: 'Free Plan',
    deposit: 0,
    dailyReward: 0.9,
    duration: 1, // 24 hours
    autoTrigger: false,
  },
  BASIC: {
    id: 1,
    name: 'Basic Plan',
    deposit: 100,
    dailyReward: 15,
    duration: 30, // 30 days
    autoTrigger: false,
  },
  PREMIUM: {
    id: 2,
    name: 'Premium Plan',
    deposit: 1000,
    dailyReward: 170,
    duration: 30, // 30 days
    autoTrigger: true,
  },
};

// Task Rewards Configuration
export const TASK_REWARDS = {
  REFERRAL: 7,
  FOLLOW_X: 7,
  LIKE_POST: 7,
  COMMENT: 7,
};

// Point to Sabi Cash Conversion Rate
export const POINT_TO_SABI_RATE = 0.5; // 1 point = 0.5 Sabi Cash
export const MIN_POINT_CONVERSION = 500; // Minimum 500 points to convert