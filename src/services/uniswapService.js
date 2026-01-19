import { ethers } from 'ethers';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { AlphaRouter, SwapType } from '@uniswap/smart-order-router';
import { UNISWAP_CONFIG, SABI_CASH_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS, IS_DEMO_MODE } from '../config/web3Config';

// Minimal ABIs
const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
];

const ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)'
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)'
];

/**
 * Uniswap Service for Token Swapping
 * Handles token swaps, price quotes, and liquidity operations
 */
class UniswapService {
  constructor() {
    this.router = null;
    this.provider = null;
    this.initialized = false;
    this.chainId = 1442; // Polygon zkEVM Testnet
    this.useRouter = true; // Default to AlphaRouter
  }

  /**
   * Initialize Uniswap service
   * @param {Object} provider - Ethereum provider
   */
  async initialize(provider) {
    try {
      if (IS_DEMO_MODE) {
        console.log('Uniswap Service: Running in demo mode');
        this.initialized = true;
        return;
      }

      this.provider = provider;
      
      try {
        this.router = new AlphaRouter({
          chainId: this.chainId,
          provider: this.provider,
        });
        console.log('AlphaRouter initialized successfully');
      } catch (routerError) {
        console.warn('AlphaRouter initialization failed, falling back to direct contract usage:', routerError);
        this.useRouter = false;
      }

      this.initialized = true;
      console.log('Uniswap Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Uniswap Service:', error);
      throw new Error('Uniswap initialization failed: ' + error.message);
    }
  }

  /**
   * Get token definitions
   * @returns {Object} Token definitions for the chain
   */
  getTokens() {
    return {
      WETH: new Token(
        this.chainId,
        UNISWAP_CONFIG.WETH_ADDRESS,
        18,
        'WETH',
        'Wrapped Ether'
      ),
      SBC: new Token(
        this.chainId,
        SABI_CASH_CONTRACT_ADDRESS,
        18,
        'SBC',
        'Sabi Cash'
      ),
      USDT: new Token(
        this.chainId,
        USDT_CONTRACT_ADDRESS,
        6,
        'USDT',
        'USD Tether'
      ),
    };
  }

