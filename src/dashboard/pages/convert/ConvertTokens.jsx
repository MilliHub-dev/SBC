import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Text,
	Button,
	Input,
	Field,
	Card,
	VStack,
	HStack,
	Spinner,
} from "@chakra-ui/react";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import SimpleHeading from "../../components/SimpleHeading/SimpleHeading";
import { FaRotate } from "react-icons/fa6";
import TokenWrap from "../buy/TokenWrap";
import { pointsService } from "../../../services/pointsService";
import { authService } from "../../../services/authService";

const ConvertTokens = () => {
	const {
		isConnected,
		isLoggedIn,
		address,
		sabiBalance,
	} = useWeb3();

	const [pointsToConvert, setPointsToConvert] = useState("");
	const [isConverting, setIsConverting] = useState(false);
	const [userPoints, setUserPoints] = useState(0);
	const [pointsData, setPointsData] = useState(null);
	const [loadingPoints, setLoadingPoints] = useState(false);
	const [conversionRate] = useState(0.5); // 1 point = 0.5 Sabi Cash
	const [minConversion] = useState(500); // Minimum 500 points

	// Load user points when logged in
	useEffect(() => {
		const loadUserPoints = async () => {
			if (!isLoggedIn) return;

			setLoadingPoints(true);
			try {
				const tokens = authService.getTokens();
				if (!tokens.sabiCashToken) {
					throw new Error('No authentication token found. Please login again.');
				}

				const result = await pointsService.getPointsBalance(tokens.sabiCashToken);
				if (result.success) {
					setUserPoints(result.totalPoints);
					setPointsData(result);
				} else {
					throw new Error(result.error);
				}
			} catch (error) {
				console.error('Error loading user points:', error);
				toaster.create({
					title: "Failed to Load Points",
					description: error.message,
					type: "error",
					duration: 5000,
				});
			} finally {
				setLoadingPoints(false);
			}
		};

		loadUserPoints();
	}, [isLoggedIn]);

	const handleConvertPoints = async () => {
		if (!isConnected) {
			toaster.create({
				title: "Wallet Not Connected",
				description: "Please connect your wallet to convert points",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (!isLoggedIn) {
			toaster.create({
				title: "Not Logged In",
				description: "Please login to your Sabi Ride account first",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (!pointsToConvert || parseInt(pointsToConvert) < minConversion) {
			toaster.create({
				title: "Invalid Amount",
				description: `Minimum ${minConversion} points required for conversion`,
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (parseInt(pointsToConvert) > userPoints) {
			toaster.create({
				title: "Insufficient Points",
				description: "You don't have enough points for this conversion",
				type: "error",
				duration: 3000,
			});
			return;
		}

		setIsConverting(true);
		try {
			const tokens = authService.getTokens();
			if (!tokens.sabiCashToken) {
				throw new Error('Authentication token not found. Please login again.');
			}

			// First validate the conversion
			const validation = await pointsService.validateConversion(
				tokens.sabiCashToken,
				parseInt(pointsToConvert),
				address
			);

			if (!validation.success || !validation.valid) {
				throw new Error(validation.error || 'Conversion validation failed');
			}

			// Proceed with conversion
			const result = await pointsService.convertPoints(
				tokens.sabiCashToken,
				parseInt(pointsToConvert),
				address
			);

			if (!result.success) {
				throw new Error(result.error);
			}

			toaster.create({
				title: "Conversion Successful",
				description: `Successfully converted ${result.pointsConverted} points to ${result.sabiCashAmount} Sabi Cash`,
				type: "success",
				duration: 5000,
			});

			// Update user points
			setUserPoints(result.newPointBalance);
			setPointsToConvert("");

			// Refresh points data
			const updatedPointsData = await pointsService.getPointsBalance(tokens.sabiCashToken);
			if (updatedPointsData.success) {
				setPointsData(updatedPointsData);
			}
		} catch (error) {
			console.error('Conversion error:', error);
			toaster.create({
				title: "Conversion Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsConverting(false);
		}
	};

	const handleConvertAll = () => {
		if (userPoints >= minConversion) {
			setPointsToConvert(userPoints.toString());
		}
	};

	const getConvertibleSabi = () => {
		if (!pointsToConvert || parseInt(pointsToConvert) < minConversion) {
			return '0.00';
		}
		return (parseInt(pointsToConvert) * conversionRate).toFixed(2);
	};

	const canConvertPoints = () => {
		return userPoints >= minConversion;
	};

	return (
		<>
			<Container maxW="4xl" p={0}>
				<VStack gap={10} align="stretch">
					<SimpleHeading
						icon={FaRotate}
						headingTitle={"Points to Tokens"}
						headingDesc={
							"Convert your Sabi Ride points to Sabi Cash tokens"
						}
					/>

					{!isConnected && (
						<AlertNotification
							status={"warning"}
							alertMsg={"Please connect your wallet to convert points"}
						/>
					)}

					{!isLoggedIn && isConnected && (
						<AlertNotification
							status={"info"}
							alertMsg={"Please login to your Sabi Ride account to view and convert your points"}
						/>
					)}

					{loadingPoints && isLoggedIn && (
						<Box textAlign="center" py={8}>
							<Spinner size="lg" />
							<Text mt={4} color="gray.400">Loading your points...</Text>
						</Box>
					)}

					{isLoggedIn && !loadingPoints && (
						<>
							<Box
								display={"grid"}
								gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }}
								gap={2}
							>
								<TokenWrap
									balance={userPoints.toLocaleString()}
									name="Available Points"
									abv="Points"
									tokenPrice={`${conversionRate} SBC per point`}
								/>
								<TokenWrap
									balance={sabiBalance || '0.00'}
									name="Sabi Cash Balance"
									abv="SBC"
									tokenPrice="Current wallet balance"
								/>
							</Box>

							{/* Points Information */}
							{pointsData && (
								<Card.Root bg="blue.900" borderColor="blue.700">
									<Card.Body>
										<VStack gap={3} align="start">
											<Text fontWeight="bold" color="blue.200">
												Points Summary:
											</Text>
											<Text fontSize="sm" color="blue.300">
												• Total Points: {userPoints.toLocaleString()}
											</Text>
											<Text fontSize="sm" color="blue.300">
												• Conversion Rate: 1 point = {conversionRate} Sabi Cash
											</Text>
											<Text fontSize="sm" color="blue.300">
												• Minimum Conversion: {minConversion} points
											</Text>
											{pointsData.lastEarned && (
												<Text fontSize="sm" color="blue.300">
													• Last Earned: {new Date(pointsData.lastEarned).toLocaleDateString()}
												</Text>
											)}
										</VStack>
									</Card.Body>
								</Card.Root>
							)}

							<Card.Root border={0} bg={"gray.900"}>
								<Card.Body bg={"gray.900"} rounded={"lg"} py={8}>
									<VStack gap={4}>
										<Field.Root>
											<Field.Label
												color={"#fff"}
												fontWeight={500}
												fontSize={18}
												mb={3}
											>
												Points to Convert
											</Field.Label>
											<Input
												type="number"
												color={"#fff"}
												border={"1px solid"}
												borderColor={"gray.700"}
												focusRingWidth={2}
												outlineColor={"gray.600"}
												rounded={"sm"}
												placeholder={`Minimum ${minConversion} points`}
												value={pointsToConvert}
												onChange={(e) =>
													setPointsToConvert(e.target.value)
												}
												min={minConversion}
												max={userPoints}
											/>
											<Field.HelperText color="gray.400">
												{pointsToConvert && parseInt(pointsToConvert) >= minConversion &&
													`= ${getConvertibleSabi()} Sabi Cash`}
												{pointsToConvert && parseInt(pointsToConvert) < minConversion &&
													`Minimum ${minConversion} points required`}
											</Field.HelperText>
										</Field.Root>

										<HStack gap={4} w="full">
											<Button
												variant="outline"
												borderColor={"gray.600"}
												padding={5}
												rounded={"sm"}
												onClick={handleConvertAll}
												transition={"background .2s ease"}
												isDisabled={!canConvertPoints()}
												flex={1}
												_hover={{ bg: "gray.700" }}
												color={"#fff"}
											>
												Convert All Points
											</Button>
											<Button
												bg="#0088CD"
												color="white"
												rounded={"sm"}
												padding={5}
												transition={"background .2s ease"}
												onClick={handleConvertPoints}
												isLoading={isConverting}
												loadingText="Converting..."
												isDisabled={
													!canConvertPoints() || 
													!pointsToConvert || 
													parseInt(pointsToConvert) < minConversion ||
													!isConnected ||
													!isLoggedIn
												}
												flex={1}
												_hover={{ bg: "#0077B6" }}
											>
												Convert Points
											</Button>
										</HStack>
									</VStack>
								</Card.Body>
							</Card.Root>

							<Card.Root bg="blue.900" borderColor="blue.700">
								<Card.Body>
									<VStack gap={3} alignItems="start">
										<Text fontWeight="bold" color="blue.200">
											Conversion Information:
										</Text>
										<Text fontSize="sm" color="blue.300">
											• 1 point = {conversionRate} Sabi Cash tokens
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Minimum conversion: {minConversion} points
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Tokens are transferred directly to your wallet
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Points will be deducted from your Sabi Ride account
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Conversion is instant and irreversible
										</Text>
									</VStack>
								</Card.Body>
							</Card.Root>
						</>
					)}
				</VStack>
			</Container>
		</>
	);
};

export default ConvertTokens;
