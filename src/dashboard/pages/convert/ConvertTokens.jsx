import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Text,
	Button,
	Input,
	Flex,
	Spinner,
	Icon,
	Grid,
	Badge,
} from "@chakra-ui/react";
import { FaRotate, FaCoins, FaArrowRight, FaWallet, FaStar, FaBolt, FaCircleCheck, FaArrowRightArrowLeft } from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
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
	const [conversionRate] = useState(0.5);
	const [minConversion] = useState(500);

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

			const validation = await pointsService.validateConversion(
				tokens.sabiCashToken,
				parseInt(pointsToConvert),
				address
			);

			if (!validation.success || !validation.valid) {
				throw new Error(validation.error || 'Conversion validation failed');
			}

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

			setUserPoints(result.newPointBalance);
			setPointsToConvert("");

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
		<Container maxW="800px" p={0}>
			<Flex direction="column" gap={8}>
				{/* Page Header */}
				<Box>
					<Flex align="center" gap={3} mb={3}>
						<Box
							w="50px"
							h="50px"
							borderRadius="xl"
							bg="linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)"
							display="flex"
							alignItems="center"
							justifyContent="center"
							boxShadow="0 0 20px rgba(168, 85, 247, 0.3)"
						>
							<Icon as={FaRotate} color="white" boxSize={6} />
						</Box>
						<Box>
							<Text
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
							>
								Points to Tokens
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Convert your Sabi Ride points to SBC tokens
							</Text>
						</Box>
					</Flex>
				</Box>

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
					<Flex justify="center" align="center" py={16}>
						<Box textAlign="center">
							<Spinner size="xl" color="purple.400" thickness="4px" speed="0.8s" />
							<Text mt={4} color="whiteAlpha.600" fontSize="sm">
								Loading your points...
							</Text>
						</Box>
					</Flex>
				)}

				{isLoggedIn && !loadingPoints && (
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
									bg="radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)"
									filter="blur(40px)"
									pointerEvents="none"
								/>
								<Flex align="center" justify="space-between" position="relative" zIndex={1}>
									<Box>
										<Text fontSize="sm" color="whiteAlpha.600" mb={1}>Available Points</Text>
										<Text
											fontSize="3xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											color="purple.400"
										>
											{userPoints.toLocaleString()}
										</Text>
										<Text fontSize="xs" color="whiteAlpha.500" mt={1}>
											{conversionRate} SBC per point
										</Text>
									</Box>
									<Box
										w="50px"
										h="50px"
										borderRadius="xl"
										bg="rgba(168, 85, 247, 0.1)"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={FaStar} color="purple.400" boxSize={6} />
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
											{sabiBalance || '0.00'}
										</Text>
										<Text fontSize="xs" color="whiteAlpha.500" mt={1}>
											Current wallet balance
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

						{/* Conversion Card */}
						<Box className="blockchain-card" p={6} position="relative" overflow="hidden">
							<Box
								position="absolute"
								top="-50%"
								left="-20%"
								w="300px"
								h="300px"
								bg="radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)"
								filter="blur(60px)"
								pointerEvents="none"
							/>

							<Flex direction="column" gap={6} position="relative" zIndex={1}>
								<Flex align="center" gap={2}>
									<Icon as={FaArrowRightArrowLeft} color="purple.400" boxSize={5} />
									<Text fontWeight="bold" fontSize="lg" fontFamily="'Space Grotesk', sans-serif">
										Convert Points
									</Text>
								</Flex>

								{/* Input Section */}
								<Box className="glass" p={5} borderRadius="xl">
									<Flex justify="space-between" mb={3}>
										<Text fontSize="sm" color="whiteAlpha.600">Points to Convert</Text>
										<Flex align="center" gap={2}>
											<Icon as={FaStar} color="purple.400" boxSize={3} />
											<Text fontSize="sm" color="whiteAlpha.600">
												{userPoints.toLocaleString()} available
											</Text>
										</Flex>
									</Flex>
									<Flex align="center" gap={4}>
										<Input
											type="number"
											placeholder={`Min ${minConversion} points`}
											value={pointsToConvert}
											onChange={(e) => setPointsToConvert(e.target.value)}
											fontSize="2xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											bg="transparent"
											border="none"
											p={0}
											color="white"
											_focus={{ outline: "none", boxShadow: "none" }}
											_placeholder={{ color: "whiteAlpha.300" }}
											flex={1}
											min={minConversion}
											max={userPoints}
										/>
										<Button
											size="sm"
											variant="ghost"
											color="purple.400"
											onClick={handleConvertAll}
											isDisabled={!canConvertPoints()}
											_hover={{ bg: "rgba(168, 85, 247, 0.1)" }}
										>
											MAX
										</Button>
									</Flex>
								</Box>

								{/* Arrow */}
								<Flex justify="center">
									<Box
										w="40px"
										h="40px"
										borderRadius="full"
										bg="linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)"
										display="flex"
										alignItems="center"
										justifyContent="center"
										boxShadow="0 0 20px rgba(168, 85, 247, 0.3)"
									>
										<Icon as={FaArrowRight} color="white" boxSize={4} transform="rotate(90deg)" />
									</Box>
								</Flex>

								{/* Output Section */}
								<Box className="glass" p={5} borderRadius="xl">
									<Flex justify="space-between" mb={3}>
										<Text fontSize="sm" color="whiteAlpha.600">You Will Receive</Text>
										<Flex align="center" gap={2}>
											<Icon as={FaCoins} color="cyan.400" boxSize={3} />
											<Text fontSize="sm" color="whiteAlpha.600">SBC</Text>
										</Flex>
									</Flex>
									<Text
										fontSize="2xl"
										fontWeight="bold"
										fontFamily="'Space Grotesk', sans-serif"
										color={getConvertibleSabi() !== '0.00' ? "cyan.400" : "whiteAlpha.300"}
									>
										{getConvertibleSabi()} SBC
									</Text>
								</Box>

								{/* Conversion Rate Info */}
								<Box className="glass" p={4} borderRadius="xl">
									<Flex justify="space-between" align="center">
										<Text fontSize="sm" color="whiteAlpha.600">Conversion Rate</Text>
										<Badge
											bg="rgba(168, 85, 247, 0.1)"
											color="purple.400"
											px={3}
											py={1}
											borderRadius="full"
											fontSize="sm"
										>
											1 Point = {conversionRate} SBC
										</Badge>
									</Flex>
								</Box>

								{/* Action Buttons */}
								<Grid templateColumns="1fr 1fr" gap={4}>
									<Button
										className="glass"
										py={6}
										h="auto"
										fontWeight="600"
										borderRadius="xl"
										onClick={handleConvertAll}
										isDisabled={!canConvertPoints()}
										_hover={{ bg: "rgba(168, 85, 247, 0.1)", borderColor: "purple.400" }}
									>
										Convert All Points
									</Button>
									<Button
										bg="linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)"
										color="white"
										py={6}
										h="auto"
										fontWeight="bold"
										borderRadius="xl"
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
										_hover={{
											transform: "translateY(-2px)",
											boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
										}}
										_disabled={{
											cursor: "not-allowed",
											opacity: 0.6,
										}}
										transition="all 0.3s ease"
									>
										Convert Points
									</Button>
								</Grid>
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
										How It Works
									</Text>
								</Flex>

								<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
									{[
										{ icon: FaStar, text: `Minimum ${minConversion} points required for conversion`, color: "purple.400" },
										{ icon: FaBolt, text: "Instant conversion to your connected wallet", color: "cyan.400" },
										{ icon: FaWallet, text: "Tokens are transferred directly to your wallet", color: "green.400" },
										{ icon: FaCircleCheck, text: "Conversion is instant and irreversible", color: "yellow.400" },
									].map((item, index) => (
										<Flex key={index} align="center" gap={3} className="glass" p={4} borderRadius="xl">
											<Box
												w="36px"
												h="36px"
												borderRadius="lg"
												bg={`rgba(${item.color === "purple.400" ? "168, 85, 247" : item.color === "cyan.400" ? "0, 255, 255" : item.color === "green.400" ? "16, 185, 129" : "234, 179, 8"}, 0.1)`}
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

								{pointsData?.lastEarned && (
									<Box className="glass" p={4} borderRadius="xl" mt={2}>
										<Flex align="center" gap={2}>
											<Box className="network-online" />
											<Text fontSize="sm" color="whiteAlpha.600">
												Last points earned: {new Date(pointsData.lastEarned).toLocaleDateString()}
											</Text>
										</Flex>
									</Box>
								)}
							</Flex>
						</Box>
					</>
				)}
			</Flex>
		</Container>
	);
};

export default ConvertTokens;
