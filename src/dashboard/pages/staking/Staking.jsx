import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Heading,
	Text,
	Button,
	Card,
	VStack,
	HStack,
	Badge,
	Separator,
} from "@chakra-ui/react";
import { FaClock, FaCoins, FaGift, FaPlay, FaPause } from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import SimpleHeading from "@/dashboard/components/SimpleHeading/SimpleHeading";
import { Clock, PiggyBank } from "lucide-react";
import { FaPiggyBank } from "react-icons/fa";

const Staking = () => {
	const {
		isConnected,
		sabiBalance,
		stakeSabiCash,
		claimMiningRewards,
		claimStakingRewards,
		MINING_PLANS,
	} = useWeb3();

	const [selectedPlan, setSelectedPlan] = useState(null);
	const [isStaking, setIsStaking] = useState(false);
	const [isClaiming, setIsClaiming] = useState(false);
	const [lastClaimTime, setLastClaimTime] = useState(null);
	const [nextClaimTime, setNextClaimTime] = useState(null);

	// Mock staking data - in real app this would come from contract
	const [stakingData, setStakingData] = useState({
		currentPlan: null,
		stakedAmount: 0,
		earnedRewards: 0,
		stakingStartTime: null,
		canClaim: false,
	});

	useEffect(() => {
		// Calculate next claim time for free plan
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
				canClaim: plan.id === 0, // Free plan can claim immediately
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
				// Free plan mining rewards
				await claimMiningRewards();
				setLastClaimTime(new Date());
				setStakingData((prev) => ({
					...prev,
					earnedRewards:
						prev.earnedRewards + MINING_PLANS.FREE.dailyReward,
					canClaim: false,
				}));
			} else {
				// Paid plan staking rewards
				await claimStakingRewards();
				setStakingData((prev) => ({
					...prev,
					earnedRewards: 0, // Reset after claiming
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
		return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
	};

	const getTimeUntilNextClaim = () => {
		if (!nextClaimTime) return "";
		const now = new Date();
		const diff = nextClaimTime.getTime() - now.getTime();

		if (diff <= 0) return "Ready to claim!";

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		return `${hours}h ${minutes}m`;
	};

	// if (!isConnected) {
	// 	return (
	// 		<Container maxW="6xl">
	// 			<AlertNotification
	// 				status={"warning"}
	// 				alertMsg={
	// 					"Please connect your wallet to access staking features"
	// 				}
	// 			/>
	// 		</Container>
	// 	);
	// }

	return (
		<Container maxW="6xl" p={0}>
			<VStack gap={6} alignContent="stretch">
				<SimpleHeading
					icon={FaPiggyBank}
					headingTitle={"Staking & Mining"}
					headingDesc={
						"  Stake your Sabi Cash or start mining to earn daily rewards"
					}
				/>

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
						{/* Current Staking Status */}
						{stakingData.currentPlan && (
							<Box p={4} w={450}>
								<Card.Root
									bg={"gray.900"}
									borderRadius="1xl"
									shadow="2xl"
									border="1px solid"
									borderColor={0}
									overflow="hidden"
									position="relative"
								>
									<Card.Body p={8}>
										<VStack gap={2} mb={7} textAlign="center">
											<Box fontSize="2xl">💎</Box>
											<Text
												fontSize="2xl"
												fontWeight="bold"
												color={"white"}
											>
												Staking Dashboard
											</Text>
											<Text
												fontSize="sm"
												color={"gray.400"}
												fontWeight="medium"
											>
												Earn rewards by staking your SABI tokens
											</Text>
										</VStack>
										<HStack
											justify="space-between"
											w="full"
											py={4}
											borderBottom="1px solid"
											borderColor={"gray.600"}
										>
											<Text fontWeight="500" color={"gray.400"}>
												Current Plan:
											</Text>
											<Badge colorPalette="blue" fontSize="md" p={2}>
												{stakingData.currentPlan.name}
											</Badge>
										</HStack>
										<HStack
											justify="space-between"
											w="full"
											py={4}
											borderBottom="1px solid"
											borderColor={"gray.600"}
										>
											<Text fontWeight="500" color={"gray.400"}>
												Staked Amount:
											</Text>
											<Text fontWeight="semibold" color={"gray.400"}>
												{stakingData.stakedAmount} SABI
											</Text>
										</HStack>
										<HStack
											justify="space-between"
											w="full"
											py={4}
											borderBottom="1px solid"
											borderColor={"gray.600"}
										>
											<Text fontWeight="500" color={"gray.400"}>
												Earned Rewards:
											</Text>
											<Text
												fontWeight="bold"
												color={"white"}
												fontSize={"lg"}
											>
												{stakingData.earnedRewards} SABI
											</Text>
										</HStack>

										{stakingData.currentPlan.id === 0 && (
											<Box
												p={5}
												rounded={"sm"}
												border="1px solid"
												borderColor={"gray.600"}
												my={4}
											>
												{/* Next Claim Timer */}

												<HStack
													justify="space-between"
													alignItems="center"
													mb={4}
												>
													<HStack gap={2}>
														<Clock size={16} color="#fff" />
														<Text
															fontSize="sm"
															color={"gray.400"}
															fontWeight="400"
														>
															Next Claim Available:
														</Text>
													</HStack>
													<Box
														bg={`gray.800`}
														px={3}
														py={1}
														borderRadius="lg"
														shadow="sm"
														border="1px solid"
														borderColor={"gray.600"}
													>
														<Text
															fontSize="sm"
															fontWeight="bold"
															color={"white"}
														>
															{getTimeUntilNextClaim()}
														</Text>
													</Box>
												</HStack>
												<Button
													w={"full"}
													bg="#0088CD"
													color="white"
													py={6}
													borderRadius="xl"
													fontSize="md"
													fontWeight="600"
													onClick={handleClaimRewards}
													isLoading={isClaiming}
													loadingText="Claiming..."
													isDisabled={!canClaimFree()}
													transition="all 0.3s ease"
												>
													<FaGift />
													Claim Free Rewards
												</Button>
											</Box>
										)}

										{stakingData.currentPlan.id > 0 && (
											<Button
												bg="#0088CD"
												color="white"
												py={6}
												borderRadius="xl"
												fontSize="md"
												fontWeight="600"
												onClick={handleClaimRewards}
												isLoading={isClaiming}
												isDisabled={stakingData.earnedRewards === 0}
												transition="all 0.3s ease"
											>
												<FaGift /> Claim Staking Rewards
											</Button>
										)}
									</Card.Body>
								</Card.Root>
							</Box>
						)}

						{/* Mining Plans */}
						<Box
							display={"grid"}
							gridTemplateColumns={{
								base: "1fr",
								md: "1fr 1fr",
								lg: "1fr 1fr 1fr",
							}}
							w={"full"}
							my={10}
							gap={10}
						>
							{Object.values(MINING_PLANS).map((plan, index) => (
								<Card.Root
									key={plan.id}
									border="2px solid"
									borderColor={
										stakingData.currentPlan?.id === plan.id
											? "blue.500"
											: "gray.200"
									}
									_hover={{
										borderColor: "blue.300",
										transform: "translateY(-2px)",
									}}
									scale={`${index == 1 ? 1.05 : 1}`}
									transition="all 0.2s"
								>
									<Card.Body>
										<VStack spaceY={4} alignItems="stretch">
											<Box textAlign="center">
												<Heading size="md" color="blue.600">
													{plan.name}
												</Heading>
												<Text
													fontSize="2xl"
													fontWeight="bold"
													mt={2}
													color={"#212121"}
												>
													{plan.deposit === 0
														? "FREE"
														: `${plan.deposit} SABI`}
												</Text>
											</Box>

											<Separator />
											<VStack gap={3} align="stretch">
												<HStack>
													<Box as={FaCoins} color="green.500" />
													<Text fontSize="sm">
														<strong>
															{plan.dailyReward} SABI
														</strong>{" "}
														per day
													</Text>
												</HStack>
												<HStack>
													<Box as={FaClock} color="blue.500" />
													<Text fontSize="sm">
														Duration:{" "}
														<strong>
															{plan.duration} day
															{plan.duration > 1 ? "s" : ""}
														</strong>
													</Text>
												</HStack>
												<HStack>
													<Box
														as={
															plan.autoTrigger ? FaPlay : FaPause
														}
														color={
															plan.autoTrigger
																? "green.500"
																: "orange.500"
														}
													/>
													<Text fontSize="sm">
														{plan.autoTrigger
															? "Auto claim"
															: "Manual claim"}
													</Text>
												</HStack>
											</VStack>
											<Separator />

											<VStack justifySelf={"end"}>
												<Text
													fontSize="sm"
													color="gray.600"
													textAlign="center"
												>
													Total potential:{" "}
													<strong>
														{plan.dailyReward * plan.duration}{" "}
														SABI
													</strong>
												</Text>

												<Button
													bg="#0088CD"
													color="white"
													w="full"
													py={6}
													rounded={"md"}
													onClick={() => handleStake(plan.id)}
													isLoading={isStaking}
													isDisabled={
														stakingData.currentPlan?.id ===
															plan.id ||
														(plan.deposit > 0 &&
															plan.deposit >
																parseFloat(sabiBalance))
													}
													_hover={{ bg: "#0077B6" }}
												>
													{stakingData.currentPlan?.id === plan.id
														? "Active"
														: "Start Plan"}
												</Button>
											</VStack>
										</VStack>
									</Card.Body>
								</Card.Root>
							))}
						</Box>

						{/* Account Info */}
						<Card.Root rounded={"lg"} w={"full"}>
							<Card.Body rounded={"lg"} p={6}>
								<HStack justifyContent="space-between" w="full">
									<Text fontWeight="500" fontSize={18}>
										Available Sabi Cash:
									</Text>
									<Badge
										colorPalette={"green"}
										variant={"solid"}
										fontSize="md"
										p={2}
									>
										{sabiBalance} SABI
									</Badge>
								</HStack>
							</Card.Body>
						</Card.Root>

						{/* Information */}
						<Card.Root bg="blue.900" mt={8} borderColor="blue.700">
							<Card.Body>
								<VStack gap={3} align="start">
									<Text
										fontWeight="bold"
										fontSize={19}
										color="blue.200"
									>
										Mining & Staking Information:
									</Text>
									<Text fontSize="sm" color="blue.300">
										• <strong>Free Plan:</strong> Earn 0.9 Sabi Cash
										every 24 hours (manual claim required)
									</Text>
									<Text fontSize="sm" color="blue.300">
										• <strong>Basic Plan:</strong> Deposit 100 Sabi
										Cash, earn 15 Sabi Cash daily for 30 days
									</Text>
									<Text fontSize="sm" color="blue.300">
										• <strong>Premium Plan:</strong> Deposit 1000 Sabi
										Cash, earn 170 Sabi Cash daily for 30 days
										(auto-claim)
									</Text>
									<Text fontSize="sm" color="blue.300">
										• You can only be in one plan at a time
									</Text>
									<Text fontSize="sm" color="blue.300">
										• Contract deployment required before staking can
										begin
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

export default Staking;
