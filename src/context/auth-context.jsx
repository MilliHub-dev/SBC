import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  SABI_CASH_CONTRACT_ADDRESS, 
  MIN_POINT_CONVERSION,
  POINT_TO_SABI_RATE,
  MINING_PLANS,
  IS_DEMO_MODE 
} from '../config/web3Config';
import { authService } from '../services/authService';
import { pointsService } from '../services/pointsService';
import { solanaService } from '../services/solanaService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, connecting, disconnect } = useWallet();

  const address = publicKey ? publicKey.toString() : null;
  const isConnected = connected;
  const isConnecting = connecting;
  const isDisconnected = !connected && !connecting;

  const [userPoints, setUserPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Native Balance (SOL)
  const [nativeBalance, setNativeBalance] = useState("0");
  
  // Sabi Cash Balance (SPL Token)
  const [sabiBalance, setSabiBalance] = useState("0");

  // Fetch Balances
  const fetchBalances = useCallback(async () => {
      if (!publicKey || !connection) return;

      try {
          // SOL Balance
          const solBalance = await connection.getBalance(publicKey);
          setNativeBalance((solBalance / LAMPORTS_PER_SOL).toString());

          // SPL Token Balance
          // Ensure SABI_CASH_CONTRACT_ADDRESS is a valid PublicKey string before using
          if (SABI_CASH_CONTRACT_ADDRESS && SABI_CASH_CONTRACT_ADDRESS.length > 20 && !SABI_CASH_CONTRACT_ADDRESS.startsWith("0x")) {
             try {
                const mintPublicKey = new PublicKey(SABI_CASH_CONTRACT_ADDRESS);
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    mint: mintPublicKey
                });
                
                if (tokenAccounts.value.length > 0) {
                    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                    setSabiBalance(balance.toString());
                } else {
                    setSabiBalance("0");
                }
             } catch (e) {
                 console.warn("Error fetching SPL token balance (likely invalid mint address):", e);
             }
          }
      } catch (err) {
          console.error("Error fetching balances:", err);
      }
  }, [publicKey, connection]);

  useEffect(() => {
      fetchBalances();
      const id = setInterval(fetchBalances, 10000);
      return () => clearInterval(id);
  }, [fetchBalances]);

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
      // Disconnect wallet if connected
      if (connected) {
          await disconnect();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Buy Sabi Cash with Solana (SOL)
  const buySabiWithSolana = async (solAmount) => {
    try {
      if (!publicKey || !connected) {
        throw new Error('Wallet not connected');
      }

      // Use the updated solanaService
      // passing connection and wallet info needed
      const result = await solanaService.buyWithSOL(connection, publicKey, sendTransaction, solAmount);
      
      if (result.success) {
        return result;
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Error buying Sabi Cash with Solana:', error);
      throw error;
    }
  };

  // Buy Sabi Cash with USDT
  const buySabiWithUSDT = async () => {
      throw new Error('USDT purchases not yet implemented on Solana');
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

  // Stake tokens for mining - Placeholder for Solana
  const stakeTokens = async (planType, amount) => {
    try {
      if (!isLoggedIn || !connected) {
        throw new Error('Please login and connect wallet to stake tokens');
      }

      // TODO: Implement Solana staking program interaction
      console.log("Staking not yet implemented for Solana");
      return { success: false, error: "Staking not yet implemented for Solana" };
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  };

  // Claim mining rewards - Placeholder for Solana
  const claimMiningRewards = async () => {
    try {
      if (!isLoggedIn || !connected) {
        throw new Error('Please login and connect wallet to claim rewards');
      }

      // TODO: Implement Solana reward claim
      console.log("Claiming rewards not yet implemented for Solana");
      return { success: false, error: "Claiming not yet implemented for Solana" };
    } catch (error) {
      console.error('Error claiming mining rewards:', error);
      throw error;
    }
  };

  // Get mining/staking information
  const getStakingInfo = async () => {
      return null;
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
    return parseFloat(balance).toFixed(4);
  };

  const value = {
    // Connection state
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Balances
    nativeBalance: formatBalance(nativeBalance),
    solBalance: formatBalance(nativeBalance), // Alias for Solana
    ethBalance: formatBalance(nativeBalance), // Keep for compatibility
    sabiBalance: formatBalance(sabiBalance),
    
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
    buySabiWithSolana, 
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
