import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Text,
	Button,
	Flex,
	Badge,
	Icon,
	Grid,
	GridItem,
} from "@chakra-ui/react";
import { FaClock, FaCoins, FaGift, FaPlay, FaPause, FaRocket, FaStar, FaCrown, FaLock, FaUnlock, FaChartLine, FaBolt } from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";

const Staking = () => {
	const {
		isConnected,
		sabiBalance,
		stakeSabiCash,
		claimMiningRewards,
		claimStakingRewards,
		MINING_PLANS,
	} = useWeb3();

	const [isStaking, setIsStaking] = useState(false);
	const [isClaiming, setIsClaiming] = useState(false);
	const [lastClaimTime, setLastClaimTime] = useState(null);
	const [nextClaimTime, setNextClaimTime] = useState(null);

	const [stakingData, setStakingData] = useState({
		currentPlan: null,
		stakedAmount: 0,
		earnedRewards: 0,
		stakingStartTime: null,
		canClaim: false,
	});

	useEffect(() => {
		if (lastClaimTime) {
			const nextClaim = new Date(
				lastClaimTime.getTime() + 24 * 60 * 60 * 1000
			);
			setNextClaimTime(nextClaim);
		}
	}, [lastClaimTime]);

	const handleStake = async (planId) => {
		const plan = Object.values(MINING_PLANS).find((p) => p.id === planId);

		if (!plan) return;

		if (plan.deposit > parseFloat(sabiBalance)) {
			toaster.create({
				title: "Insufficient Balance",
				description: `You need ${plan.deposit} Sabi Cash to stake in ${plan.name}`,
				type: "error",
				duration: 3000,
			});
			return;
		}

		setIsStaking(true);
		try {
			await stakeSabiCash(plan.deposit, plan.id);
			setStakingData({
				currentPlan: plan,
				stakedAmount: plan.deposit,
				earnedRewards: 0,
				stakingStartTime: new Date(),
				canClaim: plan.id === 0,
			});

			toaster.create({
				title: "Staking Successful",
				description: `Successfully staked ${plan.deposit} Sabi Cash in ${plan.name}`,
				type: "success",
				duration: 5000,
			});
		} catch (error) {
			toaster.create({
				title: "Staking Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsStaking(false);
		}
	};

	const handleClaimRewards = async () => {
		setIsClaiming(true);
		try {
			if (stakingData.currentPlan?.id === 0) {
				await claimMiningRewards();
				setLastClaimTime(new Date());
				setStakingData((prev) => ({
					...prev,
					earnedRewards:
						prev.earnedRewards + MINING_PLANS.FREE.dailyReward,
					canClaim: false,
				}));
			} else {
				await claimStakingRewards();
				setStakingData((prev) => ({
					...prev,
					earnedRewards: 0,
				}));
			}

			toaster.create({
				title: "Rewards Claimed",
				description: "Successfully claimed your rewards",
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			toaster.create({
				title: "Claim Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsClaiming(false);
		}
	};

	const canClaimFree = () => {
		if (!lastClaimTime) return true;
		const now = new Date();
		const timeDiff = now.getTime() - lastClaimTime.getTime();
		return timeDiff >= 24 * 60 * 60 * 1000;
	};

	const getTimeUntilNextClaim = () => {
		if (!nextClaimTime) return "Ready to claim!";
		const now = new Date();
		const diff = nextClaimTime.getTime() - now.getTime();

		if (diff <= 0) return "Ready to claim!";

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		return `${hours}h ${minutes}m`;
	};

	const planColors = {
		0: { gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)", light: "green.400", bg: "rgba(16, 185, 129, 0.1)" },
		1: { gradient: "linear-gradient(135deg, #00FFFF 0%, #0088CC 100%)", light: "cyan.400", bg: "rgba(0, 255, 255, 0.1)" },
		2: { gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", light: "purple.400", bg: "rgba(168, 85, 247, 0.1)" },
	};

	const planIcons = {
		0: FaStar,
		1: FaRocket,
		2: FaCrown,
	};

	return (
		<Container maxW="1400px" p={0}>
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
							<Icon as={FaCoins} color="white" boxSize={6} />
						</Box>
						<Box>
							<Text
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
							>
								Staking & Mining
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Stake your SBC tokens or start mining to earn daily rewards
							</Text>
						</Box>
					</Flex>
				</Box>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={
							"Please connect your wallet to access staking features"
						}
					/>
				)}

				{isConnected && (
					<>
						{/* Stats Overview */}
						<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
							<Box className="blockchain-card" p={5}>
								<Flex align="center" justify="space-between">
									<Box>
										<Text fontSize="sm" color="whiteAlpha.600" mb={1}>Available Balance</Text>
										<Text
											fontSize="2xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											className="text-gradient-cyber"
										>
											{sabiBalance} SBC
										</Text>
									</Box>
									<Box
										w="45px"
										h="45px"
										borderRadius="xl"
										bg="rgba(0, 255, 255, 0.1)"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={FaCoins} color="cyan.400" boxSize={5} />
									</Box>
								</Flex>
							</Box>

							<Box className="blockchain-card" p={5}>
								<Flex align="center" justify="space-between">
									<Box>
										<Text fontSize="sm" color="whiteAlpha.600" mb={1}>Current Plan</Text>
										<Text
											fontSize="2xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											color={stakingData.currentPlan ? "purple.400" : "whiteAlpha.500"}
										>
											{stakingData.currentPlan ? stakingData.currentPlan.name : "None Active"}
										</Text>
									</Box>
									<Box
										w="45px"
										h="45px"
										borderRadius="xl"
										bg="rgba(168, 85, 247, 0.1)"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={FaChartLine} color="purple.400" boxSize={5} />
									</Box>
								</Flex>
							</Box>

							<Box className="blockchain-card" p={5}>
								<Flex align="center" justify="space-between">
									<Box>
										<Text fontSize="sm" color="whiteAlpha.600" mb={1}>Total Earned</Text>
										<Text
											fontSize="2xl"
											fontWeight="bold"
											fontFamily="'Space Grotesk', sans-serif"
											color="green.400"
										>
											{stakingData.earnedRewards} SBC
										</Text>
									</Box>
									<Box
										w="45px"
										h="45px"
										borderRadius="xl"
										bg="rgba(16, 185, 129, 0.1)"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={FaGift} color="green.400" boxSize={5} />
									</Box>
								</Flex>
							</Box>
						</Grid>

						{/* Active Staking Dashboard */}
						{stakingData.currentPlan && (
							<Box className="blockchain-card" p={6} position="relative" overflow="hidden">
								{/* Glow effect */}
								<Box
									position="absolute"
									top="-50%"
									right="-10%"
									w="300px"
									h="300px"
									bg={`radial-gradient(circle, ${planColors[stakingData.currentPlan.id]?.bg || planColors[0].bg} 0%, transparent 70%)`}
									filter="blur(60px)"
									pointerEvents="none"
								/>

								<Flex direction="column" gap={6} position="relative" zIndex={1}>
									<Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
										<Flex align="center" gap={3}>
											<Box
												w="50px"
												h="50px"
												borderRadius="xl"
												bg={planColors[stakingData.currentPlan.id]?.gradient || planColors[0].gradient}
												display="flex"
												alignItems="center"
												justifyContent="center"
												boxShadow={`0 0 20px ${planColors[stakingData.currentPlan.id]?.bg || planColors[0].bg}`}
											>
												<Icon as={planIcons[stakingData.currentPlan.id] || FaStar} color="white" boxSize={6} />
											</Box>
											<Box>
												<Text
													fontSize="xl"
													fontWeight="bold"
													fontFamily="'Space Grotesk', sans-serif"
												>
													Active Staking
												</Text>
												<Badge
													bg={planColors[stakingData.currentPlan.id]?.bg || planColors[0].bg}
													color={planColors[stakingData.currentPlan.id]?.light || planColors[0].light}
													px={3}
													py={1}
													borderRadius="full"
													fontSize="xs"
												>
													{stakingData.currentPlan.name}
												</Badge>
											</Box>
										</Flex>

										{stakingData.currentPlan.id === 0 ? (
											<Button
												bg={canClaimFree() ? planColors[0].gradient : "whiteAlpha.200"}
												color={canClaimFree() ? "white" : "whiteAlpha.500"}
												px={6}
												py={5}
												borderRadius="xl"
												fontWeight="600"
												onClick={handleClaimRewards}
												isLoading={isClaiming}
												loadingText="Claiming..."
												isDisabled={!canClaimFree()}
												leftIcon={<FaGift />}
												_hover={canClaimFree() ? {
													transform: "translateY(-2px)",
													boxShadow: `0 0 30px ${planColors[0].bg}`,
												} : {}}
												transition="all 0.3s ease"
											>
												Claim Rewards
											</Button>
										) : (
											<Button
												bg={stakingData.earnedRewards > 0 ? planColors[stakingData.currentPlan.id]?.gradient : "whiteAlpha.200"}
												color={stakingData.earnedRewards > 0 ? "white" : "whiteAlpha.500"}
												px={6}
												py={5}
												borderRadius="xl"
												fontWeight="600"
												onClick={handleClaimRewards}
												isLoading={isClaiming}
												isDisabled={stakingData.earnedRewards === 0}
												leftIcon={<FaGift />}
												_hover={stakingData.earnedRewards > 0 ? {
													transform: "translateY(-2px)",
													boxShadow: `0 0 30px ${planColors[stakingData.currentPlan.id]?.bg}`,
												} : {}}
												transition="all 0.3s ease"
											>
												Claim Rewards
											</Button>
										)}
									</Flex>

									{/* Staking Stats */}
									<Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
										<Box className="glass" p={4} borderRadius="xl" textAlign="center">
											<Text fontSize="xs" color="whiteAlpha.600" mb={1}>Staked Amount</Text>
											<Text
												fontSize="xl"
												fontWeight="bold"
												fontFamily="'Space Grotesk', sans-serif"
												color={planColors[stakingData.currentPlan.id]?.light || "cyan.400"}
											>
												{stakingData.stakedAmount} SBC
											</Text>
										</Box>

										<Box className="glass" p={4} borderRadius="xl" textAlign="center">
											<Text fontSize="xs" color="whiteAlpha.600" mb={1}>Daily Reward</Text>
											<Text
												fontSize="xl"
												fontWeight="bold"
												fontFamily="'Space Grotesk', sans-serif"
												color="green.400"
											>
												+{stakingData.currentPlan.dailyReward} SBC
											</Text>
										</Box>

										<Box className="glass" p={4} borderRadius="xl" textAlign="center">
											<Text fontSize="xs" color="whiteAlpha.600" mb={1}>Duration</Text>
											<Text
												fontSize="xl"
												fontWeight="bold"
												fontFamily="'Space Grotesk', sans-serif"
											>
												{stakingData.currentPlan.duration} Days
											</Text>
										</Box>

										<Box className="glass" p={4} borderRadius="xl" textAlign="center">
											<Text fontSize="xs" color="whiteAlpha.600" mb={1}>
												{stakingData.currentPlan.id === 0 ? "Next Claim" : "Claim Mode"}
											</Text>
											<Text
												fontSize="xl"
												fontWeight="bold"
												fontFamily="'Space Grotesk', sans-serif"
												color={stakingData.currentPlan.autoTrigger ? "green.400" : "yellow.400"}
											>
												{stakingData.currentPlan.id === 0
													? getTimeUntilNextClaim()
													: stakingData.currentPlan.autoTrigger ? "Auto" : "Manual"}
											</Text>
										</Box>
									</Grid>
								</Flex>
							</Box>
						)}

						{/* Staking Plans */}
						<Box>
							<Flex align="center" gap={2} mb={6}>
								<Icon as={HiOutlineSparkles} color="cyan.400" boxSize={5} />
								<Text
									fontSize="xl"
									fontWeight="bold"
									fontFamily="'Space Grotesk', sans-serif"
								>
									Available Plans
								</Text>
							</Flex>

							<Grid
								templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
								gap={6}
							>
								{Object.values(MINING_PLANS).map((plan, index) => {
									const colors = planColors[plan.id] || planColors[0];
									const PlanIcon = planIcons[plan.id] || FaStar;
									const isActive = stakingData.currentPlan?.id === plan.id;
									const canAfford = plan.deposit === 0 || plan.deposit <= parseFloat(sabiBalance);

									return (
										<Box
											key={plan.id}
											className="blockchain-card"
											p={6}
											position="relative"
											overflow="hidden"
											role="group"
											border={isActive ? "2px solid" : "1px solid"}
											borderColor={isActive ? colors.light : "rgba(255, 255, 255, 0.1)"}
											transform={index === 1 ? "scale(1.02)" : "scale(1)"}
											_hover={{
												borderColor: colors.light,
												transform: index === 1 ? "scale(1.04) translateY(-4px)" : "translateY(-4px)",
											}}
											transition="all 0.3s ease"
										>
											{/* Popular badge */}
											{index === 1 && (
												<Badge
													position="absolute"
													top={4}
													right={4}
													bg={colors.gradient}
													color="white"
													px={3}
													py={1}
													borderRadius="full"
													fontSize="xs"
													fontWeight="bold"
												>
													POPULAR
												</Badge>
											)}

											{/* Glow effect */}
											<Box
												position="absolute"
												top="-50%"
												right="-20%"
												w="200px"
												h="200px"
												bg={`radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`}
												filter="blur(40px)"
												opacity={0}
												transition="opacity 0.3s ease"
												_groupHover={{ opacity: 1 }}
												pointerEvents="none"
											/>

											<Flex direction="column" gap={5} position="relative" zIndex={1}>
												{/* Plan Header */}
												<Flex align="center" gap={3}>
													<Box
														w="48px"
														h="48px"
														borderRadius="xl"
														bg={colors.bg}
														display="flex"
														alignItems="center"
														justifyContent="center"
													>
														<Icon as={PlanIcon} color={colors.light} boxSize={6} />
													</Box>
													<Box>
														<Text
															fontSize="lg"
															fontWeight="bold"
															fontFamily="'Space Grotesk', sans-serif"
														>
															{plan.name}
														</Text>
														<Text fontSize="xs" color="whiteAlpha.600">
															{plan.autoTrigger ? "Auto-claim rewards" : "Manual claim required"}
														</Text>
													</Box>
												</Flex>

												{/* Price */}
												<Box className="glass" p={4} borderRadius="xl" textAlign="center">
													<Text
														fontSize="3xl"
														fontWeight="bold"
														fontFamily="'Space Grotesk', sans-serif"
														color={colors.light}
													>
														{plan.deposit === 0 ? "FREE" : `${plan.deposit} SBC`}
													</Text>
													<Text fontSize="xs" color="whiteAlpha.600">
														{plan.deposit === 0 ? "No deposit required" : "Deposit amount"}
													</Text>
												</Box>

												{/* Plan Details */}
												<Flex direction="column" gap={3}>
													<Flex align="center" justify="space-between" className="glass" p={3} borderRadius="lg">
														<Flex align="center" gap={2}>
															<Icon as={FaCoins} color="green.400" boxSize={4} />
															<Text fontSize="sm" color="whiteAlpha.700">Daily Reward</Text>
														</Flex>
														<Text fontWeight="bold" color="green.400">
															+{plan.dailyReward} SBC
														</Text>
													</Flex>

													<Flex align="center" justify="space-between" className="glass" p={3} borderRadius="lg">
														<Flex align="center" gap={2}>
															<Icon as={FaClock} color="cyan.400" boxSize={4} />
															<Text fontSize="sm" color="whiteAlpha.700">Duration</Text>
														</Flex>
														<Text fontWeight="bold">
															{plan.duration} Day{plan.duration > 1 ? "s" : ""}
														</Text>
													</Flex>

													<Flex align="center" justify="space-between" className="glass" p={3} borderRadius="lg">
														<Flex align="center" gap={2}>
															<Icon as={plan.autoTrigger ? FaUnlock : FaLock} color={plan.autoTrigger ? "green.400" : "yellow.400"} boxSize={4} />
															<Text fontSize="sm" color="whiteAlpha.700">Claim Mode</Text>
														</Flex>
														<Text fontWeight="bold" color={plan.autoTrigger ? "green.400" : "yellow.400"}>
															{plan.autoTrigger ? "Auto" : "Manual"}
														</Text>
													</Flex>
												</Flex>

												{/* Total Potential */}
												<Box className="glass" p={4} borderRadius="xl" textAlign="center">
													<Text fontSize="xs" color="whiteAlpha.600" mb={1}>Total Potential Earnings</Text>
													<Text
														fontSize="2xl"
														fontWeight="bold"
														fontFamily="'Space Grotesk', sans-serif"
														className="text-gradient-cyber"
													>
														{plan.dailyReward * plan.duration} SBC
													</Text>
												</Box>

												{/* Action Button */}
												<Button
													onClick={() => handleStake(plan.id)}
													isLoading={isStaking}
													isDisabled={isActive || !canAfford}
													bg={isActive ? "whiteAlpha.200" : canAfford ? colors.gradient : "whiteAlpha.200"}
													color={isActive || !canAfford ? "whiteAlpha.500" : "white"}
													py={6}
													h="auto"
													fontWeight="bold"
													borderRadius="xl"
													transition="all 0.3s ease"
													_hover={!isActive && canAfford ? {
														transform: "translateY(-2px)",
														boxShadow: `0 0 30px ${colors.bg}`,
													} : {}}
													_disabled={{
														cursor: "not-allowed",
														opacity: 0.6,
													}}
													leftIcon={isActive ? <FaBolt /> : <FaRocket />}
												>
													{isActive
														? "Currently Active"
														: !canAfford
														? "Insufficient Balance"
														: "Start Staking"}
												</Button>
											</Flex>
										</Box>
									);
								})}
							</Grid>
						</Box>

						{/* Information Card */}
						<Box className="blockchain-card" p={6} position="relative" overflow="hidden">
							<Box
								position="absolute"
								top="-30%"
								left="-10%"
								w="300px"
								h="300px"
								bg="radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)"
								filter="blur(60px)"
								pointerEvents="none"
							/>

							<Flex direction="column" gap={4} position="relative" zIndex={1}>
								<Flex align="center" gap={2}>
									<Icon as={HiOutlineSparkles} color="cyan.400" boxSize={5} />
									<Text
										fontWeight="bold"
										fontSize="lg"
										fontFamily="'Space Grotesk', sans-serif"
									>
										How Staking Works
									</Text>
								</Flex>

								<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
									{[
										{ icon: FaStar, text: "Free Plan: Earn 0.9 SBC every 24 hours with manual claim", color: "green.400" },
										{ icon: FaRocket, text: "Basic Plan: Deposit 100 SBC, earn 15 SBC daily for 30 days", color: "cyan.400" },
										{ icon: FaCrown, text: "Premium Plan: Deposit 1000 SBC, earn 170 SBC daily with auto-claim", color: "purple.400" },
										{ icon: FaLock, text: "You can only participate in one plan at a time", color: "yellow.400" },
									].map((item, index) => (
										<Flex key={index} align="center" gap={3} className="glass" p={4} borderRadius="xl">
											<Box
												w="36px"
												h="36px"
												borderRadius="lg"
												bg={`rgba(${item.color === "green.400" ? "16, 185, 129" : item.color === "cyan.400" ? "0, 255, 255" : item.color === "purple.400" ? "168, 85, 247" : "234, 179, 8"}, 0.1)`}
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
											Smart contracts are audited and secured on Solana blockchain
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

export default Staking;
