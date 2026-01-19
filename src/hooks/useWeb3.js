import { useAuth } from '../context/auth-context';

export const useWeb3 = () => {
  return useAuth();
};
