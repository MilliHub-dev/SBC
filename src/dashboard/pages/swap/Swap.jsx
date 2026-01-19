import React, { useState, useEffect } from "react";
import { useSDK } from "@thirdweb-dev/react";

import {
	Box,
	Text,
	Button,
	Input,
	VStack,
	HStack,
	Card,
	Container,
	Spinner,
	Menu,
	Portal,
	Image,
	IconButton,
	Flex,
} from "@chakra-ui/react";
import {
	FaArrowsRotate,
	FaCoins,
	FaArrowRightArrowLeft,
	FaChevronDown,
	FaGear,
} from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";

import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import SimpleHeading from "@/dashboard/components/SimpleHeading/SimpleHeading";
import { uniswapService } from "../../../services/uniswapService";
import { UNISWAP_CONFIG, SABI_CASH_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS } from "../../../config/web3Config";

const Swap = () => {
	const [fromToken, setFromToken] = useState("WETH");
	const [toToken, setToToken] = useState("SBC");
	const [fromAmount, setFromAmount] = useState("");
	const [toAmount, setToAmount] = useState("");
	const [isSwapping, setIsSwapping] = useState(false);
	const [quote, setQuote] = useState(null);
	const [loadingQuote, setLoadingQuote] = useState(false);
	const [supportedTokens, setSupportedTokens] = useState([]);
	// const [provider, setProvider] = useState(null); // Removed manual provider state

	const { isConnected, address, ethBalance, sabiBalance } = useWeb3();
	const sdk = useSDK();
	const provider = sdk?.getProvider();

	// Initialize Uniswap service
	useEffect(() => {
		const initializeUniswap = async () => {
			if (!provider) return;

			try {
				// uniswapService expects a provider
				await uniswapService.initialize(provider);
				const tokens = uniswapService.getSupportedTokens();
				setSupportedTokens(tokens);
			} catch (error) {
				console.error("Error initializing Uniswap:", error);
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
				const fromTokenData = supportedTokens.find((t) => t.symbol === fromToken);
				const toTokenData = supportedTokens.find((t) => t.symbol === toToken);

				if (!fromTokenData || !toTokenData) {
					throw new Error("Unsupported token pair");
				}

				const quoteResult = await uniswapService.getQuote(
					fromTokenData.address,
					toTokenData.address,
					fromAmount
				);

				setQuote(quoteResult);
				setToAmount(quoteResult.amountOut);
			} catch (error) {
				console.error("Error getting quote:", error);
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

		// Ensure we have a signer (ethers Signer) before executing the swap
		let signer = null;
		if (provider) {
			try {
				signer = await provider.getSigner();
			} catch (err) {
				console.warn("Failed to get signer from provider:", err);
			}
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
			const fromTokenData = supportedTokens.find((t) => t.symbol === fromToken);
			const toTokenData = supportedTokens.find((t) => t.symbol === toToken);

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

			setFromAmount("");
			setToAmount("");
			setQuote(null);
		} catch (error) {
			console.error("Swap error:", error);
			toaster.create({
				title: "Swap Failed",
				description: error.message || "Swap failed",
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsSwapping(false);
		}
	};

	const getTokenBalance = (tokenSymbol) => {
		switch (tokenSymbol) {
			case "WETH":
				return ethBalance;
			case "SBC":
				return sabiBalance;
			case "USDT":
				return "0.00"; // placeholder; can be fetched via publicClient
			default:
				return "0.00";
		}
	};

	const getTokenIcon = (tokenSymbol) => {
		const iconMap = {
			WETH: "🔷",
			SBC: "💰",
			USDT: "💵",
		};
		return iconMap[tokenSymbol] || "🪙";
	};

	const TokenSelect = ({ value, onChange, options }) => (
		<Menu.Root>
			<Menu.Trigger asChild>
				<Button
					variant="unstyled"
					bg="blackAlpha.400"
					borderRadius="full"
					px={3}
					py={1}
					h="auto"
					display="flex"
					alignItems="center"
					border="1px solid"
					borderColor="gray.600"
					_hover={{ bg: "blackAlpha.500", borderColor: "gray.500" }}
					_active={{ bg: "blackAlpha.600" }}
				>
					<HStack gap={2}>
						<Text fontSize="lg">{getTokenIcon(value)}</Text>
						<Text fontSize="lg" fontWeight="bold" color="white">
							{value}
						</Text>
						<FaChevronDown size={12} />
					</HStack>
				</Button>
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content bg="gray.900" borderColor="gray.700" p={1}>
						{options.map((token) => (
							<Menu.Item
								key={token.symbol}
								value={token.symbol}
								onClick={() => onChange(token.symbol)}
								bg="transparent"
								_hover={{ bg: "gray.800" }}
								borderRadius="md"
								mb={1}
							>
								<HStack gap={3} w="full">
									<Text fontSize="xl">{getTokenIcon(token.symbol)}</Text>
									<VStack align="start" gap={0}>
										<Text fontWeight="bold" color="white">
											{token.symbol}
										</Text>
										<Text fontSize="xs" color="gray.400">
											{token.name}
										</Text>
									</VStack>
								</HStack>
							</Menu.Item>
						))}
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	);

	return (
		<Container maxW="md" py={8}>
			<VStack gap={6} align="stretch">
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
					<HStack>
						<Text fontSize="2xl" fontWeight="bold">Swap</Text>
					</HStack>
					<IconButton
						icon={<FaGear />}
						variant="ghost"
						color="gray.400"
						aria-label="Settings"
						size="sm"
						_hover={{ bg: "whiteAlpha.200", color: "white" }}
					/>
				</Box>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={"Please connect your wallet to swap tokens"}
					/>
				)}

				{isConnected && (
					<>
						{/* Swap Widget Card */}
						<Card.Root 
							bg="gray.900" 
							border="1px solid" 
							borderColor="gray.700" 
							borderRadius="2xl" 
							boxShadow="xl"
							overflow="hidden"
						>
							<Card.Body p={4}>
								<VStack gap={2}>
									{/* From Token Section */}
									<Box 
										w="full" 
										bg="gray.800" 
										borderRadius="xl" 
										p={4} 
										border="1px solid" 
										borderColor="gray.700"
										_hover={{ borderColor: "gray.600" }}
										transition="all 0.2s"
									>
										<HStack justify="space-between" mb={2}>
											<Text fontSize="sm" color="gray.400">Sell</Text>
											<Text fontSize="sm" color="gray.400">
												Balance: {getTokenBalance(fromToken)}
											</Text>
										</HStack>
										<HStack justify="space-between" align="center">
											<Input
												type="number"
												placeholder="0"
												value={fromAmount}
												onChange={(e) => handleFromAmountChange(e.target.value)}
												fontSize="3xl"
												fontWeight="bold"
												bg="transparent"
												border="none"
												p={0}
												color="white"
												_focus={{ outline: "none" }}
												w="60%"
											/>
											<Box 
												bg="blackAlpha.400" 
												borderRadius="full" 
												px={2} 
												py={1} 
												display="flex" 
												alignItems="center" 
												gap={2}
												border="1px solid"
												borderColor="gray.600"
											>
												<Text fontSize="lg">{getTokenIcon(fromToken)}</Text>
												<select
													value={fromToken}
													onChange={(e) => setFromToken(e.target.value)}
													style={{
														background: "transparent",
														border: "none",
														color: "white",
														fontSize: "16px",
														fontWeight: "bold",
														cursor: "pointer",
														outline: "none",
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
											</Box>
										</HStack>
									</Box>

									{/* Swap Direction Button */}
									<Box position="relative" h="4px" w="full">
										<Box 
											position="absolute" 
											left="50%" 
											top="50%" 
											transform="translate(-50%, -50%)" 
											zIndex={1}
										>
											<Button
												onClick={handleSwapTokens}
												bg="gray.800"
												border="4px solid"
												borderColor="gray.900"
												color="blue.400"
												rounded="xl"
												p={0}
												w="32px"
												h="32px"
												minW="32px"
												_hover={{ bg: "gray.700", transform: "scale(1.1)" }}
												transition="all 0.2s"
											>
												<FaArrowRightArrowLeft size={14} />
											</Button>
										</Box>
									</Box>

									{/* To Token Section */}
									<Box 
										w="full" 
										bg="gray.800" 
										borderRadius="xl" 
										p={4} 
										border="1px solid" 
										borderColor="gray.700"
										_hover={{ borderColor: "gray.600" }}
										transition="all 0.2s"
									>
										<HStack justify="space-between" mb={2}>
											<Text fontSize="sm" color="gray.400">Buy</Text>
											<Text fontSize="sm" color="gray.400">
												Balance: {getTokenBalance(toToken)}
											</Text>
										</HStack>
										<HStack justify="space-between" align="center">
											{loadingQuote ? (
												<Spinner size="lg" color="blue.400" />
											) : (
												<Input
													type="number"
													placeholder="0"
													value={toAmount}
													readOnly
													fontSize="3xl"
													fontWeight="bold"
													bg="transparent"
													border="none"
													p={0}
													color="white"
													_focus={{ outline: "none" }}
													w="60%"
												/>
											)}
											<TokenSelect
												value={toToken}
												onChange={setToToken}
												options={supportedTokens}
											/>
										</HStack>
									</Box>

									{/* Quote Details (Collapsible-like) */}
									{quote && (
										<Box w="full" px={2} py={2}>
											<VStack align="stretch" gap={1}>
												<HStack justify="space-between">
													<Text fontSize="xs" color="gray.500">Rate</Text>
													<Text fontSize="xs" color="white">
														1 {fromToken} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount || 1)).toFixed(6)} {toToken}
													</Text>
												</HStack>
												<HStack justify="space-between">
													<Text fontSize="xs" color="gray.500">Price Impact</Text>
													<Text fontSize="xs" color={parseFloat(quote.priceImpact) > 2 ? "red.400" : "green.400"}>
														{quote.priceImpact}%
													</Text>
												</HStack>
												<HStack justify="space-between">
													<Text fontSize="xs" color="gray.500">Network Cost</Text>
													<Text fontSize="xs" color="gray.400">
														~${(parseFloat(quote.gasEstimate) * 0.000000001 * 2000).toFixed(2)}
													</Text>
												</HStack>
											</VStack>
										</Box>
									)}

									{/* Main Action Button */}
									<Button
										onClick={handleSwap}
										bg="#0088CD"
										color="white"
										size="lg"
										w="full"
										h="56px"
										rounded="xl"
										fontSize="lg"
										fontWeight="bold"
										isLoading={isSwapping}
										loadingText="Swapping..."
										isDisabled={
											!isConnected || !fromAmount || !toAmount || loadingQuote || !quote
										}
										_hover={{ bg: "#0077B6", transform: "translateY(-1px)" }}
										_active={{ transform: "translateY(0)" }}
										transition="all 0.2s"
										mt={2}
									>
										{isSwapping ? "Swapping..." : !fromAmount ? "Enter Amount" : "Swap"}
									</Button>
								</VStack>
							</Card.Body>
						</Card.Root>

						{/* Footer Info */}
						<Text textAlign="center" fontSize="xs" color="gray.500" mt={4}>
							Powered by Uniswap V3 • Sabi Cash
						</Text>
					</>
				)}
			</VStack>
		</Container>
	);
};

export default Swap;
