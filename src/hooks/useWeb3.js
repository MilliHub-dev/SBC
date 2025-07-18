import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { 
  SABI_CASH_CONTRACT_ADDRESS, 
  SABI_CASH_ABI, 
  USDT_CONTRACT_ADDRESS,
  MINING_PLANS,
  POINT_TO_SABI_RATE,
  MIN_POINT_CONVERSION 
} from '../config/web3Config';

export const useWeb3 = () => {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const [userPoints, setUserPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stakingInfo, setStakingInfo] = useState(null);

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
    enabled: !!address && SABI_CASH_CONTRACT_ADDRESS !== '0x',
  });

  // Contract write functions
  const { writeContract } = useWriteContract();

  // Buy Sabi Cash with Polygon (ETH)
  const buySabiWithPolygon = async (ethAmount) => {
    try {
      if (!SABI_CASH_CONTRACT_ADDRESS || SABI_CASH_CONTRACT_ADDRESS === '0x') {
        throw new Error('Sabi Cash contract not deployed yet');
      }
      
      const result = await writeContract({
        address: SABI_CASH_CONTRACT_ADDRESS,
        abi: SABI_CASH_ABI,
        functionName: 'buyWithPolygon',
        value: parseEther(ethAmount.toString()),
      });
      return result;
    } catch (error) {
      console.error('Error buying Sabi Cash with Polygon:', error);
      throw error;
    }
  };

  // Buy Sabi Cash with USDT
  const buySabiWithUSDT = async (usdtAmount) => {
    try {
      if (!SABI_CASH_CONTRACT_ADDRESS || SABI_CASH_CONTRACT_ADDRESS === '0x') {
        throw new Error('Sabi Cash contract not deployed yet');
      }
      
      const result = await writeContract({
        address: SABI_CASH_CONTRACT_ADDRESS,
        abi: SABI_CASH_ABI,
        functionName: 'buyWithUSDT',
        args: [parseEther(usdtAmount.toString())],
      });
      return result;
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

      const sabiAmount = points * POINT_TO_SABI_RATE;
      
      // TODO: Call backend API to validate points and clear them
      const response = await fetch('/api/convert-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sabiToken')}`,
        },
        body: JSON.stringify({
          points: points,
          walletAddress: address,
          sabiAmount: sabiAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate points conversion');
      }

      // Mint Sabi Cash tokens
      if (SABI_CASH_CONTRACT_ADDRESS && SABI_CASH_CONTRACT_ADDRESS !== '0x') {
        const result = await writeContract({
          address: SABI_CASH_CONTRACT_ADDRESS,
          abi: SABI_CASH_ABI,
          functionName: 'mint',
          args: [address, parseEther(sabiAmount.toString())],
        });
        
        // Update local points after successful conversion
        setUserPoints(prev => prev - points);
        return result;
      } else {
        throw new Error('Sabi Cash contract not deployed yet');
      }
    } catch (error) {
      console.error('Error converting points to Sabi Cash:', error);
      throw error;
    }
  };

  // Stake Sabi Cash
  const stakeSabiCash = async (amount, planId) => {
    try {
      if (!SABI_CASH_CONTRACT_ADDRESS || SABI_CASH_CONTRACT_ADDRESS === '0x') {
        throw new Error('Sabi Cash contract not deployed yet');
      }
      
      const result = await writeContract({
        address: SABI_CASH_CONTRACT_ADDRESS,
        abi: SABI_CASH_ABI,
        functionName: 'stake',
        args: [parseEther(amount.toString()), planId],
      });
      return result;
    } catch (error) {
      console.error('Error staking Sabi Cash:', error);
      throw error;
    }
  };

  // Claim mining rewards
  const claimMiningRewards = async () => {
    try {
      if (!SABI_CASH_CONTRACT_ADDRESS || SABI_CASH_CONTRACT_ADDRESS === '0x') {
        throw new Error('Sabi Cash contract not deployed yet');
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

  // Claim staking rewards
  const claimStakingRewards = async () => {
    try {
      if (!SABI_CASH_CONTRACT_ADDRESS || SABI_CASH_CONTRACT_ADDRESS === '0x') {
        throw new Error('Sabi Cash contract not deployed yet');
      }
      
      const result = await writeContract({
        address: SABI_CASH_CONTRACT_ADDRESS,
        abi: SABI_CASH_ABI,
        functionName: 'claimStakingRewards',
      });
      return result;
    } catch (error) {
      console.error('Error claiming staking rewards:', error);
      throw error;
    }
  };

  // Login to Sabi Ride backend
  const loginToSabiRide = async (credentials) => {
    try {
      // TODO: Implement actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('sabiToken', data.token);
        setIsLoggedIn(true);
        setUserPoints(data.points || 0);
        return data;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Get user points from backend
  const fetchUserPoints = async () => {
    try {
      if (!isLoggedIn) return;
      
      // TODO: Implement actual API call to get user points
      const response = await fetch('/api/user/points', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sabiToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.points || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('sabiToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserPoints();
    }
  }, []);

  // Format balances for display
  const formatSabiBalance = () => {
    if (!sabiBalance) return '0';
    return parseFloat(formatEther(sabiBalance)).toFixed(2);
  };

  const formatEthBalance = () => {
    if (!ethBalance) return '0';
    return parseFloat(formatEther(ethBalance.value)).toFixed(4);
  };

  // Calculate convertible Sabi Cash from points
  const getConvertibleSabi = () => {
    return userPoints * POINT_TO_SABI_RATE;
  };

  // Check if user can convert points
  const canConvertPoints = () => {
    return isLoggedIn && userPoints >= MIN_POINT_CONVERSION;
  };

  return {
    // Wallet connection
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Balances
    ethBalance: formatEthBalance(),
    sabiBalance: formatSabiBalance(),
    userPoints,
    
    // Login state
    isLoggedIn,
    setIsLoggedIn,
    
    // Functions
    buySabiWithPolygon,
    buySabiWithUSDT,
    convertPointsToSabi,
    stakeSabiCash,
    claimMiningRewards,
    claimStakingRewards,
    loginToSabiRide,
    fetchUserPoints,
    
    // Utilities
    getConvertibleSabi,
    canConvertPoints,
    
    // Constants
    MINING_PLANS,
    POINT_TO_SABI_RATE,
    MIN_POINT_CONVERSION,
  };
};