export const SABI_CASH_CONTRACT_ADDRESS = import.meta.env.VITE_SABI_CASH_CONTRACT_ADDRESS || 'AFpvWzvyFawJF9uSRi5Nn9xabUaBZdsAzdxvo3FLajst';
export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta';
export const SOLANA_EXPLORER_MINT_URL = `https://explorer.solana.com/address/${SABI_CASH_CONTRACT_ADDRESS}?cluster=${SOLANA_NETWORK}`;
export const SOLSCAN_MINT_URL = `https://solscan.io/token/${SABI_CASH_CONTRACT_ADDRESS}`;

// USDT Contract Address on Solana
export const USDT_CONTRACT_ADDRESS = import.meta.env.VITE_USDT_CONTRACT_ADDRESS || 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

// Swap Configuration (Replaces Uniswap)
export const SWAP_CONFIG = {
  ROUTER_ADDRESS: '', // Solana DEX Router
  // ...
};

export const IS_DEMO_MODE = false;

// Admin Wallet Addresses
export const ADMIN_WALLET_ADDRESSES = [
  "Hv2...", // Update with valid Solana Admin Public Key
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
