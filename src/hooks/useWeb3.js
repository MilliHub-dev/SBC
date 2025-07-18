import { useState, useEffect } from 'react';

// Simplified useWeb3 hook for debugging
export const useWeb3 = () => {
  return {
    isConnected: false,
    address: null,
    isLoggedIn: false,
    userPoints: 0,
    sabiBalance: '0.00',
    ethBalance: '0.00',
    login: () => {},
    logout: () => {},
    purchaseTokens: () => {},
    convertPoints: () => {},
    stakeTokens: () => {},
    claimRewards: () => {},
  };
};