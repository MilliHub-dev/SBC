// ThirdWeb Configuration
export const THIRDWEB_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'your-thirdweb-client-id',
  SECRET_KEY: import.meta.env.VITE_THIRDWEB_SECRET_KEY || 'your-thirdweb-secret-key',
  CHAIN_ID: 1101, // Polygon zkEVM Mainnet
  NETWORK: 'polygon-zkevm',
};

// ThirdWeb Token Drop Contract Address (Production)
export const THIRDWEB_TOKEN_DROP_ADDRESS = import.meta.env.VITE_THIRDWEB_TOKEN_DROP_ADDRESS || '0x3884Ac9400D3D57eB8E94bcb5Bb6987477c3169d';

// Sabi Cash Token Contract Address (ThirdWeb deployed)
export const SABI_CASH_CONTRACT_ADDRESS = import.meta.env.VITE_SABI_CASH_CONTRACT_ADDRESS || '0x3884Ac9400D3D57eB8E94bcb5Bb6987477c3169d';

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
  'event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)',
  'event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)',

  // Access Control
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function grantRole(bytes32 role, address account)',
  'function revokeRole(bytes32 role, address account)',
  'function getRoleAdmin(bytes32 role) view returns (bytes32)',
  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',
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

export const IS_DEMO_MODE = false;

// Admin Wallet Addresses
export const ADMIN_WALLET_ADDRESSES = [
  "0x3884Ac9400D3D57eB8E94bcb5Bb6987477c3169d", // Default deployer/admin
];

// Mining Plans Configuration
export const MINING_PLANS = [
  { id: 1, name: 'Basic', duration: 30, apy: 12, minStake: 100 },
  { id: 2, name: 'Standard', duration: 90, apy: 24, minStake: 500 },
  { id: 3, name: 'Premium', duration: 180, apy: 48, minStake: 2000 },
];

// Point Conversion Configuration
export const POINT_TO_SABI_RATE = 0.5; // 1 Point = 0.5 Sabi Cash
export const MIN_POINT_CONVERSION = 500; // Minimum points to convert
