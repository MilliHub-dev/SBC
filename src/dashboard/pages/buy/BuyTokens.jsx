import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Input,
	Text,
	Container,
	Spinner,
	Flex,
	Icon,
	Grid,
	Badge,
	Menu,
	Portal,
} from "@chakra-ui/react";
import { FaWallet, FaCoins, FaArrowRight, FaBolt, FaShieldHalved, FaChartLine, FaChevronDown } from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { solanaService } from "../../../services/solanaService";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/apiConfig";

const BuyTokens = () => {
	const [paymentMethod, setPaymentMethod] = useState("sol");
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [claimConditions, setClaimConditions] = useState(null);
	const [userClaimEligibility, setUserClaimEligibility] = useState(null);
	const [loadingConditions, setLoadingConditions] = useState(true);

	const {
		isConnected,
		address,
		solBalance,
		sabiBalance,
	} = useWeb3();

	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();

	useEffect(() => {
		const initializeService = async () => {
			if (!isConnected || !connection) return;

			try {
				setLoadingConditions(true);
				await solanaService.initialize(connection);

				const conditions = await solanaService.getClaimConditions();
				if (!conditions.pricePerToken) {
					conditions.pricePerToken = "0.001";
					conditions.maxClaimableSupply = "1000000000";
					conditions.supplyClaimed = "0";
				}
				setClaimConditions(conditions);

				const eligibility = await solanaService.canClaim(address, 1);
				setUserClaimEligibility(eligibility);
			} catch (error) {
				console.error('Error initializing Service:', error);
				toaster.create({
					title: "Initialization Error",
					description: "Failed to load token drop information",
					type: "error",
					duration: 5000,
				});
			} finally {
				setLoadingConditions(false);
			}
		};

		initializeService();
	}, [isConnected, connection, address]);

	const calculateTokensFromSOL = (solAmount) => {
		if (!claimConditions) return 0;
		const pricePerToken = parseFloat(claimConditions.pricePerToken) || 0.001;
		return Math.floor(parseFloat(solAmount) / pricePerToken);
	};

	const calculateSOLFromTokens = (tokenAmount) => {
		if (!claimConditions) return 0;
		const pricePerToken = parseFloat(claimConditions.pricePerToken) || 0.001;
		return (parseFloat(tokenAmount) * pricePerToken).toFixed(6);
	};

	const handleBuy = async () => {
		if (!isConnected) {
			toaster.create({
				title: "Wallet Not Connected",
				description: "Please connect your wallet first",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (!amount || parseFloat(amount) <= 0) {
			toaster.create({
				title: "Invalid Amount",
				description: "Please enter a valid amount",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (!userClaimEligibility?.canClaim) {
			toaster.create({
				title: "Cannot Claim",
				description: userClaimEligibility?.reasons?.join(', ') || "You are not eligible to claim tokens",
				type: "error",
				duration: 5000,
			});
			return;
		}

		setIsLoading(true);
		try {
			let result;

			if (paymentMethod === "sol") {
				result = await solanaService.buyWithSOL(connection, publicKey, sendTransaction, amount);

				// Log transaction to backend
				try {
					await axios.post(API_ENDPOINTS.TRANSACTIONS.LOG, {
						walletAddress: publicKey.toString(),
						transactionHash: result.hash,
						transactionType: 'buy_with_sol',
						network: 'solana',
						ethAmount: result.solSpent, // Using eth_amount for SOL
						sabiCashAmount: result.tokensReceived || calculateTokensFromSOL(amount),
						status: 'confirmed'
					});
				} catch (logError) {
					console.error("Failed to log transaction:", logError);
				}

				toaster.create({
					title: "Purchase Successful",
					description: `Successfully bought ${result.tokensReceived || calculateTokensFromSOL(amount)} Sabi Cash with ${amount} SOL`,
					type: "success",
					duration: 5000,
				});
			} else if (paymentMethod === "tokens") {
				const solRequired = calculateSOLFromTokens(amount);
				result = await solanaService.buyWithSOL(connection, publicKey, sendTransaction, solRequired);

				toaster.create({
					title: "Claim Successful",
					description: `Successfully claimed ${amount} Sabi Cash tokens`,
					type: "success",
					duration: 5000,
				});
			}

			const newEligibility = await solanaService.canClaim(address, 1);
			setUserClaimEligibility(newEligibility);

			setAmount("");
		} catch (error) {
			toaster.create({
				title: "Purchase Failed",
				description: error.message || "Transaction failed",
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const getMaxClaimable = () => {
		if (!userClaimEligibility) return 0;
		return userClaimEligibility.maxClaimable;
	};

	const getAlreadyClaimed = () => {
		if (!userClaimEligibility) return 0;
		return userClaimEligibility.alreadyClaimed;
	};

	const getTokenIcon = (symbol) => {
		const icons = {
			SOL: "◎",
			SBC: "💎",
		};
		return icons[symbol] || "🪙";
	};

	return (
		<Container maxW="800px" p={0}>
			<Flex direction="column" gap={8}>
				{/* Page Header */}
				<Box>
					<Flex align="center" gap={3} mb={3}>
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
							<Icon as={FaWallet} color="white" boxSize={6} />
						</Box>
						<Box>
							<Text
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
							>
								Buy Sabi Cash
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Purchase SBC tokens directly with Solana (SOL)
							</Text>
						</Box>
					</Flex>
				</Box>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={"Please connect your wallet to buy Sabi Cash"}
					/>
				)}

				{loadingConditions && isConnected && (
					<Flex justify="center" align="center" py={16}>
						<Box textAlign="center">
							<Spinner size="xl" color="cyan.400" thickness="4px" speed="0.8s" />
							<Text mt={4} color="whiteAlpha.600" fontSize="sm">
								Loading token drop information...
							</Text>
						</Box>
					</Flex>
				)}

				{isConnected && !loadingConditions && (
					<>
						{/* Balance Cards */}
						<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
							<Box className="blockchain-card" p={5} position="relative" overflow="hidden">
								<Box
									position="absolute"
									top="-30%"
									right="-20%"
									w="150px"
									h="150px"
									bg="radial-gradient(circle, rgba(148, 69, 255, 0.1) 0%, transparent 70%)"
									filter="blur(40px)"
									pointerEvents="none"
								/>
								<Flex align="center" justify="space-between" position="relative" zIndex={1}>
									<Box>
										<Text fontSize="sm" color="whiteAlpha.600" mb={1}>SOL Balance</Text>
										<Text
											fontSize="3xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											color="purple.400"
										>
											{solBalance}
										</Text>
										<Text fontSize="xs" color="whiteAlpha.500" mt={1}>
											{claimConditions?.pricePerToken && parseFloat(claimConditions.pricePerToken) > 0
												? `${(1 / parseFloat(claimConditions.pricePerToken)).toFixed(0)} SBC per SOL`
												: "N/A"}
										</Text>
									</Box>
									<Box
										w="50px"
										h="50px"
										borderRadius="xl"
										bg="rgba(148, 69, 255, 0.1)"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Text fontSize="2xl">◎</Text>
									</Box>
								</Flex>
							</Box>

							<Box className="blockchain-card" p={5} position="relative" overflow="hidden">
								<Box
									position="absolute"
									top="-30%"
									right="-20%"
									w="150px"
									h="150px"
									bg="radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)"
									filter="blur(40px)"
									pointerEvents="none"
								/>
								<Flex align="center" justify="space-between" position="relative" zIndex={1}>
									<Box>
										<Text fontSize="sm" color="whiteAlpha.600" mb={1}>SBC Balance</Text>
										<Text
											fontSize="3xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											className="text-gradient-cyber"
										>
											{sabiBalance}
										</Text>
										<Text fontSize="xs" color="whiteAlpha.500" mt={1}>
											{claimConditions?.pricePerToken && parseFloat(claimConditions.pricePerToken) > 0
												? `${claimConditions.pricePerToken} SOL per SBC`
												: "N/A"}
										</Text>
									</Box>
									<Box
										w="50px"
										h="50px"
										borderRadius="xl"
										bg="rgba(0, 255, 255, 0.1)"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={FaCoins} color="cyan.400" boxSize={6} />
									</Box>
								</Flex>
							</Box>
						</Grid>

						{/* Token Drop Info */}
						{claimConditions && (
							<Box className="blockchain-card" p={5}>
								<Flex align="center" gap={2} mb={4}>
									<Icon as={FaChartLine} color="cyan.400" boxSize={5} />
									<Text fontWeight="bold" fontFamily="'Space Grotesk', sans-serif">
										Token Drop Status
									</Text>
								</Flex>
								<Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
									<Box className="glass" p={3} borderRadius="xl" textAlign="center">
										<Text fontSize="xs" color="whiteAlpha.600" mb={1}>Price</Text>
										<Text fontWeight="bold" color="cyan.400">
											{claimConditions.pricePerToken} SOL
										</Text>
									</Box>
									<Box className="glass" p={3} borderRadius="xl" textAlign="center">
										<Text fontSize="xs" color="whiteAlpha.600" mb={1}>Total Supply</Text>
										<Text fontWeight="bold">
											{parseInt(claimConditions.maxClaimableSupply).toLocaleString()}
										</Text>
									</Box>
									<Box className="glass" p={3} borderRadius="xl" textAlign="center">
										<Text fontSize="xs" color="whiteAlpha.600" mb={1}>Your Limit</Text>
										<Text fontWeight="bold" color="green.400">
											{getMaxClaimable()}
										</Text>
									</Box>
									<Box className="glass" p={3} borderRadius="xl" textAlign="center">
										<Text fontSize="xs" color="whiteAlpha.600" mb={1}>You Claimed</Text>
										<Text fontWeight="bold" color="purple.400">
											{getAlreadyClaimed()}
										</Text>
									</Box>
								</Grid>
							</Box>
						)}

						{/* Purchase Card */}
						<Box className="blockchain-card" p={6} position="relative" overflow="hidden">
							<Box
								position="absolute"
								top="-50%"
								left="-20%"
								w="300px"
								h="300px"
								bg="radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)"
								filter="blur(60px)"
								pointerEvents="none"
							/>

							<Flex direction="column" gap={6} position="relative" zIndex={1}>
								<Flex align="center" gap={2}>
									<Icon as={FaWallet} color="cyan.400" boxSize={5} />
									<Text fontWeight="bold" fontSize="lg" fontFamily="'Space Grotesk', sans-serif">
										Purchase Tokens
									</Text>
								</Flex>

								{/* Payment Method */}
								<Box className="glass" p={4} borderRadius="xl">
									<Text fontSize="sm" color="whiteAlpha.600" mb={3}>Purchase Method</Text>
									<Menu.Root>
										<Menu.Trigger asChild>
											<Button
												w="full"
												className="glass"
												justifyContent="space-between"
												py={6}
												borderRadius="xl"
												_hover={{ bg: "rgba(0, 255, 255, 0.05)" }}
											>
												<Flex align="center" gap={3}>
													<Text fontSize="xl">{paymentMethod === "sol" ? "◎" : "💎"}</Text>
													<Box textAlign="left">
														<Text fontWeight="600">
															{paymentMethod === "sol" ? "Pay with SOL" : "Direct Token Claim"}
														</Text>
														<Text fontSize="xs" color="whiteAlpha.500">
															{paymentMethod === "sol" ? "Use Solana to buy SBC" : "Claim specific token amount"}
														</Text>
													</Box>
												</Flex>
												<Icon as={FaChevronDown} color="whiteAlpha.600" />
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
													<Menu.Item
														value="sol"
														onClick={() => setPaymentMethod("sol")}
														bg="transparent"
														_hover={{ bg: "rgba(0, 255, 255, 0.1)" }}
														borderRadius="lg"
														p={3}
														mb={1}
													>
														<Flex align="center" gap={3}>
															<Text fontSize="xl">◎</Text>
															<Box>
																<Text fontWeight="bold">Pay with SOL</Text>
																<Text fontSize="xs" color="whiteAlpha.600">Use Solana to buy SBC</Text>
															</Box>
														</Flex>
													</Menu.Item>
													<Menu.Item
														value="tokens"
														onClick={() => setPaymentMethod("tokens")}
														bg="transparent"
														_hover={{ bg: "rgba(0, 255, 255, 0.1)" }}
														borderRadius="lg"
														p={3}
													>
														<Flex align="center" gap={3}>
															<Text fontSize="xl">💎</Text>
															<Box>
																<Text fontWeight="bold">Direct Token Claim</Text>
																<Text fontSize="xs" color="whiteAlpha.600">Claim specific amount of SBC</Text>
															</Box>
														</Flex>
													</Menu.Item>
												</Menu.Content>
											</Menu.Positioner>
										</Portal>
									</Menu.Root>
								</Box>

								{/* Amount Input */}
								<Box className="glass" p={5} borderRadius="xl">
									<Flex justify="space-between" mb={3}>
										<Text fontSize="sm" color="whiteAlpha.600">
											Amount ({paymentMethod === "sol" ? "SOL" : "SBC"})
										</Text>
										<Flex align="center" gap={2}>
											<Text fontSize="sm" color="whiteAlpha.600">
												Balance: {paymentMethod === "sol" ? solBalance : sabiBalance}
											</Text>
											{paymentMethod === "sol" && (
												<Button
													size="xs"
													variant="ghost"
													color="cyan.400"
													h="auto"
													p={1}
													onClick={() => setAmount(solBalance)}
													_hover={{ bg: "rgba(0, 255, 255, 0.1)" }}
												>
													MAX
												</Button>
											)}
										</Flex>
									</Flex>
									<Input
										type="number"
										step={paymentMethod === "sol" ? "0.001" : "1"}
										placeholder={`Enter ${paymentMethod === "sol" ? "SOL" : "SBC"} amount`}
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										fontSize="2xl"
										fontWeight="bold"
										fontFamily="'Space Grotesk', sans-serif"
										bg="transparent"
										border="none"
										p={0}
										color="white"
										_focus={{ outline: "none", boxShadow: "none" }}
										_placeholder={{ color: "whiteAlpha.300" }}
									/>
									{amount && (
										<Text fontSize="sm" color="whiteAlpha.600" mt={2}>
											{paymentMethod === "sol"
												? `≈ ${calculateTokensFromSOL(amount)} SBC tokens`
												: `≈ ${calculateSOLFromTokens(amount)} SOL required`}
										</Text>
									)}
								</Box>

								{/* Purchase Button */}
								<Button
									onClick={handleBuy}
									bg={!amount || !userClaimEligibility?.canClaim
										? "whiteAlpha.200"
										: "linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"}
									color={!amount || !userClaimEligibility?.canClaim ? "whiteAlpha.500" : "white"}
									size="lg"
									w="full"
									h="56px"
									borderRadius="xl"
									fontSize="lg"
									fontWeight="bold"
									isLoading={isLoading}
									loadingText="Processing..."
									isDisabled={!isConnected || !amount || !userClaimEligibility?.canClaim}
									leftIcon={<FaWallet />}
									_hover={amount && userClaimEligibility?.canClaim ? {
										transform: "translateY(-2px)",
										boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
									} : {}}
									_disabled={{
										cursor: "not-allowed",
										opacity: 0.6,
									}}
									transition="all 0.3s ease"
								>
									{paymentMethod === "sol" ? "Buy with SOL" : "Claim Tokens"}
								</Button>

								{!userClaimEligibility?.canClaim && userClaimEligibility?.reasons && (
									<Box className="glass" p={4} borderRadius="xl" borderColor="red.500" borderWidth={1}>
										<Text fontSize="sm" color="red.400" textAlign="center">
											{userClaimEligibility.reasons.join(', ')}
										</Text>
									</Box>
								)}
							</Flex>
						</Box>

						{/* Information Card */}
						<Box className="blockchain-card" p={6} position="relative" overflow="hidden">
							<Box
								position="absolute"
								top="-30%"
								right="-10%"
								w="200px"
								h="200px"
								bg="radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)"
								filter="blur(60px)"
								pointerEvents="none"
							/>

							<Flex direction="column" gap={4} position="relative" zIndex={1}>
								<Flex align="center" gap={2}>
									<Icon as={HiOutlineSparkles} color="cyan.400" boxSize={5} />
									<Text fontWeight="bold" fontSize="lg" fontFamily="'Space Grotesk', sans-serif">
										Purchase Information
									</Text>
								</Flex>

								<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
									{[
										{ icon: FaCoins, text: "Buy SBC tokens through secure token drop", color: "cyan.400" },
										{ icon: FaWallet, text: "Tokens are transferred directly to your wallet", color: "purple.400" },
										{ icon: FaBolt, text: "Make sure you have enough SOL for fees", color: "green.400" },
										{ icon: FaShieldHalved, text: "Each wallet has a maximum claimable limit", color: "yellow.400" },
									].map((item, index) => (
										<Flex key={index} align="center" gap={3} className="glass" p={4} borderRadius="xl">
											<Box
												w="36px"
												h="36px"
												borderRadius="lg"
												bg={`rgba(${item.color === "cyan.400" ? "0, 255, 255" : item.color === "purple.400" ? "168, 85, 247" : item.color === "green.400" ? "16, 185, 129" : "234, 179, 8"}, 0.1)`}
												display="flex"
												alignItems="center"
												justifyContent="center"
												flexShrink={0}
											>
												<Icon as={item.icon} color={item.color} boxSize={4} />
											</Box>
											<Text fontSize="sm" color="whiteAlpha.700">
												{item.text}
											</Text>
										</Flex>
									))}
								</Grid>

								<Box className="glass" p={4} borderRadius="xl" mt={2}>
									<Flex align="center" gap={2}>
										<Box className="network-online" />
										<Text fontSize="sm" color="whiteAlpha.600">
											Secure transactions powered by Solana blockchain
										</Text>
									</Flex>
								</Box>
							</Flex>
						</Box>
					</>
				)}
			</Flex>
		</Container>
	);
};

export default BuyTokens;