  /**
   * Get quote for token swap
   * @param {string} tokenInAddress - Input token address
   * @param {string} tokenOutAddress - Output token address
   * @param {string} amountIn - Input amount
   * @returns {Promise<Object>} Quote information
   */
  async getQuote(tokenInAddress, tokenOutAddress, amountIn) {
    try {
      if (IS_DEMO_MODE) {
        // Demo exchange rates
        const rates = {
          [`${UNISWAP_CONFIG.WETH_ADDRESS}-${SABI_CASH_CONTRACT_ADDRESS}`]: 1500,
          [`${SABI_CASH_CONTRACT_ADDRESS}-${UNISWAP_CONFIG.WETH_ADDRESS}`]: 0.000667,
          [`${UNISWAP_CONFIG.WETH_ADDRESS}-${USDT_CONTRACT_ADDRESS}`]: 2800,
          [`${USDT_CONTRACT_ADDRESS}-${UNISWAP_CONFIG.WETH_ADDRESS}`]: 0.000357,
          [`${SABI_CASH_CONTRACT_ADDRESS}-${USDT_CONTRACT_ADDRESS}`]: 1.87,
          [`${USDT_CONTRACT_ADDRESS}-${SABI_CASH_CONTRACT_ADDRESS}`]: 0.535,
        };

        const rateKey = `${tokenInAddress}-${tokenOutAddress}`;
        const rate = rates[rateKey] || 1;
        const amountOut = (parseFloat(amountIn) * rate).toFixed(6);

        return {
          amountIn,
          amountOut,
          priceImpact: '0.1',
          route: [`${tokenInAddress} -> ${tokenOutAddress}`],
          gasEstimate: '150000',
          minimumAmountOut: (parseFloat(amountOut) * 0.995).toFixed(6), // 0.5% slippage
        };
      }

      if (!this.initialized) {
        throw new Error('Uniswap service not initialized');
      }

      // Direct fallback if router failed
      if (!this.useRouter) {
        return this.getQuoteDirect(tokenInAddress, tokenOutAddress, amountIn);
      }

      const tokens = this.getTokens();
      const tokenIn = Object.values(tokens).find(t => t.address.toLowerCase() === tokenInAddress.toLowerCase());
      const tokenOut = Object.values(tokens).find(t => t.address.toLowerCase() === tokenOutAddress.toLowerCase());

      if (!tokenIn || !tokenOut) {
        throw new Error('Unsupported token pair');
      }

      const amount = CurrencyAmount.fromRawAmount(
        tokenIn,
        (parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)).toString()
      );

      const route = await this.router.route(
        amount,
        tokenOut,
        TradeType.EXACT_INPUT,
        {
          recipient: '0x0000000000000000000000000000000000000000', // Will be replaced with actual recipient
          slippageTolerance: new Percent(50, 10_000), // 0.5%
          deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
          type: SwapType.SWAP_ROUTER_02,
        }
      );

      if (!route) {
        throw new Error('No route found for this swap');
      }

              return {
          amountIn: amountIn,
          amountOut: (parseFloat(route.trade.outputAmount.quotient.toString()) / Math.pow(10, tokenOut.decimals)).toFixed(6),
          priceImpact: route.trade.priceImpact.toFixed(2),
          route: route.route.map(r => `${r.tokenPath[0].symbol} -> ${r.tokenPath[r.tokenPath.length - 1].symbol}`),
          gasEstimate: route.estimatedGasUsed.toString(),
          minimumAmountOut: (parseFloat(route.trade.minimumAmountOut(new Percent(50, 10_000)).quotient.toString()) / Math.pow(10, tokenOut.decimals)).toFixed(6),
          routeData: route,
        };
    } catch (error) {
      console.error('Error getting quote:', error);
      throw new Error('Failed to get swap quote: ' + error.message);
    }
  }

  /**
   * Execute token swap
   * @param {string} tokenInAddress - Input token address
   * @param {string} tokenOutAddress - Output token address
   * @param {string} amountIn - Input amount
   * @param {string} recipientAddress - Recipient address
   * @param {Object} signer - Ethereum signer
   * @returns {Promise<Object>} Transaction result
   */
  async executeSwap(tokenInAddress, tokenOutAddress, amountIn, recipientAddress, signer) {
    try {
      if (IS_DEMO_MODE) {
        const quote = await this.getQuote(tokenInAddress, tokenOutAddress, amountIn);
        console.log(`Demo: Would swap ${amountIn} tokens for ${quote.amountOut} tokens`);
        return {
          hash: '0xdemo' + Date.now(),
          success: true,
          amountIn: amountIn,
          amountOut: quote.amountOut,
          recipient: recipientAddress,
        };
      }

      if (!this.initialized) {
        throw new Error('Uniswap service not initialized');
      }

      // Fallback
      if (!this.useRouter) {
        return this.executeSwapDirect(tokenInAddress, tokenOutAddress, amountIn, recipientAddress, signer);
      }

      if (!this.router) {
        throw new Error('Uniswap service not initialized');
      }

      // Get quote first
      const quote = await this.getQuote(tokenInAddress, tokenOutAddress, amountIn);
      
      if (!quote.routeData) {
        throw new Error('No route data available for swap');
      }

      // Update recipient in the route
      const swapRoute = {
        ...quote.routeData,
        trade: {
          ...quote.routeData.trade,
          swaps: quote.routeData.trade.swaps.map(swap => ({
            ...swap,
            route: {
              ...swap.route,
              recipient: recipientAddress,
            }
          }))
        }
      };

      // Execute the swap
      const transaction = {
        data: swapRoute.methodParameters.calldata,
        to: UNISWAP_CONFIG.ROUTER_ADDRESS,
        value: swapRoute.methodParameters.value,
        from: recipientAddress,
        gasPrice: '20000000000', // 20 gwei
        gasLimit: Math.floor(parseInt(quote.gasEstimate) * 1.2), // 20% buffer
      };

      const tx = await signer.sendTransaction(transaction);
      const receipt = await tx.wait();

      return {
        hash: receipt.transactionHash,
        success: receipt.status === 1,
        amountIn: amountIn,
        amountOut: quote.amountOut,
        recipient: recipientAddress,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      throw new Error('Swap execution failed: ' + error.message);
    }
  }

  async getQuoteDirect(tokenInAddress, tokenOutAddress, amountIn) {
    try {
      const quoter = new ethers.Contract(UNISWAP_CONFIG.QUOTER_ADDRESS, QUOTER_ABI, this.provider);
      const fee = UNISWAP_CONFIG.POOL_FEE;
      const tokens = this.getTokens();
      const tokenIn = Object.values(tokens).find(t => t.address.toLowerCase() === tokenInAddress.toLowerCase());
      const tokenOut = Object.values(tokens).find(t => t.address.toLowerCase() === tokenOutAddress.toLowerCase());

      if (!tokenIn || !tokenOut) throw new Error("Tokens not found");

      const amountInRaw = ethers.utils.parseUnits(amountIn, tokenIn.decimals);

      const amountOutRaw = await quoter.callStatic.quoteExactInputSingle(
        tokenInAddress,
        tokenOutAddress,
        fee,
        amountInRaw,
        0
      );

      const amountOut = ethers.utils.formatUnits(amountOutRaw, tokenOut.decimals);

      return {
        amountIn,
        amountOut,
        priceImpact: '0',
        route: [`${tokenIn.symbol} -> ${tokenOut.symbol}`],
        gasEstimate: '200000',
        minimumAmountOut: (parseFloat(amountOut) * 0.995).toFixed(6),
        isDirect: true
      };
    } catch (error) {
      console.error('Direct quote failed:', error);
      throw error;
    }
  }

  async executeSwapDirect(tokenInAddress, tokenOutAddress, amountIn, recipientAddress, signer) {
    try {
      const router = new ethers.Contract(UNISWAP_CONFIG.ROUTER_ADDRESS, ROUTER_ABI, signer);
      const tokens = this.getTokens();
      const tokenIn = Object.values(tokens).find(t => t.address.toLowerCase() === tokenInAddress.toLowerCase());
      const tokenOut = Object.values(tokens).find(t => t.address.toLowerCase() === tokenOutAddress.toLowerCase());
      const amountInRaw = ethers.utils.parseUnits(amountIn, tokenIn.decimals);
      
      const quote = await this.getQuoteDirect(tokenInAddress, tokenOutAddress, amountIn);
      const minOut = ethers.utils.parseUnits(quote.minimumAmountOut, tokenOut.decimals);

      const params = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        fee: UNISWAP_CONFIG.POOL_FEE,
        recipient: recipientAddress,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        amountIn: amountInRaw,
        amountOutMinimum: minOut,
        sqrtPriceLimitX96: 0
      };

      let tx;
      if (tokenIn.symbol === 'WETH') {
         tx = await router.exactInputSingle(params, { value: amountInRaw });
      } else {
         const tokenContract = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);
         const allowance = await tokenContract.allowance(recipientAddress, UNISWAP_CONFIG.ROUTER_ADDRESS);
         if (allowance.lt(amountInRaw)) {
             const approveTx = await tokenContract.approve(UNISWAP_CONFIG.ROUTER_ADDRESS, amountInRaw);
             await approveTx.wait();
         }
         tx = await router.exactInputSingle(params);
      }
      
      const receipt = await tx.wait();
      return {
        hash: receipt.transactionHash,
        success: receipt.status === 1,
        amountIn,
        amountOut: quote.amountOut,
        recipient: recipientAddress,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
       console.error('Direct swap failed:', error);
       throw error;
    }
  }

  /**
   * Get supported tokens
   * @returns {Array} List of supported tokens
   */
  getSupportedTokens() {
    const tokens = this.getTokens();
    return Object.values(tokens).map(token => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      chainId: token.chainId,
    }));
  }

  /**
   * Check if token pair is supported
   * @param {string} tokenA - First token address
   * @param {string} tokenB - Second token address
   * @returns {boolean} Whether the pair is supported
   */
  isPairSupported(tokenA, tokenB) {
    const tokens = this.getTokens();
    const supportedAddresses = Object.values(tokens).map(t => t.address.toLowerCase());
    
    return supportedAddresses.includes(tokenA.toLowerCase()) && 
           supportedAddresses.includes(tokenB.toLowerCase());
  }

  /**
   * Get token price in USD (if available)
   * @param {string} tokenAddress - Token address
   * @returns {Promise<string>} Token price in USD
   */
  async getTokenPrice(tokenAddress) {
    try {
      if (IS_DEMO_MODE) {
        const demoPrice = {
          [UNISWAP_CONFIG.WETH_ADDRESS]: '2800.00',
          [SABI_CASH_CONTRACT_ADDRESS]: '1.87',
          [USDT_CONTRACT_ADDRESS]: '1.00',
        };
        return demoPrice[tokenAddress] || '0.00';
      }

      // In production, you might want to integrate with a price feed service
      // For now, return a placeholder
      return '0.00';
    } catch (error) {
      console.error('Error getting token price:', error);
      return '0.00';
    }
  }

  /**
   * Estimate gas for swap
   * @param {string} tokenInAddress - Input token address
   * @param {string} tokenOutAddress - Output token address
   * @param {string} amountIn - Input amount
   * @returns {Promise<string>} Gas estimate
   */
  async estimateSwapGas(tokenInAddress, tokenOutAddress, amountIn) {
    try {
      const quote = await this.getQuote(tokenInAddress, tokenOutAddress, amountIn);
      return quote.gasEstimate;
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '150000'; // Default gas estimate
    }
  }
}

// Export singleton instance
export const uniswapService = new UniswapService();

// Export class for testing
export { UniswapService };