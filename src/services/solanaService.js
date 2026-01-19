import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { IS_DEMO_MODE, ADMIN_WALLET_ADDRESSES } from '../config/web3Config';

/**
 * Solana Service for Token Operations
 */
class SolanaService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Service
   * @param {Object} connection - Solana Connection
   */
  async initialize(connection) {
    this.initialized = true;
    console.log('Solana Service initialized');
  }

  /**
   * Buy tokens with SOL
   * @param {Object} connection - Solana Connection
   * @param {PublicKey} publicKey - User Public Key
   * @param {Function} sendTransaction - Wallet Adapter sendTransaction function
   * @param {string} solAmount - Amount of SOL to spend
   * @returns {Promise<Object>} Transaction result
   */
  async buyWithSOL(connection, publicKey, sendTransaction, solAmount) {
    try {
      if (IS_DEMO_MODE) {
        const tokenAmount = parseFloat(solAmount) * 1000; // Demo rate
        return {
          hash: '0xdemo' + Date.now(),
          success: true,
          solSpent: solAmount,
          tokensReceived: tokenAmount.toString(),
          recipient: publicKey.toString(),
        };
      }

      if (!publicKey || !connection) {
        throw new Error('Wallet not connected');
      }

      // Determine recipient (Treasury)
      let treasuryPubkey = publicKey; // Default to self if no admin
      if (ADMIN_WALLET_ADDRESSES && ADMIN_WALLET_ADDRESSES.length > 0) {
          try {
              // Basic check to ensure it's not the placeholder "Hv2..." if that's what's in the file
              const adminAddr = ADMIN_WALLET_ADDRESSES[0];
              if (adminAddr && adminAddr.length > 20 && !adminAddr.includes("Hv2...")) {
                  treasuryPubkey = new PublicKey(adminAddr);
              }
          } catch (e) {
              console.warn("Invalid Admin Wallet Address, sending to self for test");
          }
      }

      const lamports = Math.floor(parseFloat(solAmount) * LAMPORTS_PER_SOL);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: BigInt(lamports),
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      // Confirm transaction
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'confirmed');

      return {
        hash: signature,
        success: true,
        solSpent: solAmount,
        recipient: publicKey.toString(),
      };
    } catch (error) {
      console.error('Error buying tokens with SOL:', error);
      throw error;
    }
  }

  // Mocks for compatibility
  async getClaimConditions() { return {}; }
  async getTokenBalance() { return "0"; }
  async getTotalSupply() { return "0"; }
  async canClaim() { return { canClaim: true }; }
  async setClaimConditions() { return { success: true }; }
}

export const solanaService = new SolanaService();
export default solanaService;
