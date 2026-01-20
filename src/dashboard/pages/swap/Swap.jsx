import React, { useState, useEffect } from "react";
import {
	Box,
	Text,
	Button,
	Input,
	Container,
	Spinner,
	Menu,
	Portal,
	Flex,
	Icon,
	Grid,
} from "@chakra-ui/react";
import {
	FaArrowsRotate,
	FaCoins,
	FaArrowRightArrowLeft,
	FaChevronDown,
	FaGear,
	FaBolt,
	FaWallet,
	FaArrowDown,
} from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { SABI_CASH_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS } from "../../../config/web3Config";

const Swap = () => {
	const [fromToken, setFromToken] = useState("SOL");
	const [toToken, setToToken] = useState("SBC");
	const [fromAmount, setFromAmount] = useState("");
	const [toAmount, setToAmount] = useState("");
	const [isSwapping, setIsSwapping] = useState(false);
	const [quote, setQuote] = useState(null);
	const [loadingQuote, setLoadingQuote] = useState(false);
	const [supportedTokens] = useState([
		{ symbol: 'SOL', name: 'Solana', address: 'native', color: 'purple' },
		{ symbol: 'SBC', name: 'Sabi Cash', address: SABI_CASH_CONTRACT_ADDRESS, color: 'cyan' },
		{ symbol: 'USDT', name: 'Tether', address: USDT_CONTRACT_ADDRESS, color: 'green' }
	]);

	const { isConnected, solBalance, sabiBalance } = useWeb3();

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
				await new Promise(resolve => setTimeout(resolve, 500));
				const rate = fromToken === 'SOL' ? 100 : 0.01;
				const amountOut = (parseFloat(fromAmount) * rate).toString();
				const gasEstimate = 5000;

				const quoteResult = {
					amountOut,
					gasEstimate,
					priceImpact: "0.05"
				};

				setQuote(quoteResult);
				setToAmount(quoteResult.amountOut);
			} catch (error) {
				console.error("Error getting quote:", error);
				setQuote(null);
				setToAmount("");
			} finally {
				setLoadingQuote(false);
			}
		};

		const debounceTimer = setTimeout(getQuote, 500);
		return () => clearTimeout(debounceTimer);
	}, [fromAmount, fromToken, toToken]);

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

		toaster.create({
			title: "Coming Soon",
			description: "Swap functionality on Solana is coming soon!",
			type: "info",
			duration: 3000,
		});
	};

	const getTokenBalance = (tokenSymbol) => {
		switch (tokenSymbol) {
			case "SOL":
				return solBalance;
			case "SBC":
				return sabiBalance;
			case "USDT":
				return "0.00";
			default:
				return "0.00";
		}
	};

	const getTokenIcon = (tokenSymbol) => {
		const iconMap = {
			SOL: "◎",
			SBC: "💎",
			USDT: "💵",
		};
		return iconMap[tokenSymbol] || "🪙";
	};

	const getTokenColor = (tokenSymbol) => {
		const token = supportedTokens.find(t => t.symbol === tokenSymbol);
		return token?.color || 'cyan';
	};

	const TokenSelect = ({ value, onChange, options, excludeToken }) => (
		<Menu.Root>
			<Menu.Trigger asChild>
				<Button
					variant="unstyled"
					className="glass"
					borderRadius="full"
					px={4}
					py={2}
					h="auto"
					display="flex"
					alignItems="center"
					_hover={{ bg: "rgba(0, 255, 255, 0.1)", borderColor: "cyan.400" }}
				>
					<Flex align="center" gap={2}>
						<Text fontSize="xl">{getTokenIcon(value)}</Text>
						<Text fontSize="lg" fontWeight="bold" color="white">
							{value}
						</Text>
						<Icon as={FaChevronDown} boxSize={3} color="whiteAlpha.600" />
					</Flex>
				</Button>
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content
						bg="rgba(15, 23, 42, 0.95)"
						backdropFilter="blur(20px)"
						border="1px solid rgba(0, 255, 255, 0.2)"
						borderRadius="xl"
						p={2}
						boxShadow="0 0 30px rgba(0, 255, 255, 0.1)"
					>
						{options
							.filter(token => token.symbol !== excludeToken)
							.map((token) => (
								<Menu.Item
									key={token.symbol}
									value={token.symbol}
									onClick={() => onChange(token.symbol)}
									bg="transparent"
									_hover={{ bg: "rgba(0, 255, 255, 0.1)" }}
									borderRadius="lg"
									mb={1}
									p={3}
								>
									<Flex align="center" gap={3} w="full">
										<Text fontSize="xl">{getTokenIcon(token.symbol)}</Text>
										<Box>
											<Text fontWeight="bold" color="white">
												{token.symbol}
											</Text>
											<Text fontSize="xs" color="whiteAlpha.600">
												{token.name}
											</Text>
										</Box>
									</Flex>
								</Menu.Item>
							))}
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	);

	return (
		<Container maxW="500px" p={0}>
			<Flex direction="column" gap={6}>
				{/* Page Header */}
				<Flex align="center" justify="space-between">
					<Flex align="center" gap={3}>
						<Box
							w="50px"
							h="50px"
							borderRadius="xl"
							bg="linear-gradient(135deg, #00FFFF 0%, #0088CC 100%)"
							display="flex"
							alignItems="center"
							justifyContent="center"
							boxShadow="0 0 20px rgba(0, 255, 255, 0.3)"
						>
							<Icon as={FaArrowRightArrowLeft} color="white" boxSize={6} />
						</Box>
						<Box>
							<Text
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
							>
								Swap
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Exchange tokens instantly
							</Text>
						</Box>
					</Flex>
					<Button
						className="glass"
						p={3}
						borderRadius="xl"
						_hover={{ bg: "rgba(0, 255, 255, 0.1)" }}
					>
						<Icon as={FaGear} color="whiteAlpha.700" boxSize={5} />
					</Button>
				</Flex>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={"Please connect your wallet to swap tokens"}
					/>
				)}

				{isConnected && (
					<>
						{/* Swap Card */}
						<Box
							className="blockchain-card"
							p={6}
							position="relative"
							overflow="hidden"
						>
							{/* Background glow */}
							<Box
								position="absolute"
								top="-50%"
								right="-30%"
								w="300px"
								h="300px"
								bg="radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)"
								filter="blur(60px)"
								pointerEvents="none"
							/>

							<Flex direction="column" gap={3} position="relative" zIndex={1}>
								{/* From Token Section */}
								<Box
									className="glass"
									p={4}
									borderRadius="xl"
									border="1px solid"
									borderColor="whiteAlpha.100"
									_hover={{ borderColor: "cyan.400" }}
									transition="all 0.3s ease"
								>
									<Flex justify="space-between" mb={3}>
										<Text fontSize="sm" color="whiteAlpha.600">You Pay</Text>
										<Flex align="center" gap={2}>
											<Icon as={FaWallet} color="whiteAlpha.500" boxSize={3} />
											<Text fontSize="sm" color="whiteAlpha.600">
												{getTokenBalance(fromToken)} {fromToken}
											</Text>
											<Button
												size="xs"
												variant="ghost"
												color="cyan.400"
												fontSize="xs"
												h="auto"
												p={1}
												onClick={() => setFromAmount(getTokenBalance(fromToken))}
												_hover={{ bg: "rgba(0, 255, 255, 0.1)" }}
											>
												MAX
											</Button>
										</Flex>
									</Flex>
									<Flex justify="space-between" align="center">
										<Input
											type="number"
											placeholder="0.00"
											value={fromAmount}
											onChange={(e) => handleFromAmountChange(e.target.value)}
											fontSize="3xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											bg="transparent"
											border="none"
											p={0}
											color="white"
											_focus={{ outline: "none", boxShadow: "none" }}
											_placeholder={{ color: "whiteAlpha.300" }}
											w="60%"
										/>
										<TokenSelect
											value={fromToken}
											onChange={setFromToken}
											options={supportedTokens}
											excludeToken={toToken}
										/>
									</Flex>
								</Box>

								{/* Swap Direction Button */}
								<Flex justify="center" position="relative" my={-2} zIndex={2}>
									<Button
										onClick={handleSwapTokens}
										bg="linear-gradient(135deg, #00FFFF 0%, #0088CC 100%)"
										color="white"
										rounded="full"
										w="44px"
										h="44px"
										minW="44px"
										p={0}
										border="4px solid"
										borderColor="rgba(10, 10, 15, 1)"
										boxShadow="0 0 20px rgba(0, 255, 255, 0.3)"
										_hover={{
											transform: "rotate(180deg)",
											boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
										}}
										transition="all 0.3s ease"
									>
										<Icon as={FaArrowDown} boxSize={5} />
									</Button>
								</Flex>

								{/* To Token Section */}
								<Box
									className="glass"
									p={4}
									borderRadius="xl"
									border="1px solid"
									borderColor="whiteAlpha.100"
									_hover={{ borderColor: "purple.400" }}
									transition="all 0.3s ease"
								>
									<Flex justify="space-between" mb={3}>
										<Text fontSize="sm" color="whiteAlpha.600">You Receive</Text>
										<Flex align="center" gap={2}>
											<Icon as={FaWallet} color="whiteAlpha.500" boxSize={3} />
											<Text fontSize="sm" color="whiteAlpha.600">
												{getTokenBalance(toToken)} {toToken}
											</Text>
										</Flex>
									</Flex>
									<Flex justify="space-between" align="center">
										{loadingQuote ? (
											<Flex align="center" gap={3}>
												<Spinner size="md" color="cyan.400" />
												<Text color="whiteAlpha.500">Getting quote...</Text>
											</Flex>
										) : (
											<Text
												fontSize="3xl"
												fontWeight="bold"
												fontFamily="'Space Grotesk', sans-serif"
												color={toAmount ? "white" : "whiteAlpha.300"}
											>
												{toAmount || "0.00"}
											</Text>
										)}
										<TokenSelect
											value={toToken}
											onChange={setToToken}
											options={supportedTokens}
											excludeToken={fromToken}
										/>
									</Flex>
								</Box>

								{/* Quote Details */}
								{quote && fromAmount && (
									<Box className="glass" p={4} borderRadius="xl" mt={2}>
										<Flex direction="column" gap={2}>
											<Flex justify="space-between" align="center">
												<Text fontSize="sm" color="whiteAlpha.600">Rate</Text>
												<Text fontSize="sm" fontWeight="600">
													1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount || 1)).toFixed(4)} {toToken}
												</Text>
											</Flex>
											<Flex justify="space-between" align="center">
												<Text fontSize="sm" color="whiteAlpha.600">Price Impact</Text>
												<Text
													fontSize="sm"
													fontWeight="600"
													color={parseFloat(quote.priceImpact) > 2 ? "red.400" : "green.400"}
												>
													{quote.priceImpact}%
												</Text>
											</Flex>
											<Flex justify="space-between" align="center">
												<Text fontSize="sm" color="whiteAlpha.600">Network Fee</Text>
												<Text fontSize="sm" fontWeight="600" color="whiteAlpha.700">
													~$0.01
												</Text>
											</Flex>
										</Flex>
									</Box>
								)}

								{/* Swap Button */}
								<Button
									onClick={handleSwap}
									bg={!fromAmount || loadingQuote
										? "whiteAlpha.200"
										: "linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"}
									color={!fromAmount || loadingQuote ? "whiteAlpha.500" : "white"}
									size="lg"
									w="full"
									h="56px"
									borderRadius="xl"
									fontSize="lg"
									fontWeight="bold"
									isLoading={isSwapping}
									loadingText="Swapping..."
									isDisabled={!fromAmount || !toAmount || loadingQuote || !quote}
									_hover={fromAmount && !loadingQuote ? {
										transform: "translateY(-2px)",
										boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
									} : {}}
									_disabled={{
										cursor: "not-allowed",
										opacity: 0.6,
									}}
									transition="all 0.3s ease"
									mt={2}
								>
									{!fromAmount ? "Enter Amount" : "Swap Tokens"}
								</Button>
							</Flex>
						</Box>

						{/* Info Cards */}
						<Grid templateColumns="repeat(2, 1fr)" gap={4}>
							<Box className="glass" p={4} borderRadius="xl" textAlign="center">
								<Icon as={FaBolt} color="cyan.400" boxSize={5} mb={2} />
								<Text fontSize="xs" color="whiteAlpha.600">Instant Swaps</Text>
								<Text fontSize="sm" fontWeight="600">{"<"} 1 Second</Text>
							</Box>
							<Box className="glass" p={4} borderRadius="xl" textAlign="center">
								<Icon as={FaCoins} color="green.400" boxSize={5} mb={2} />
								<Text fontSize="xs" color="whiteAlpha.600">Low Fees</Text>
								<Text fontSize="sm" fontWeight="600">~$0.01</Text>
							</Box>
						</Grid>

						{/* Footer */}
						<Flex align="center" justify="center" gap={2}>
							<Box className="network-online" />
							<Text fontSize="xs" color="whiteAlpha.500">
								Powered by Solana • SabiCash
							</Text>
						</Flex>
					</>
				)}
			</Flex>
		</Container>
	);
};

export default Swap;
