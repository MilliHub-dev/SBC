import React, { useState } from "react";
import {
	Box,
	Button,
	Input,
	Text,
	VStack,
	Card,
	Field,
	Container,
} from "@chakra-ui/react";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { LuWallet } from "react-icons/lu";
import SimpleHeading from "@/dashboard/components/SimpleHeading/SimpleHeading";
import TokenWrap from "./TokenWrap";

const BuyTokens = () => {
	const [paymentMethod, setPaymentMethod] = useState("polygon");
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const {
		isConnected,
		ethBalance,
		sabiBalance,
		buySabiWithPolygon,
		buySabiWithUSDT,
	} = useWeb3();

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

		setIsLoading(true);
		try {
			if (paymentMethod === "polygon") {
				await buySabiWithPolygon(amount);
				toaster.create({
					title: "Purchase Successful",
					description: `Successfully bought Sabi Cash with ${amount} ETH`,
					type: "success",
					duration: 5000,
				});
			} else if (paymentMethod === "usdt") {
				await buySabiWithUSDT(amount);
				toaster.create({
					title: "Purchase Successful",
					description: `Successfully bought Sabi Cash with ${amount} USDT`,
					type: "success",
					duration: 5000,
				});
			}
			setAmount("");
		} catch (error) {
			toaster.create({
				title: "Purchase Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container maxW="4xl" p={0}>
			<VStack gap={10} align="stretch">
				<SimpleHeading
					icon={LuWallet}
					headingTitle={"Buy Sabi Cash"}
					headingDesc={
						"Purchase Sabi Cash tokens with Polygon (ETH) or USDT"
					}
				/>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={"Please connect your wallet to buy Sabi Cash"}
					/>
				)}

				{isConnected && (
					<>
						<Box
							display={"grid"}
							gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }}
							gap={2}
						>
							<TokenWrap
								name={"Ethereum"}
								abv={"ETH"}
								tokenPrice={"4123.34"}
								balance={ethBalance}
							/>
							<TokenWrap
								name={"Sabi Cash"}
								abv={"SABI"}
								tokenPrice={"4123.34"}
								balance={sabiBalance}
							/>
						</Box>

						<Card.Root border={0}>
							<Card.Body bg={"gray.900"}>
								<VStack spaceY={4}>
									<Field.Root color={"#fff"}>
										<Field.Label fontSize={16} mb={2}>
											Payment Method
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
											<option value="polygon">Polygon (ETH)</option>
											<option value="usdt">USDT</option>
										</select>
									</Field.Root>

									<Field.Root>
										<Field.Label color={"white"} fontSize={16} mb={2}>
											Amount{" "}
											{paymentMethod === "polygon"
												? "(ETH)"
												: "(USDT)"}
										</Field.Label>
										<Input
											type="number"
											step="0.001"
											outline={"none"}
											fontSize={"15px"}
											color={"#fff"}
											bg={"transparent"}
											padding={"20px 10px"}
											borderColor={"gray.500"}
											placeholder={`Enter amount in ${
												paymentMethod === "polygon" ? "ETH" : "USDT"
											}`}
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
										/>
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
										isDisabled={!isConnected || !amount}
										_hover={{ bg: "#0077B6" }}
									>
										<LuWallet /> Buy Sabi Cash
									</Button>
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
										• Buy Sabi Cash directly with Polygon (ETH) or
										USDT
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Tokens will be minted to your connected wallet
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Make sure you have enough balance for
										transaction fees
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Contract deployment required before purchases
										can be made
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
