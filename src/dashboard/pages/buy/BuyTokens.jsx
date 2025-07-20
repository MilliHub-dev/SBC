import {
	Box,
	Button,
	Icon,
	Input,
	Text,
	Collapsible,
	IconButton,
	Image,
	Container,
	Heading,
	VStack,
	HStack,
	Card,
	CardBody,
	Select,
	Alert,
	Field,
	Badge
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaArrowDown, FaChevronDown, FaChevronUp, FaEthereum } from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";

const BuyTokens = () => {
	const [isCollapsibleOpen, setIsCollapasibleOpen] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState('polygon');
	const [amount, setAmount] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	
	const { 
		isConnected, 
		ethBalance, 
		sabiBalance, 
		buySabiWithPolygon, 
		buySabiWithUSDT 
	} = useWeb3();

	const handleBuy = async () => {
		if (!isConnected) {
			toaster.create({
				title: 'Wallet Not Connected',
				description: 'Please connect your wallet first',
				status: 'error',
				duration: 3000,
			});
			return;
		}

		if (!amount || parseFloat(amount) <= 0) {
			toaster.create({
				title: 'Invalid Amount',
				description: 'Please enter a valid amount',
				status: 'error',
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);
		try {
			if (paymentMethod === 'polygon') {
				await buySabiWithPolygon(amount);
				toaster.create({
					title: 'Purchase Successful',
					description: `Successfully bought Sabi Cash with ${amount} ETH`,
					status: 'success',
					duration: 5000,
				});
			} else if (paymentMethod === 'usdt') {
				await buySabiWithUSDT(amount);
				toaster.create({
					title: 'Purchase Successful',
					description: `Successfully bought Sabi Cash with ${amount} USDT`,
					status: 'success',
					duration: 5000,
				});
			}
			setAmount('');
		} catch (error) {
			toaster.create({
				title: 'Purchase Failed',
				description: error.message,
				status: 'error',
				duration: 5000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container maxW="2xl" py={8}>
			<VStack spacing={6} align="stretch">
				<Box textAlign="center">
					<Heading size="lg" mb={2}>Buy Sabi Cash</Heading>
					<Text color="gray.600">
						Purchase Sabi Cash tokens with Polygon (ETH) or USDT
					</Text>
				</Box>

				{!isConnected && (
					<Alert status="warning">
						Please connect your wallet to buy Sabi Cash
					</Alert>
				)}

				{isConnected && (
					<>
						<Card>
							<CardBody>
								<VStack spacing={4}>
									<HStack justify="space-between" w="full">
										<Text fontWeight="bold">ETH Balance:</Text>
										<Badge colorScheme="blue" fontSize="md" p={2}>
											{ethBalance} ETH
										</Badge>
									</HStack>
									<HStack justify="space-between" w="full">
										<Text fontWeight="bold">Sabi Cash Balance:</Text>
										<Badge colorScheme="green" fontSize="md" p={2}>
											{sabiBalance} SABI
										</Badge>
									</HStack>
								</VStack>
							</CardBody>
						</Card>

						<Card>
							<CardBody>
								<VStack spacing={4}>
									<Field>
										<Field.Label>Payment Method</Field.Label>
										<Select 
											value={paymentMethod} 
											onChange={(e) => setPaymentMethod(e.target.value)}
										>
											<option value="polygon">Polygon (ETH)</option>
											<option value="usdt">USDT</option>
										</Select>
									</Field>

									<Field>
										<Field.Label>
											Amount {paymentMethod === 'polygon' ? '(ETH)' : '(USDT)'}
										</Field.Label>
										<Input
											type="number"
											step="0.001"
											placeholder={`Enter amount in ${paymentMethod === 'polygon' ? 'ETH' : 'USDT'}`}
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
										/>
									</Field>

									<Button
										bg="#0088CD"
										color="white"
										size="lg"
										w="full"
										onClick={handleBuy}
										isLoading={isLoading}
										loadingText="Processing..."
										isDisabled={!isConnected || !amount}
										_hover={{ bg: "#0077B6" }}
									>
										Buy Sabi Cash
									</Button>
								</VStack>
							</CardBody>
						</Card>

						<Card bg="blue.50" borderColor="blue.200">
							<CardBody>
								<VStack spacing={3} align="start">
									<Text fontWeight="bold" color="blue.800">Purchase Information:</Text>
									<Text fontSize="sm" color="blue.700">
										• Buy Sabi Cash directly with Polygon (ETH) or USDT
									</Text>
									<Text fontSize="sm" color="blue.700">
										• Tokens will be minted to your connected wallet
									</Text>
									<Text fontSize="sm" color="blue.700">
										• Make sure you have enough balance for transaction fees
									</Text>
									<Text fontSize="sm" color="blue.700">
										• Contract deployment required before purchases can be made
									</Text>
								</VStack>
							</CardBody>
						</Card>
					</>
				)}
			</VStack>
		</Container>
	);
};

export default BuyTokens;
