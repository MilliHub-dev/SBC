import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { THIRDWEB_CONFIG, THIRDWEB_TOKEN_DROP_ADDRESS, IS_DEMO_MODE } from '../config/web3Config';

/**
 * ThirdWeb Service for Token Drop Management
 * Handles token claiming, drop configuration, and distribution
 */
class ThirdWebService {
  constructor() {
    this.sdk = null;
    this.tokenDrop = null;
    this.initialized = false;
  }

  /**
   * Initialize ThirdWeb SDK
   * @param {Object} signer - Ethereum signer from wallet
   */
  async initialize(signer) {
    try {
      if (IS_DEMO_MODE) {
        console.log('ThirdWeb Service: Running in demo mode');
        this.initialized = true;
        return;
      }

      this.sdk = ThirdwebSDK.fromSigner(signer, THIRDWEB_CONFIG.CHAIN_ID);

      // Get the token drop contract
      this.tokenDrop = await this.sdk.getContract(THIRDWEB_TOKEN_DROP_ADDRESS);
      this.initialized = true;

      console.log('ThirdWeb Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ThirdWeb Service:', error);
      throw new Error('ThirdWeb initialization failed: ' + error.message);
    }
  }

  /**
   * Get current claim conditions
   * @returns {Promise<Object>} Current claim conditions
   */
  async getClaimConditions() {
    try {
      if (IS_DEMO_MODE) {
        return {
          startTimestamp: Date.now(),
          maxClaimableSupply: '1000000',
          supplyClaimed: '50000',
          quantityLimitPerWallet: '1000',
          pricePerToken: '0.001',
          currency: '0x0000000000000000000000000000000000000000', // ETH
          metadata: 'Demo claim conditions',
        };
      }

      if (!this.initialized || !this.tokenDrop) {
        throw new Error('ThirdWeb service not initialized');
      }

      // Check if the contract supports claim conditions
      if (!this.tokenDrop.claimConditions) {
          console.warn('Contract does not support claim conditions');
          // Return default/fallback conditions to prevent UI crash
          return {
              pricePerToken: '0',
              maxClaimableSupply: '0',
              supplyClaimed: '0',
              quantityLimitPerWallet: '0',
              currency: '0x0000000000000000000000000000000000000000',
              metadata: 'Claiming not supported for this contract'
          };
      }

      const conditions = await this.tokenDrop.claimConditions.getActive();
      return conditions;
    } catch (error) {
      console.error('Error getting claim conditions:', error);
      // Return default/fallback conditions instead of throwing
      return {
          pricePerToken: '0',
          maxClaimableSupply: '0',
          supplyClaimed: '0',
          quantityLimitPerWallet: '0',
          currency: '0x0000000000000000000000000000000000000000',
          metadata: 'Error loading claim conditions'
      };
    }
  }

  /**
   * Claim tokens from the drop
   * @param {string} recipientAddress - Address to receive tokens
   * @param {number} quantity - Number of tokens to claim
   * @returns {Promise<Object>} Transaction result
   */
  async claimTokens(recipientAddress, quantity) {
    try {
      if (IS_DEMO_MODE) {
        console.log(`Demo: Would claim ${quantity} tokens to ${recipientAddress}`);
        return {
          hash: '0xdemo' + Date.now(),
          success: true,
          quantity: quantity,
          recipient: recipientAddress,
        };
      }

      if (!this.initialized || !this.tokenDrop) {
        throw new Error('ThirdWeb service not initialized');
      }

      // Check claim conditions first
      const conditions = await this.getClaimConditions();
      const totalCost = (parseFloat(conditions.pricePerToken) * quantity).toString();

      // Perform the claim
      const tx = await this.tokenDrop.claimTo(recipientAddress, quantity);

              return {
          hash: tx.receipt.transactionHash,
          success: true,
          quantity: quantity,
          recipient: recipientAddress,
          totalCost: totalCost,
        };
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw new Error('Token claim failed: ' + error.message);
    }
  }

