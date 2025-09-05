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

// ThirdWeb Configuration
export const THIRDWEB_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'your-thirdweb-client-id',
  SECRET_KEY: import.meta.env.VITE_THIRDWEB_SECRET_KEY || 'your-thirdweb-secret-key',
  CHAIN_ID: 1442, // Polygon zkEVM Testnet
  NETWORK: 'polygon-zkevm-testnet',
};

// ThirdWeb Token Drop Contract Address (Production)
export const THIRDWEB_TOKEN_DROP_ADDRESS = import.meta.env.VITE_THIRDWEB_TOKEN_DROP_ADDRESS || '0x53308b85F0Fceadfc0a474eb0c196F0F02CD4983';

// Sabi Cash Token Contract Address (ThirdWeb deployed)
export const SABI_CASH_CONTRACT_ADDRESS = import.meta.env.VITE_SABI_CASH_CONTRACT_ADDRESS || '0x53308b85F0Fceadfc0a474eb0c196F0F02CD4983';

// Contract ABI for Sabi Cash Token (ThirdWeb Standard + Custom)
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
  
  // ThirdWeb Extensions
  'function owner() view returns (address)',
  'function mintTo(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function burnFrom(address account, uint256 amount)',
  
  // ThirdWeb Token Drop Functions
  'function claim(address to, uint256 quantity, address currency, uint256 pricePerToken, bytes32[] calldata proofs, uint256 proofMaxQuantityPerTransaction) payable',
  'function claimCondition() view returns (uint256 startTimestamp, uint256 maxClaimableSupply, uint256 supplyClaimed, uint256 quantityLimitPerWallet, bytes32 merkleRoot, uint256 pricePerToken, address currency, string metadata)',
  'function setClaimConditions((uint256 startTimestamp, uint256 maxClaimableSupply, uint256 supplyClaimed, uint256 quantityLimitPerWallet, bytes32 merkleRoot, uint256 pricePerToken, address currency, string metadata) conditions, bool resetClaimEligibility)',
  
  // Custom Sabi Cash Functions (if implemented)
  'function buyWithPolygon() payable returns (bool)',
  'function buyWithUSDT(uint256 amount) returns (bool)',
  'function stake(uint256 amount, uint256 plan) returns (bool)',
  'function unstake() returns (bool)',
  'function claimStakingRewards() returns (bool)',
  'function claimMiningRewards() returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event TokensClaimed(address indexed claimer, address indexed receiver, uint256 indexed startTokenId, uint256 quantityClaimed)',
  'event TokensMinted(address indexed to, uint256 amount)',
  'event TokensBurned(address indexed from, uint256 amount)',
];

// USDT Contract Address on Polygon zkEVM Testnet
export const USDT_CONTRACT_ADDRESS = import.meta.env.VITE_USDT_CONTRACT_ADDRESS || '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035';

// Uniswap Configuration
export const UNISWAP_CONFIG = {
  ROUTER_ADDRESS: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 SwapRouter
  QUOTER_ADDRESS: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', // Uniswap V3 Quoter
  FACTORY_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap V3 Factory
  WETH_ADDRESS: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9', // WETH on Polygon zkEVM Testnet
  POOL_FEE: 3000, // 0.3% pool fee
};

// Sabi Ride API Configuration (Production)
export const SABI_RIDE_API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL  || 'https://tmp.sabirideweb.com.ng/api/v1',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    DRIVER_PROFILE: '/users/me/sabi-rider',
    PASSENGER_PROFILE: '/users/me/sabi-passenger',
    POINTS_BALANCE: '/users/points',
    POINTS_HISTORY: '/users/points/history',
    POINTS_CONVERT: '/users/points/convert',
    TRIPS_COMPLETE: '/trips/complete',
  }
};

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

// Production Environment Check
export const IS_PRODUCTION = import.meta.env.NODE_ENV === 'production';
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || false;