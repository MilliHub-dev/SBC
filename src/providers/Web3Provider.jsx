import { ThirdwebProvider, metamaskWallet, coinbaseWallet, walletConnect } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { THIRDWEB_CONFIG } from '../config/web3Config';
import { AuthProvider } from '../context/auth-context';

// Define Polygon zkEVM Mainnet manually
const PolygonZkEvmMainnet = {
  chainId: 1101,
  name: "Polygon zkEVM",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: ["https://zkevm-rpc.com"],
  shortName: "zkevm",
  slug: "polygon-zkevm",
  testnet: false,
  chain: "Polygon",
};


const queryClient = new QueryClient();

const Web3Provider = ({ children }) => {
  return (
    <ThirdwebProvider
      activeChain={PolygonZkEvmMainnet}
      clientId={THIRDWEB_CONFIG.CLIENT_ID}
      supportedWallets={[
        metamaskWallet(),
        coinbaseWallet(),
        walletConnect()
      ]}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </ThirdwebProvider>
  );
};

export default Web3Provider;