  /**
   * Buy tokens with ETH
   * @param {string} recipientAddress - Address to receive tokens
   * @param {string} ethAmount - Amount of ETH to spend
   * @returns {Promise<Object>} Transaction result
   */
  async buyWithETH(recipientAddress, ethAmount) {
    try {
      if (IS_DEMO_MODE) {
        const tokenAmount = parseFloat(ethAmount) * 1000; // Demo rate: 1 ETH = 1000 tokens
        return {
          hash: '0xdemo' + Date.now(),
          success: true,
          ethSpent: ethAmount,
          tokensReceived: tokenAmount.toString(),
          recipient: recipientAddress,
        };
      }

      if (!this.initialized || !this.tokenDrop) {
        throw new Error('ThirdWeb service not initialized');
      }

      // Get current price per token
      const conditions = await this.getClaimConditions();
      const pricePerToken = parseFloat(conditions.pricePerToken);
      const quantity = Math.floor(parseFloat(ethAmount) / pricePerToken);

      if (quantity <= 0) {
        throw new Error('Insufficient ETH amount for minimum token purchase');
      }

      return await this.claimTokens(recipientAddress, quantity);
    } catch (error) {
      console.error('Error buying tokens with ETH:', error);
      throw error;
    }
  }

  /**
   * Get token balance for an address
   * @param {string} address - Wallet address
   * @returns {Promise<string>} Token balance
   */
  async getTokenBalance(address) {
    try {
      if (IS_DEMO_MODE) {
        return '1500.0'; // Demo balance
      }

      if (!this.initialized || !this.tokenDrop) {
        throw new Error('ThirdWeb service not initialized');
      }

      const balance = await this.tokenDrop.balanceOf(address);
      return balance.toString();
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  /**
   * Get total supply of tokens
   * @returns {Promise<string>} Total supply
   */
  async getTotalSupply() {
    try {
      if (IS_DEMO_MODE) {
        return '1000000.0'; // Demo total supply
      }

      if (!this.initialized || !this.tokenDrop) {
        throw new Error('ThirdWeb service not initialized');
      }

      const supply = await this.tokenDrop.totalSupply();
      return supply.toString();
    } catch (error) {
      console.error('Error getting total supply:', error);
      return '0';
    }
  }

  /**
   * Check if user can claim tokens
   * @param {string} address - User wallet address
   * @param {number} quantity - Desired quantity
   * @returns {Promise<Object>} Claim eligibility info
   */
  async canClaim(address, quantity) {
    try {
      if (IS_DEMO_MODE) {
        return {
          canClaim: true,
          reasons: [],
          maxClaimable: 1000,
          alreadyClaimed: 0,
        };
      }

      if (!this.initialized || !this.tokenDrop) {
        throw new Error('ThirdWeb service not initialized');
      }

      // Check if contract supports claim conditions
      if (!this.tokenDrop.claimConditions) {
          return {
              canClaim: false,
              reasons: ['Contract does not support claiming'],
              maxClaimable: 0,
              alreadyClaimed: 0
          };
      }

      const reasons = await this.tokenDrop.claimConditions.getClaimIneligibilityReasons(
        quantity,
        address
      );

      return {
        canClaim: reasons.length === 0,
        reasons: reasons,
        maxClaimable: await this.tokenDrop.claimConditions.getClaimableQuantity(address),
        alreadyClaimed: await this.tokenDrop.getClaimedQuantity?.(address) || 0,
      };
    } catch (error) {
      console.error('Error checking claim eligibility:', error);
      return {
        canClaim: false,
        reasons: ['Error checking eligibility'],
        maxClaimable: 0,
        alreadyClaimed: 0,
      };
    }
  }

  /**
   * Set claim conditions (Admin only)
   * @param {Object} conditions - Claim conditions
   * @returns {Promise<Object>} Transaction result
   */
  async setClaimConditions(conditions) {
    try {
      if (IS_DEMO_MODE) {
        console.log('Demo: Would set claim conditions:', conditions);
        return { hash: '0xdemo' + Date.now(), success: true };
      }

      if (!this.initialized || !this.tokenDrop) {
        throw new Error('ThirdWeb service not initialized');
      }

      const tx = await this.tokenDrop.claimConditions.set([conditions]);
      return {
        hash: tx.receipt.transactionHash,
        success: true,
      };
    } catch (error) {
      console.error('Error setting claim conditions:', error);
      throw new Error('Failed to set claim conditions: ' + error.message);
    }
  }
}

// Export singleton instance
export const thirdwebService = new ThirdWebService();

// Export class for testing
export { ThirdWebService };