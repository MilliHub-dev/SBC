import React, { useState } from "react";
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

const Swap = () => {
	const [fromToken, setFromToken] = useState("ETH");
	const [toToken, setToToken] = useState("SABI");
	const [fromAmount, setFromAmount] = useState("");
	const [toAmount, setToAmount] = useState("");
	const [isSwapping, setIsSwapping] = useState(false);

	const { isConnected, ethBalance, sabiBalance } = useWeb3();

	// Exchange rates (demo values)
	const exchangeRates = {
		ETH_TO_SABI: 1500, // 1 ETH = 1500 SABI
		SABI_TO_ETH: 0.000667, // 1 SABI = 0.000667 ETH
		ETH_TO_USDT: 2800, // 1 ETH = 2800 USDT
		USDT_TO_ETH: 0.000357, // 1 USDT = 0.000357 ETH
		SABI_TO_USDT: 1.87, // 1 SABI = 1.87 USDT
		USDT_TO_SABI: 0.535, // 1 USDT = 0.535 SABI
	};

	const tokens = [
		{ symbol: "ETH", name: "Ethereum", balance: ethBalance },
		{ symbol: "SABI", name: "Sabi Cash", balance: sabiBalance },
		{ symbol: "USDT", name: "USD Tether", balance: "0.00" },
	];

	const calculateExchange = (amount, from, to) => {
		if (!amount || amount === "0") return "";
		const rate = exchangeRates[`${from}_TO_${to}`];
		return rate ? (parseFloat(amount) * rate).toFixed(6) : "";
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

		setIsSwapping(true);
		try {
			// Simulate swap transaction
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toaster.create({
				title: "Swap Successful",
				description: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
				type: "success",
				duration: 5000,
			});

			setFromAmount("");
			setToAmount("");
			// eslint-disable-next-line no-unused-vars
		} catch (error) {
			toaster.create({
				title: "Swap Failed",
				description: "An error occurred during the swap",
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsSwapping(false);
		}
	};

	return (
		<Container maxW="4xl" p={0}>
			<VStack gap={10} align="stretch">
				<SimpleHeading
					icon={FaArrowRightArrowLeft}
					headingTitle={"Token Swap"}
					headingDesc={"Swap between different cryptocurrencies instantly"}
				/>

				{!isConnected && (
					<AlertNotification
						status="warning"
						alertMsg="Please connect your wallet to start swapping tokens"
					/>
				)}

				{/* Token Balances */}

				<Box mt={4}>
					<Heading size="lg" fontSize={23} mb={4} color="white">
						Your Balances
					</Heading>
					<Box
						display={"grid"}
						gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }}
						gap={2}
					>
						{tokens.map((token, index) => (
							<HStack
								key={token.symbol}
								justify="space-between"
								w="full"
								bg={"gray.900"}
								height={110}
								padding={"0 20px"}
								rounded={"md"}
								gridColumn={index === 2 ? "1 / -1" : "auto"}
							>
								<Box display={"flex"} alignItems={"center"} gap={3}>
									<Avatar.Root>
										<Avatar.Fallback name={token.name} />
										<Avatar.Image src="https://pngtree.com/freepng/vector-illustration-of-crytocurrency-ethereum_6326627.html" />
									</Avatar.Root>
									<Flex flexDir={"column"} gap={1}>
										<Text fontWeight={600} fontSize={17}>
											{token.name}
										</Text>
										<Text color={"gray.500"} fontSize={14}>
											{token.symbol}
										</Text>
									</Flex>
								</Box>
								<Flex flexDir={"column"} gap={1}>
									<Text fontWeight={600} fontSize={17}>
										{token.balance} {token.symbol}
									</Text>
									<Text color={"gray.500"} fontSize={14}>
										${999}
									</Text>
								</Flex>
							</HStack>
						))}
					</Box>
				</Box>

				{/* Swap Interface */}
				<Card.Root bg="gray.900" borderColor="gray.700">
					<Card.Body>
						<VStack>
							{/* From Token */}
							<Box w="full">
								<Text fontSize="sm" color="gray.400" mb={2}>
									From
								</Text>
								<HStack gap={3}>
									<select
										value={fromToken}
										onChange={(e) => setFromToken(e.target.value)}
										style={{
											width: "100%",
											border: "1px solid",
											borderColor: "#71717A",
											padding: "12.5px 10px ",
											borderRadius: "5px",
											backgroundColor: "#18181B",
											outline: "none",
											fontSize: "15px",
											color: "#fff",
										}}
									>
										{tokens.map((token) => (
											<option
												key={token.symbol}
												value={token.symbol}
												style={{ backgroundColor: "#2D3748" }}
											>
												{token.symbol}
											</option>
										))}
									</select>
									<Input
										type="number"
										step="0.000001"
										placeholder="0.0"
										border="1px solid"
										borderColor="#71717A"
										padding="21.5px 10px "
										value={fromAmount}
										onChange={(e) =>
											handleFromAmountChange(e.target.value)
										}
										bg="transparent"
										fontSize="xl"
										color="white"
										_placeholder={{ color: "gray.500" }}
										_focus={{ outline: "none" }}
									/>
								</HStack>
								<Text fontSize="xs" color="gray.500" mt={1}>
									Balance:{" "}
									{tokens.find((t) => t.symbol === fromToken)
										?.balance || "0.00"}
								</Text>
							</Box>

							{/* Swap Button */}
							<Button
								onClick={handleSwapTokens}
								variant="ghost"
								size="lg"
								rounded={"lg"}
								color="#0088CD"
								_hover={{ bg: "gray.800", scale: 1.01 }}
							>
								<FaArrowsRotate />
							</Button>

							{/* To Token */}
							<Box w="full" rounded="lg">
								<Text fontSize="sm" color="gray.400" mb={2}>
									To
								</Text>
								<HStack gap={3}>
									<select
										value={toToken}
										onChange={(e) => setToToken(e.target.value)}
										style={{
											width: "100%",
											border: "1px solid",
											borderColor: "#71717A",
											padding: "12.5px 10px ",
											borderRadius: "5px",
											backgroundColor: "#18181B",
											outline: "none",
											fontSize: "15px",
											color: "#fff",
										}}
									>
										{tokens.map((token) => (
											<option
												key={token.symbol}
												value={token.symbol}
												style={{ backgroundColor: "#2D3748" }}
											>
												{token.symbol}
											</option>
										))}
									</select>
									<Input
										type="text"
										placeholder="0.0"
										value={toAmount}
										readOnly
										bg="transparent"
										border="1px solid"
										borderColor="#71717A"
										padding="21.5px 10px "
										outline={"none"}
										fontSize="xl"
										color="white"
										_placeholder={{ color: "gray.500" }}
									/>
								</HStack>
								<Text fontSize="xs" color="gray.500" mt={1}>
									Balance:{" "}
									{tokens.find((t) => t.symbol === toToken)?.balance ||
										"0.00"}
								</Text>
							</Box>

							{/* Exchange Rate */}
							{fromAmount && toAmount && (
								<Box
									w="full"
									p={3}
									variant="ghost"
									bg="blue.800"
									rounded="lg"
									// border="1px solid"
									// borderColor="blue.700"
								>
									<Text
										fontSize="sm"
										color="blue.200"
										textAlign="center"
									>
										1 {fromToken} ≈{" "}
										{calculateExchange("1", fromToken, toToken)}{" "}
										{toToken}
									</Text>
								</Box>
							)}

							{/* Swap Action Button */}
							<Button
								bg="#0088CD"
								color="white"
								size="lg"
								w="full"
								rounded={"lg"}
								onClick={handleSwap}
								isLoading={isSwapping}
								loadingText="Swapping..."
								isDisabled={
									!isConnected || !fromAmount || fromToken === toToken
								}
								_hover={{ bg: "#0077B6" }}
							>
								<FaCoins /> Swap Tokens
							</Button>
						</VStack>
					</Card.Body>
				</Card.Root>

				{/* Swap Information */}
				<Card.Root bg="blue.900" borderColor="blue.700">
					<Card.Body>
						<VStack gap={3} align="start">
							<Text fontWeight="bold" color="blue.200">
								Swap Information:
							</Text>
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
					</Card.Body>
				</Card.Root>
			</VStack>
		</Container>
	);
};

export default Swap;
