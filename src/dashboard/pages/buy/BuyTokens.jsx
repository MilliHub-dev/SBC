import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Input,
	Text,
	VStack,
	Card,
	Field,
	Container,
	Spinner,
} from "@chakra-ui/react";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { LuWallet } from "react-icons/lu";
import SimpleHeading from "@/dashboard/components/SimpleHeading/SimpleHeading";
import TokenWrap from "./TokenWrap";
import { solanaService } from "../../../services/solanaService";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

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

	// Initialize Service and load claim conditions
	useEffect(() => {
		const initializeService = async () => {
			if (!isConnected || !connection) return;

			try {
				setLoadingConditions(true);
				await solanaService.initialize(connection);
				
				// Get claim conditions (Mocked for Solana)
				const conditions = await solanaService.getClaimConditions();
				// Set default if empty
				if (!conditions.pricePerToken) {
					conditions.pricePerToken = "0.001"; // Default 0.001 SOL per Token
					conditions.maxClaimableSupply = "1000000000";
					conditions.supplyClaimed = "0";
				}
				setClaimConditions(conditions);

				// Check user eligibility (Mocked for Solana)
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
				// Buy with SOL using Solana Service
				// thirdwebService is now an instance of SolanaService
				result = await thirdwebService.buyWithSOL(connection, publicKey, sendTransaction, amount);
				
				toaster.create({
					title: "Purchase Successful",
					description: `Successfully bought ${result.tokensReceived || calculateTokensFromSOL(amount)} Sabi Cash with ${amount} SOL`,
					type: "success",
					duration: 5000,
				});
			} else if (paymentMethod === "tokens") {
				// Direct token claim (Convert token amount to SOL and buy)
				const solRequired = calculateSOLFromTokens(amount);
				result = await thirdwebService.buyWithSOL(connection, publicKey, sendTransaction, solRequired);
				
				toaster.create({
					title: "Claim Successful",
					description: `Successfully claimed ${amount} Sabi Cash tokens`,
					type: "success",
					duration: 5000,
				});
			}

			// Refresh claim eligibility after successful purchase
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

	return (
		<Container maxW="4xl" p={0}>
			<VStack gap={10} align="stretch">
				<SimpleHeading
					icon={LuWallet}
					headingTitle={"Buy Sabi Cash"}
					headingDesc={
						"Purchase Sabi Cash tokens directly with Solana (SOL)"
					}
				/>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={"Please connect your wallet to buy Sabi Cash"}
					/>
				)}

				{loadingConditions && isConnected && (
					<Box textAlign="center" py={8}>
						<Spinner size="lg" />
						<Text mt={4} color="gray.400">Loading token drop information...</Text>
					</Box>
				)}

				{isConnected && !loadingConditions && (
					<>
						<Box
							display={"grid"}
							gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }}
							gap={2}
						>
							<TokenWrap
								name={"Solana"}
								abv={"SOL"}
								tokenPrice={claimConditions?.pricePerToken && parseFloat(claimConditions.pricePerToken) > 0 ? `${(1 / parseFloat(claimConditions.pricePerToken)).toFixed(0)} SBC per SOL` : "N/A"}
								balance={solBalance}
							/>
							<TokenWrap
								name={"Sabi Cash"}
								abv={"SBC"}
								tokenPrice={claimConditions?.pricePerToken && parseFloat(claimConditions.pricePerToken) > 0 ? `${claimConditions.pricePerToken} SOL per SBC` : "N/A"}
								balance={sabiBalance}
							/>
						</Box>

						{/* Claim Information */}
						{claimConditions && (
							<Card.Root bg="blue.900" borderColor="blue.700">
								<Card.Body>
									<VStack gap={3} align="start">
										<Text fontWeight="bold" color="blue.200">
											Token Drop Information:
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Price per token: {claimConditions.pricePerToken} SOL
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Total supply: {claimConditions.maxClaimableSupply} tokens
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Already claimed: {claimConditions.supplyClaimed} tokens
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Your max claimable: {getMaxClaimable()} tokens
										</Text>
										<Text fontSize="sm" color="blue.300">
											• You already claimed: {getAlreadyClaimed()} tokens
										</Text>
									</VStack>
								</Card.Body>
							</Card.Root>
						)}

						<Card.Root border={0}>
							<Card.Body bg={"gray.900"}>
								<VStack spaceY={4}>
									<Field.Root color={"#fff"}>
										<Field.Label fontSize={16} mb={2}>
											Purchase Method
										</Field.Label>
										<select
											style={{
												width: "100%",
												border: "1px solid",
												borderColor: "#71717A",
												padding: "12.5px 10px ",
												borderRadius: "5px",
												backgroundColor: "#18181B",
												outline: "none",
												fontSize: "15px",
											}}
											value={paymentMethod}
											onChange={(e) =>
												setPaymentMethod(e.target.value)
											}
										>
											<option value="sol">Pay with SOL</option>
											<option value="tokens">Direct Token Claim</option>
										</select>
									</Field.Root>

									<Field.Root>
										<Field.Label color={"white"} fontSize={16} mb={2}>
											Amount{" "}
											{paymentMethod === "sol"
												? "(SOL)"
												: "(SBC Tokens)"}
										</Field.Label>
										<Input
											type="number"
											step={paymentMethod === "sol" ? "0.001" : "1"}
											outline={"none"}
											fontSize={"15px"}
											color={"#fff"}
											bg={"transparent"}
											padding={"20px 10px"}
											borderColor={"gray.500"}
											placeholder={`Enter amount in ${
												paymentMethod === "sol" ? "SOL" : "tokens"
											}`}
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
										/>
										{amount && paymentMethod === "sol" && (
											<Field.HelperText color="gray.400">
												≈ {calculateTokensFromSOL(amount)} SBC tokens
											</Field.HelperText>
										)}
										{amount && paymentMethod === "tokens" && (
											<Field.HelperText color="gray.400">
												≈ {calculateSOLFromTokens(amount)} SOL required
											</Field.HelperText>
										)}
									</Field.Root>

									<Button
										bg="#0088CD"
										color="white"
										size="lg"
										w="full"
										rounded={"lg"}
										fontWeight={600}
										onClick={handleBuy}
										isLoading={isLoading}
										loadingText="Processing..."
										isDisabled={!isConnected || !amount || !userClaimEligibility?.canClaim}
										_hover={{ bg: "#0077B6" }}
									>
										<LuWallet /> 
										{paymentMethod === "sol" ? "Buy with SOL" : "Claim Tokens"}
									</Button>

									{!userClaimEligibility?.canClaim && userClaimEligibility?.reasons && (
										<Text fontSize="sm" color="red.400" textAlign="center">
											{userClaimEligibility.reasons.join(', ')}
										</Text>
									)}
								</VStack>
							</Card.Body>
						</Card.Root>

						<Card.Root bg="blue.900" borderColor="blue.700">
							<Card.Body>
								<VStack gap={3} align="start">
									<Text fontWeight="bold" color="blue.200">
										Purchase Information:
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Buy Sabi Cash tokens through ThirdWeb token drop
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Tokens will be transferred to your connected wallet
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Make sure you have enough SOL for transaction fees
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Each wallet has a maximum claimable limit
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

export default BuyTokens;
