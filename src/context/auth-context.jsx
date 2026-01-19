import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  useAddress, 
  useConnectionStatus, 
  useBalance, 
  useContract, 
  useContractWrite, 
  useTokenBalance 
} from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { 
  SABI_CASH_CONTRACT_ADDRESS, 
  SABI_CASH_ABI, 
  MIN_POINT_CONVERSION,
  POINT_TO_SABI_RATE,
  MINING_PLANS,
  IS_DEMO_MODE 
} from '../config/web3Config';
import { authService } from '../services/authService';
import { pointsService } from '../services/pointsService';
import { thirdwebService } from '../services/thirdwebService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';
  const isDisconnected = connectionStatus === 'disconnected';

  const [userPoints, setUserPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Get ETH balance
  const { data: ethBalance } = useBalance();

  // Get Sabi Cash contract
  const { contract: sabiContract } = useContract(SABI_CASH_CONTRACT_ADDRESS, SABI_CASH_ABI);

  // Get Sabi Cash balance
  const { data: sabiBalanceData, error: sabiBalanceError } = useTokenBalance(sabiContract, address);

  // Manual balance state for fallback
  const [manualBalance, setManualBalance] = useState("0");

  useEffect(() => {
    if (sabiBalanceError) {
      console.error("Error fetching Sabi Cash balance:", sabiBalanceError);
    }
  }, [sabiBalanceError]);

  // Fallback balance fetching using ethers directly
  useEffect(() => {
    const fetchBalanceManually = async () => {
      if (address && SABI_CASH_CONTRACT_ADDRESS) {
        try {
          // Use the provider from the wallet if available, or a public RPC
          let provider;
          if (window.ethereum) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
          } else {
            provider = new ethers.providers.JsonRpcProvider("https://zkevm-rpc.com");
          }

          // Minimal ABI for balance
          const minABI = [
            'function balanceOf(address) view returns (uint256)', 
            'function decimals() view returns (uint8)'
          ];
          
          const contract = new ethers.Contract(SABI_CASH_CONTRACT_ADDRESS, minABI, provider);

          const balance = await contract.balanceOf(address);
          
          let decimals = 18;
          try {
             decimals = await contract.decimals();
          } catch {
             console.warn("Could not fetch decimals, defaulting to 18");
          }
          
          const formatted = ethers.utils.formatUnits(balance, decimals);
          
          console.log("Manual balance fetch:", formatted);
          setManualBalance(formatted);
        } catch (err) {
          console.error("Manual balance fetch failed:", err);
        }
      }
    };

    if (address) {
        fetchBalanceManually();
        // Poll every 10 seconds
        const interval = setInterval(fetchBalanceManually, 10000);
        return () => clearInterval(interval);
    }
  }, [address]);


  // Contract write functions
  const { mutateAsync: stake } = useContractWrite(sabiContract, "stake");
  const { mutateAsync: claimRewards } = useContractWrite(sabiContract, "claimMiningRewards");

  // Auto-import Sabi Cash token to wallet
  useEffect(() => {
    const addTokenToWallet = async () => {
      if (connectionStatus === 'connected' && window.ethereum) {
        // Check if we've already tried to add the token to avoid spamming
        const hasAddedToken = localStorage.getItem('sabi_token_added');
        if (hasAddedToken) return;

        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: SABI_CASH_CONTRACT_ADDRESS,
                symbol: 'SBC',
                decimals: 18,
              },
            },
          });
          // Mark as added so we don't ask again
          localStorage.setItem('sabi_token_added', 'true');
        } catch (error) {
          console.error('Error adding token to wallet:', error);
          // Mark as added/ignored to prevent spamming on every reload
          localStorage.setItem('sabi_token_added', 'true');
        }
      }
    };

    addTokenToWallet();
  }, [connectionStatus]);

  // Check login status and load user data
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const tokens = authService.getTokens();
        const storedUser = authService.getStoredUser();
        
        if (tokens.sabiCashToken && storedUser) {
          setIsLoggedIn(true);
          setUserProfile(storedUser);
          
          // Load user points if we have Sabi Cash token
          if (tokens.sabiCashToken) {
            try {
              const pointsResult = await pointsService.getPointsBalance(tokens.sabiCashToken);
              if (pointsResult.success) {
                setUserPoints(pointsResult.totalPoints);
              }

              const historyResult = await pointsService.getPointsHistory(tokens.sabiCashToken, { limit: 10 });
              if (historyResult.success) {
                setPointsHistory(historyResult.results);
              }
            } catch (error) {
              console.error('Error loading points data:', error);
            }
          }
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
          setUserPoints(0);
          setPointsHistory([]);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (email, password, userType = 'passenger') => {
    try {
      const result = await authService.login(email, password, userType, address);
      if (result.success) {
        setIsLoggedIn(true);
        setUserProfile(result.user);
        setUserPoints(result.points || 0);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUserProfile(null);
      setUserPoints(0);
      setPointsHistory([]);
      setStakingInfo(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Buy Sabi Cash with Polygon (ETH) - Using ThirdWeb
  const buySabiWithPolygon = async (ethAmount) => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Use ThirdWeb service for token purchase
      const result = await thirdwebService.buyWithETH(address, ethAmount);
      
      if (result.success) {
        return result;
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Error buying Sabi Cash with Polygon:', error);
      throw error;
    }
  };

  // Buy Sabi Cash with USDT - Using ThirdWeb
  const buySabiWithUSDT = async () => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // For USDT purchases, you might need to implement a different flow
      // This is a placeholder for now
      throw new Error('USDT purchases not yet implemented');
    } catch (error) {
      console.error('Error buying Sabi Cash with USDT:', error);
      throw error;
    }
  };

  // Convert points to Sabi Cash
  const convertPointsToSabi = async (points) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Please login to convert points');
      }
      
      if (points < MIN_POINT_CONVERSION) {
        throw new Error(`Minimum ${MIN_POINT_CONVERSION} points required for conversion`);
      }

      const tokens = authService.getTokens();
      if (!tokens.sabiCashToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const result = await pointsService.convertPoints(tokens.sabiCashToken, points, address);
      
      if (result.success) {
        // Update local points balance
        setUserPoints(result.newPointBalance);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error converting points:', error);
      throw error;
    }
  };

  // Stake tokens for mining
  const stakeTokens = async (planType, amount) => {
    try {
      if (!isLoggedIn || !address) {
        throw new Error('Please login and connect wallet to stake tokens');
      }

      // This would integrate with your mining/staking contract
      const result = await stake({
        args: [ethers.utils.parseEther(amount.toString()), planType]
      });

      return result;
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  };

  // Claim mining rewards
  const claimMiningRewards = async () => {
    try {
      if (!isLoggedIn || !address) {
        throw new Error('Please login and connect wallet to claim rewards');
      }

      const result = await claimRewards();

      return result;
    } catch (error) {
      console.error('Error claiming mining rewards:', error);
      throw error;
    }
  };

  // Get mining/staking information
  const getStakingInfo = async () => {
    try {
      if (!isLoggedIn) {
        return null;
      }

      // This would fetch from your backend API
      // For now, return null as placeholder
      return null;
    } catch (error) {
      console.error('Error getting staking info:', error);
      return null;
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!isLoggedIn) return;

    try {
      const tokens = authService.getTokens();
      if (tokens.sabiCashToken) {
        const pointsResult = await pointsService.getPointsBalance(tokens.sabiCashToken);
        if (pointsResult.success) {
          setUserPoints(pointsResult.totalPoints);
        }

        const historyResult = await pointsService.getPointsHistory(tokens.sabiCashToken, { limit: 10 });
        if (historyResult.success) {
          setPointsHistory(historyResult.results);
        }
      }

      // Update user profile
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUserProfile(currentUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Calculate points for distance
  const calculatePointsForDistance = (distanceKm) => {
    return pointsService.calculatePointsForDistance(distanceKm);
  };

  // Calculate SabiCash for points
  const calculateSabiCashForPoints = (points) => {
    return pointsService.calculateSabiCashForPoints(points);
  };

  // Check if user can convert points
  const canConvertPoints = () => {
    return userPoints >= MIN_POINT_CONVERSION;
  };

  // Get convertible Sabi Cash amount
  const getConvertibleSabi = () => {
    if (userPoints < MIN_POINT_CONVERSION) {
      return '0.00';
    }
    return calculateSabiCashForPoints(userPoints).toFixed(2);
  };

  // Format balance display
  const formatBalance = (balance) => {
    if (!balance) return '0.00';
    return parseFloat(balance.displayValue).toFixed(4);
  };

  const value = {
    // Connection state
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Balances
    ethBalance: ethBalance ? formatBalance(ethBalance) : '0.00',
    sabiBalance: sabiBalanceData ? parseFloat(sabiBalanceData.displayValue).toFixed(2) : (manualBalance ? parseFloat(manualBalance).toFixed(2) : '0.00'),
    
    // User state
    isLoggedIn,
    isLoading,
    userPoints,
    userProfile,
    pointsHistory,
    stakingInfo,
    
    // Actions
    login,
    logout,
    buySabiWithPolygon,
    buySabiWithUSDT,
    convertPointsToSabi,
    stakeTokens,
    claimMiningRewards,
    refreshUserData,
    
    // Utilities
    calculatePointsForDistance,
    calculateSabiCashForPoints,
    canConvertPoints,
    getConvertibleSabi,
    getStakingInfo,
    
    // Constants
    POINT_TO_SABI_RATE,
    MIN_POINT_CONVERSION,
    MINING_PLANS,
    IS_DEMO_MODE,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
