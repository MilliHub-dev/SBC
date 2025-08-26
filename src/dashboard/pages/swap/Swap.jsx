import React, { useState, useEffect } from "react";
import {
	Box,
	Heading,
	Text,
	Button,
	Input,
	VStack,
	HStack,
	Card,
	Avatar,
	Flex,
	Container,
	Spinner,
} from "@chakra-ui/react";
import {
	FaArrowsRotate,
	FaCoins,
	FaArrowRightArrowLeft,
} from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import SimpleHeading from "@/dashboard/components/SimpleHeading/SimpleHeading";
import { uniswapService } from "../../../services/uniswapService";
import { useSigner, useProvider } from "wagmi";
import { UNISWAP_CONFIG, SABI_CASH_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS } from "../../../config/web3Config";

const Swap = () => {
	const [fromToken, setFromToken] = useState("WETH");
	const [toToken, setToToken] = useState("SABI");
	const [fromAmount, setFromAmount] = useState("");
	const [toAmount, setToAmount] = useState("");
	const [isSwapping, setIsSwapping] = useState(false);
	const [quote, setQuote] = useState(null);
	const [loadingQuote, setLoadingQuote] = useState(false);
	const [supportedTokens, setSupportedTokens] = useState([]);

	const { isConnected, address, ethBalance, sabiBalance } = useWeb3();
	const { data: signer } = useSigner();
	const provider = useProvider();

	// Initialize Uniswap service
	useEffect(() => {
		const initializeUniswap = async () => {
			if (!provider) return;

			try {
				await uniswapService.initialize(provider);
				const tokens = uniswapService.getSupportedTokens();
				setSupportedTokens(tokens);
			} catch (error) {
				console.error('Error initializing Uniswap:', error);
				toaster.create({
					title: "Initialization Error",
					description: "Failed to initialize swap functionality",
					type: "error",
					duration: 5000,
				});
			}
		};

		initializeUniswap();
	}, [provider]);

	// Get quote when amounts change
	useEffect(() => {
		const getQuote = async () => {
			if (!fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken) {
				setQuote(null);
				setToAmount("");
				return;
			}

			if (fromToken === toToken) {
				setToAmount(fromAmount);
				return;
			}

			setLoadingQuote(true);
			try {
				const fromTokenData = supportedTokens.find(t => t.symbol === fromToken);
				const toTokenData = supportedTokens.find(t => t.symbol === toToken);

				if (!fromTokenData || !toTokenData) {
					throw new Error('Unsupported token pair');
				}

				const quoteResult = await uniswapService.getQuote(
					fromTokenData.address,
					toTokenData.address,
					fromAmount
				);

				setQuote(quoteResult);
				setToAmount(quoteResult.amountOut);
			} catch (error) {
				console.error('Error getting quote:', error);
				setQuote(null);
				setToAmount("");
				toaster.create({
					title: "Quote Error",
					description: error.message,
					type: "error",
					duration: 3000,
				});
			} finally {
				setLoadingQuote(false);
			}
		};

		const debounceTimer = setTimeout(getQuote, 500);
		return () => clearTimeout(debounceTimer);
	}, [fromAmount, fromToken, toToken, supportedTokens]);

	const handleFromAmountChange = (value) => {
		setFromAmount(value);
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
				title: "Wallet Not Connected",
				description: "Please connect your wallet to swap tokens",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (!fromAmount || parseFloat(fromAmount) <= 0) {
			toaster.create({
				title: "Invalid Amount",
				description: "Please enter a valid amount to swap",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (!quote) {
			toaster.create({
				title: "No Quote Available",
				description: "Please wait for quote to load before swapping",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (!signer) {
			toaster.create({
				title: "Signer Not Available",
				description: "Please ensure your wallet is properly connected",
				type: "error",
				duration: 3000,
			});
			return;
		}

		setIsSwapping(true);
		try {
			const fromTokenData = supportedTokens.find(t => t.symbol === fromToken);
			const toTokenData = supportedTokens.find(t => t.symbol === toToken);

			const result = await uniswapService.executeSwap(
				fromTokenData.address,
				toTokenData.address,
				fromAmount,
				address,
				signer
			);

			toaster.create({
				title: "Swap Successful",
				description: `Successfully swapped ${fromAmount} ${fromToken} for ${result.amountOut} ${toToken}`,
				type: "success",
				duration: 5000,
			});

			// Reset form
			setFromAmount("");
			setToAmount("");
			setQuote(null);
		} catch (error) {
			console.error('Swap error:', error);
			toaster.create({
				title: "Swap Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsSwapping(false);
		}
	};

	const getTokenBalance = (tokenSymbol) => {
		switch (tokenSymbol) {
			case 'WETH':
				return ethBalance;
			case 'SABI':
				return sabiBalance;
			case 'USDT':
				return '0.00'; // You might want to fetch this from a contract
			default:
				return '0.00';
		}
	};

	const getTokenIcon = (tokenSymbol) => {
		const iconMap = {
			'WETH': '🔷',
			'SABI': '💰',
			'USDT': '💵',
		};
		return iconMap[tokenSymbol] || '🪙';
	};

	return (
		<Container maxW="4xl" p={0}>
			<VStack gap={10} align="stretch">
				<SimpleHeading
					icon={FaArrowRightArrowLeft}
					headingTitle={"Token Swap"}
					headingDesc={"Swap tokens instantly using Uniswap"}
				/>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={"Please connect your wallet to swap tokens"}
					/>
				)}

				{isConnected && (
					<>
						{/* Token Balances */}
						<Box
							display="grid"
							gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
							gap={4}
						>
							{supportedTokens.map((token) => (
								<Card.Root key={token.symbol} bg="gray.900" border="1px solid" borderColor="gray.700">
									<Card.Body p={4}>
										<HStack>
											<Text fontSize="2xl">{getTokenIcon(token.symbol)}</Text>
											<Box>
												<Text fontWeight="bold" color="white">
													{token.symbol}
												</Text>
												<Text fontSize="sm" color="gray.400">
													{token.name}
												</Text>
												<Text fontSize="sm" color="blue.300">
													Balance: {getTokenBalance(token.symbol)}
												</Text>
											</Box>
										</HStack>
									</Card.Body>
								</Card.Root>
							))}
						</Box>

						{/* Swap Interface */}
						<Card.Root bg="gray.900" border="1px solid" borderColor="gray.700">
							<Card.Body p={6}>
								<VStack gap={6}>
									{/* From Token */}
									<Box w="full">
										<Text mb={2} color="gray.300" fontSize="sm">
											From
										</Text>
										<Card.Root bg="gray.800" border="1px solid" borderColor="gray.600">
											<Card.Body p={4}>
												<HStack justify="space-between">
													<VStack align="start" flex={1}>
														<select
															value={fromToken}
															onChange={(e) => setFromToken(e.target.value)}
															style={{
																background: "transparent",
																border: "none",
																color: "white",
																fontSize: "18px",
																fontWeight: "bold",
															}}
														>
															{supportedTokens.map((token) => (
																<option
																	key={token.symbol}
																	value={token.symbol}
																	style={{ background: "#1A202C" }}
																>
																	{token.symbol}
																</option>
															))}
														</select>
														<Text fontSize="sm" color="gray.400">
															Balance: {getTokenBalance(fromToken)}
														</Text>
													</VStack>
													<Input
														type="number"
														step="0.000001"
														placeholder="0.0"
														value={fromAmount}
														onChange={(e) => handleFromAmountChange(e.target.value)}
														textAlign="right"
														fontSize="xl"
														fontWeight="bold"
														bg="transparent"
														border="none"
														color="white"
														_focus={{ outline: "none" }}
													/>
												</HStack>
											</Card.Body>
										</Card.Root>
									</Box>

									{/* Swap Button */}
									<Button
										onClick={handleSwapTokens}
										bg="gray.700"
										color="white"
										rounded="full"
										p={2}
										minW="40px"
										h="40px"
										_hover={{ bg: "gray.600" }}
									>
										<FaArrowsRotate />
									</Button>

									{/* To Token */}
									<Box w="full">
										<Text mb={2} color="gray.300" fontSize="sm">
											To (estimated)
										</Text>
										<Card.Root bg="gray.800" border="1px solid" borderColor="gray.600">
											<Card.Body p={4}>
												<HStack justify="space-between">
													<VStack align="start" flex={1}>
														<select
															value={toToken}
															onChange={(e) => setToToken(e.target.value)}
															style={{
																background: "transparent",
																border: "none",
																color: "white",
																fontSize: "18px",
																fontWeight: "bold",
															}}
														>
															{supportedTokens.map((token) => (
																<option
																	key={token.symbol}
																	value={token.symbol}
																	style={{ background: "#1A202C" }}
																>
																	{token.symbol}
																</option>
															))}
														</select>
														<Text fontSize="sm" color="gray.400">
															Balance: {getTokenBalance(toToken)}
														</Text>
													</VStack>
													<Box textAlign="right">
														{loadingQuote ? (
															<Spinner size="sm" />
														) : (
															<Text
																fontSize="xl"
																fontWeight="bold"
																color="white"
															>
																{toAmount || "0.0"}
															</Text>
														)}
													</Box>
												</HStack>
											</Card.Body>
										</Card.Root>
									</Box>

									{/* Quote Information */}
									{quote && (
										<Box w="full" p={4} bg="blue.900" rounded="lg">
											<VStack align="start" gap={2}>
												<Text fontSize="sm" color="blue.200" fontWeight="bold">
													Swap Details:
												</Text>
												<HStack justify="space-between" w="full">
													<Text fontSize="sm" color="blue.300">
														Price Impact:
													</Text>
													<Text fontSize="sm" color="blue.300">
														{quote.priceImpact}%
													</Text>
												</HStack>
												<HStack justify="space-between" w="full">
													<Text fontSize="sm" color="blue.300">
														Minimum Received:
													</Text>
													<Text fontSize="sm" color="blue.300">
														{quote.minimumAmountOut} {toToken}
													</Text>
												</HStack>
												<HStack justify="space-between" w="full">
													<Text fontSize="sm" color="blue.300">
														Gas Estimate:
													</Text>
													<Text fontSize="sm" color="blue.300">
														{quote.gasEstimate}
													</Text>
												</HStack>
											</VStack>
										</Box>
									)}

									{/* Swap Button */}
									<Button
										onClick={handleSwap}
										bg="#0088CD"
										color="white"
										size="lg"
										w="full"
										rounded="lg"
										fontWeight={600}
										isLoading={isSwapping}
										loadingText="Swapping..."
										isDisabled={
											!isConnected ||
											!fromAmount ||
											!toAmount ||
											loadingQuote ||
											!quote
										}
										_hover={{ bg: "#0077B6" }}
									>
										<FaCoins />
										Swap Tokens
									</Button>
								</VStack>
							</Card.Body>
						</Card.Root>

						{/* Information Card */}
						<Card.Root bg="blue.900" borderColor="blue.700">
							<Card.Body>
								<VStack gap={3} align="start">
									<Text fontWeight="bold" color="blue.200">
										Swap Information:
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Swaps are powered by Uniswap V3
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Prices are updated in real-time
									</Text>
									<Text fontSize="sm" color="blue.300">
										• 0.5% slippage tolerance applied automatically
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Make sure you have enough ETH for gas fees
									</Text>
								</VStack>
							</Card.Body>
						</Card.Root>
					</>
				)}
			</VStack>
		</Container>
	);
};

export default Swap;
