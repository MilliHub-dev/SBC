import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Card,
  CardBody,
  Select,
  Alert,
  Field,
  Badge,
  Icon,
  Divider,
  SimpleGrid
} from "@chakra-ui/react";
import { FaArrowsRotate, FaCoins, FaArrowRightArrowLeft } from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";

const Swap = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('SABI');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const { isConnected, ethBalance, sabiBalance } = useWeb3();

  // Exchange rates (demo values)
  const exchangeRates = {
    'ETH_TO_SABI': 1500,  // 1 ETH = 1500 SABI
    'SABI_TO_ETH': 0.000667,  // 1 SABI = 0.000667 ETH
    'ETH_TO_USDT': 2800,  // 1 ETH = 2800 USDT
    'USDT_TO_ETH': 0.000357,  // 1 USDT = 0.000357 ETH
    'SABI_TO_USDT': 1.87,  // 1 SABI = 1.87 USDT
    'USDT_TO_SABI': 0.535   // 1 USDT = 0.535 SABI
  };

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: ethBalance },
    { symbol: 'SABI', name: 'Sabi Cash', balance: sabiBalance },
    { symbol: 'USDT', name: 'USD Tether', balance: '0.00' }
  ];

  const calculateExchange = (amount, from, to) => {
    if (!amount || amount === '0') return '';
    const rate = exchangeRates[`${from}_TO_${to}`];
    return rate ? (parseFloat(amount) * rate).toFixed(6) : '';
  };

  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    const calculated = calculateExchange(value, fromToken, toToken);
    setToAmount(calculated);
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      toaster.create({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to swap tokens',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toaster.create({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to swap',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSwapping(true);
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toaster.create({
        title: 'Swap Successful',
        description: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
        status: 'success',
        duration: 5000,
      });
      
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      toaster.create({
        title: 'Swap Failed',
        description: 'An error occurred during the swap',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Container maxW="2xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2} color="white">
            <Icon as={FaArrowRightArrowLeft} mr={3} color="#0088CD" />
            Token Swap
          </Heading>
          <Text color="gray.400">
            Swap between different cryptocurrencies instantly
          </Text>
        </Box>

        {!isConnected && (
          <Alert status="warning" bg="yellow.900" borderColor="yellow.600">
            <Text color="yellow.200">Please connect your wallet to start swapping tokens</Text>
          </Alert>
        )}

        {/* Token Balances */}
        <Card bg="gray.900" borderColor="gray.700">
          <CardBody>
            <Heading size="md" mb={4} color="white">Your Balances</Heading>
            <SimpleGrid columns={2} spacing={4}>
              {tokens.map((token) => (
                <HStack key={token.symbol} justify="space-between" p={3} bg="gray.800" rounded="md">
                  <Text fontWeight="bold" color="white">{token.symbol}</Text>
                  <Badge colorScheme="blue" fontSize="sm" p={1}>
                    {token.balance}
                  </Badge>
                </HStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Swap Interface */}
        <Card bg="gray.900" borderColor="gray.700">
          <CardBody>
            <VStack spacing={4}>
              {/* From Token */}
              <Box w="full" p={4} bg="gray.800" rounded="lg" border="1px solid" borderColor="gray.600">
                <Text fontSize="sm" color="gray.400" mb={2}>From</Text>
                <HStack spacing={3}>
                  <Select 
                    value={fromToken} 
                    onChange={(e) => setFromToken(e.target.value)}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    w="120px"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol} style={{backgroundColor: '#2D3748'}}>
                        {token.symbol}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    bg="transparent"
                    border="none"
                    fontSize="xl"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ outline: "none" }}
                  />
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Balance: {tokens.find(t => t.symbol === fromToken)?.balance || '0.00'}
                </Text>
              </Box>

              {/* Swap Button */}
              <Button
                onClick={handleSwapTokens}
                variant="ghost"
                size="sm"
                color="#0088CD"
                _hover={{ bg: "gray.800" }}
              >
                <Icon as={FaArrowsRotate} />
              </Button>

              {/* To Token */}
              <Box w="full" p={4} bg="gray.800" rounded="lg" border="1px solid" borderColor="gray.600">
                <Text fontSize="sm" color="gray.400" mb={2}>To</Text>
                <HStack spacing={3}>
                  <Select 
                    value={toToken} 
                    onChange={(e) => setToToken(e.target.value)}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    w="120px"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol} style={{backgroundColor: '#2D3748'}}>
                        {token.symbol}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="text"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    bg="transparent"
                    border="none"
                    fontSize="xl"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                  />
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Balance: {tokens.find(t => t.symbol === toToken)?.balance || '0.00'}
                </Text>
              </Box>

              {/* Exchange Rate */}
              {fromAmount && toAmount && (
                <Box w="full" p={3} bg="blue.900" rounded="md" border="1px solid" borderColor="blue.700">
                  <Text fontSize="sm" color="blue.200" textAlign="center">
                    1 {fromToken} ≈ {calculateExchange('1', fromToken, toToken)} {toToken}
                  </Text>
                </Box>
              )}

              {/* Swap Action Button */}
              <Button
                bg="#0088CD"
                color="white"
                size="lg"
                w="full"
                onClick={handleSwap}
                isLoading={isSwapping}
                loadingText="Swapping..."
                isDisabled={!isConnected || !fromAmount || fromToken === toToken}
                _hover={{ bg: "#0077B6" }}
                leftIcon={<Icon as={FaCoins} />}
              >
                Swap Tokens
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Swap Information */}
        <Card bg="blue.900" borderColor="blue.700">
          <CardBody>
            <VStack spacing={3} align="start">
              <Text fontWeight="bold" color="blue.200">Swap Information:</Text>
              <Text fontSize="sm" color="blue.300">
                • Instant swaps between supported tokens
              </Text>
              <Text fontSize="sm" color="blue.300">
                • Competitive exchange rates updated in real-time
              </Text>
              <Text fontSize="sm" color="blue.300">
                • Low transaction fees on Polygon zkEVM
              </Text>
              <Text fontSize="sm" color="blue.300">
                • Secure and decentralized trading
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Swap;
