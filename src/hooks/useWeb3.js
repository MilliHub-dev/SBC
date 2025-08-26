import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { 
  SABI_CASH_CONTRACT_ADDRESS, 
  SABI_CASH_ABI, 
  USDT_CONTRACT_ADDRESS,
  MINING_PLANS,
  POINT_TO_SABI_RATE,
  MIN_POINT_CONVERSION,
  IS_DEMO_MODE 
} from '../config/web3Config';
import { authService } from '../services/authService';
import { pointsService } from '../services/pointsService';
import { thirdwebService } from '../services/thirdwebService';
import { uniswapService } from '../services/uniswapService';

export const useWeb3 = () => {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const [userPoints, setUserPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Get Sabi Cash balance
  const { data: sabiBalance } = useReadContract({
    address: SABI_CASH_CONTRACT_ADDRESS,
    abi: SABI_CASH_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && SABI_CASH_CONTRACT_ADDRESS !== '0x' && SABI_CASH_CONTRACT_ADDRESS !== '0x1234567890123456789012345678901234567890',
  });

  // Contract write functions
  const { writeContract } = useWriteContract();

  // Check login status and load user data
  useEffect(() => {
    const checkLoginStatus = async () => {
      const tokens = authService.getTokens();
      const storedUser = authService.getStoredUser();
      
      if (tokens.sabiCashToken && storedUser) {
        setIsLoggedIn(true);
        setUserProfile(storedUser);
        
        // Load user points if we have Sabi Ride token
        if (tokens.sabiRideToken) {
          try {
            const pointsResult = await pointsService.getPointsBalance(tokens.sabiRideToken);
            if (pointsResult.success) {
              setUserPoints(pointsResult.totalPoints);
            }

            const historyResult = await pointsService.getPointsHistory(tokens.sabiRideToken, { limit: 10 });
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
  const buySabiWithUSDT = async (usdtAmount) => {
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
      if (!tokens.sabiRideToken) {
        throw new Error('Sabi Ride token not found. Please login again.');
      }

      const result = await pointsService.convertPoints(tokens.sabiRideToken, points, address);
      
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
      // For now, this is a placeholder
      const result = await writeContract({
        address: SABI_CASH_CONTRACT_ADDRESS,
        abi: SABI_CASH_ABI,
        functionName: 'stake',
        args: [parseEther(amount.toString()), planType],
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

      const result = await writeContract({
        address: SABI_CASH_CONTRACT_ADDRESS,
        abi: SABI_CASH_ABI,
        functionName: 'claimMiningRewards',
      });

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
      if (tokens.sabiRideToken) {
        const pointsResult = await pointsService.getPointsBalance(tokens.sabiRideToken);
        if (pointsResult.success) {
          setUserPoints(pointsResult.totalPoints);
        }

        const historyResult = await pointsService.getPointsHistory(tokens.sabiRideToken, { limit: 10 });
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
    return parseFloat(formatEther(balance.value)).toFixed(4);
  };

  return {
    // Connection state
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Balances
    ethBalance: ethBalance ? formatBalance(ethBalance) : '0.00',
    sabiBalance: sabiBalance ? formatEther(sabiBalance).slice(0, 8) : '0.00',
    
    // User state
    isLoggedIn,
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
};