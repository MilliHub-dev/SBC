import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Text,
	Button,
	Flex,
	Badge,
	Grid,
	Icon,
	Spinner,
} from "@chakra-ui/react";
import {
	FaTwitter,
	FaUserPlus,
	FaThumbsUp,
	FaTelegram,
	FaDiscord,
	FaYoutube,
} from "react-icons/fa";
import { FaGift, FaCheck, FaArrowRight, FaTrophy, FaCoins, FaBolt, FaRocket, FaStar, FaCircleCheck } from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { tasksAPI } from "../../../config/apiConfig";

const Rewards = () => {
	const { isConnected, isLoggedIn } = useWeb3();
	const [tasks, setTasks] = useState([]);
	const [userStats, setUserStats] = useState({
		completed_tasks: 0,
		total_rewards_sabi: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const tasksResponse = await tasksAPI.getTasks({ active_only: true });

				if (tasksResponse.success) {
					setTasks(tasksResponse.results);
				}

				if (isLoggedIn) {
					const userTasksResponse = await tasksAPI.getUserTasks();
					if (userTasksResponse.success && userTasksResponse.summary) {
						setUserStats({
							completed_tasks: userTasksResponse.summary.completed_tasks,
							total_rewards_sabi: userTasksResponse.summary.total_task_rewards.sabi_cash,
						});
					}
				}
			} catch (error) {
				console.error("Error fetching rewards data:", error);
				toaster.create({
					title: "Error",
					description: "Failed to load tasks data. Please try again later.",
					type: "error",
					duration: 3000,
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [isConnected, isLoggedIn]);

	const getTaskIcon = (type, category) => {
		if (category === 'social') {
			if (type?.includes('twitter')) return FaTwitter;
			if (type?.includes('telegram')) return FaTelegram;
			if (type?.includes('discord')) return FaDiscord;
			if (type?.includes('youtube')) return FaYoutube;
			return FaThumbsUp;
		}
		if (category === 'referral') return FaUserPlus;
		return FaGift;
	};

	const getTaskColors = (category) => {
		switch (category) {
			case 'social':
				return {
					gradient: "linear-gradient(135deg, #00FFFF 0%, #0088CC 100%)",
					light: "cyan.400",
					bg: "rgba(0, 255, 255, 0.1)"
				};
			case 'referral':
				return {
					gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
					light: "green.400",
					bg: "rgba(16, 185, 129, 0.1)"
				};
			case 'content':
				return {
					gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
					light: "purple.400",
					bg: "rgba(168, 85, 247, 0.1)"
				};
			default:
				return {
					gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
					light: "yellow.400",
					bg: "rgba(245, 158, 11, 0.1)"
				};
		}
	};

	const handleTaskClick = async (task) => {
		if (task.user_completed) return;

		if (task.externalUrl) {
			window.open(task.externalUrl, '_blank');
		}

		toaster.create({
			title: "Task Selected",
			description: `Selected task: ${task.title}. Follow instructions to complete!`,
			type: "info",
			duration: 3000,
		});
	};

	const completionPercentage = tasks.length > 0
		? Math.round((userStats.completed_tasks / tasks.length) * 100)
		: 0;

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
							bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
							display="flex"
							alignItems="center"
							justifyContent="center"
							boxShadow="0 0 20px rgba(16, 185, 129, 0.3)"
						>
							<Icon as={FaGift} color="white" boxSize={6} />
						</Box>
						<Box>
							<Text
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
							>
								Rewards & Tasks
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Complete tasks to earn SBC rewards and unlock exclusive benefits
							</Text>
						</Box>
					</Flex>
				</Box>

				{!isConnected && (
					<AlertNotification
						status={"warning"}
						alertMsg={"Please connect your wallet to access rewards and tasks"}
					/>
				)}

				{isLoading ? (
					<Flex justify="center" align="center" py={20}>
						<Box textAlign="center">
							<Spinner
								size="xl"
								color="cyan.400"
								thickness="4px"
								speed="0.8s"
							/>
							<Text mt={4} color="whiteAlpha.600" fontSize="sm">
								Loading tasks...
							</Text>
						</Box>
					</Flex>
				) : (
					isConnected && (
						<>
							{/* Stats Overview */}
							<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
								<Box className="blockchain-card" p={5}>
									<Flex align="center" justify="space-between">
										<Box>
											<Text fontSize="sm" color="whiteAlpha.600" mb={1}>Tasks Completed</Text>
											<Text
												fontSize="2xl"
												fontWeight="bold"
												fontFamily="'Space Grotesk', sans-serif"
												color="cyan.400"
											>
												{userStats.completed_tasks} / {tasks.length}
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
											<Icon as={FaCircleCheck} color="cyan.400" boxSize={5} />
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
												className="text-gradient-cyber"
											>
												{Number(userStats.total_rewards_sabi).toFixed(2)} SBC
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
											<Icon as={FaCoins} color="green.400" boxSize={5} />
										</Box>
									</Flex>
								</Box>

								<Box className="blockchain-card" p={5}>
									<Flex align="center" justify="space-between">
										<Box>
											<Text fontSize="sm" color="whiteAlpha.600" mb={1}>Completion Rate</Text>
											<Text
												fontSize="2xl"
												fontWeight="bold"
												fontFamily="'Space Grotesk', sans-serif"
												color="purple.400"
											>
												{completionPercentage}%
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
											<Icon as={FaTrophy} color="purple.400" boxSize={5} />
										</Box>
									</Flex>
								</Box>
							</Grid>

							{/* Progress Bar */}
							<Box className="blockchain-card" p={5}>
								<Flex align="center" justify="space-between" mb={3}>
									<Text fontSize="sm" fontWeight="600">Task Progress</Text>
									<Text fontSize="sm" color="whiteAlpha.600">
										{userStats.completed_tasks} of {tasks.length} completed
									</Text>
								</Flex>
								<Box
									w="full"
									h="8px"
									bg="whiteAlpha.100"
									borderRadius="full"
									overflow="hidden"
								>
									<Box
										h="full"
										w={`${completionPercentage}%`}
										bg="linear-gradient(90deg, #00FFFF 0%, #A855F7 100%)"
										borderRadius="full"
										transition="width 0.5s ease"
									/>
								</Box>
							</Box>

							{/* Available Tasks */}
							<Box>
								<Flex align="center" gap={2} mb={6}>
									<Icon as={HiOutlineSparkles} color="cyan.400" boxSize={5} />
									<Text
										fontSize="xl"
										fontWeight="bold"
										fontFamily="'Space Grotesk', sans-serif"
									>
										Available Tasks
									</Text>
								</Flex>

								{tasks.length === 0 ? (
									<Box className="blockchain-card" p={8} textAlign="center">
										<Box
											w="60px"
											h="60px"
											borderRadius="full"
											bg="rgba(0, 255, 255, 0.1)"
											display="flex"
											alignItems="center"
											justifyContent="center"
											mx="auto"
											mb={4}
										>
											<Icon as={FaStar} color="cyan.400" boxSize={7} />
										</Box>
										<Text fontWeight="600" mb={2}>No Tasks Available</Text>
										<Text fontSize="sm" color="whiteAlpha.600">
											Check back later for new earning opportunities!
										</Text>
									</Box>
								) : (
									<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
										{tasks.map((task) => {
											const isCompleted = task.user_completed;
											const TaskIcon = getTaskIcon(task.taskType, task.category);
											const colors = getTaskColors(task.category);

											return (
												<Box
													key={task.id}
													className="blockchain-card"
													p={5}
													position="relative"
													overflow="hidden"
													role="group"
													cursor={isCompleted ? "default" : "pointer"}
													opacity={isCompleted ? 0.8 : 1}
													border={isCompleted ? "1px solid" : "1px solid"}
													borderColor={isCompleted ? "green.500" : "rgba(255, 255, 255, 0.1)"}
													onClick={() => handleTaskClick(task)}
													_hover={!isCompleted ? {
														borderColor: colors.light,
														transform: "translateY(-2px)",
													} : {}}
													transition="all 0.3s ease"
												>
													{/* Completed badge */}
													{isCompleted && (
														<Badge
															position="absolute"
															top={4}
															right={4}
															bg="green.500"
															color="white"
															px={3}
															py={1}
															borderRadius="full"
															fontSize="xs"
															fontWeight="bold"
															display="flex"
															alignItems="center"
															gap={1}
														>
															<Icon as={FaCheck} boxSize={3} />
															COMPLETED
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
														_groupHover={{ opacity: isCompleted ? 0 : 1 }}
														pointerEvents="none"
													/>

													<Flex direction="column" gap={4} position="relative" zIndex={1}>
														{/* Task Header */}
														<Flex align="flex-start" gap={3}>
															<Box
																w="48px"
																h="48px"
																borderRadius="xl"
																bg={isCompleted ? "rgba(16, 185, 129, 0.2)" : colors.bg}
																display="flex"
																alignItems="center"
																justifyContent="center"
																flexShrink={0}
															>
																<Icon
																	as={isCompleted ? FaCheck : TaskIcon}
																	color={isCompleted ? "green.400" : colors.light}
																	boxSize={5}
																/>
															</Box>
															<Box flex={1}>
																<Text
																	fontWeight="bold"
																	fontSize="md"
																	fontFamily="'Space Grotesk', sans-serif"
																	mb={1}
																>
																	{task.title}
																</Text>
																<Text fontSize="sm" color="whiteAlpha.600" lineHeight="1.5">
																	{task.description}
																</Text>
															</Box>
														</Flex>

														{/* Reward and Action */}
														<Flex align="center" justify="space-between" mt={2}>
															<Box className="glass" px={4} py={2} borderRadius="full">
																<Flex align="center" gap={2}>
																	<Icon as={FaCoins} color={isCompleted ? "green.400" : "yellow.400"} boxSize={4} />
																	<Text
																		fontWeight="bold"
																		fontFamily="'Space Grotesk', sans-serif"
																		color={isCompleted ? "green.400" : "yellow.400"}
																	>
																		{isCompleted ? "Earned" : "+"}{Number(task.rewardSabiCash).toFixed(0)} SBC
																	</Text>
																</Flex>
															</Box>

															{!isCompleted && (
																<Button
																	size="sm"
																	bg={colors.gradient}
																	color="white"
																	borderRadius="full"
																	px={4}
																	rightIcon={<FaArrowRight />}
																	_hover={{
																		transform: "translateX(2px)",
																		boxShadow: `0 0 20px ${colors.bg}`,
																	}}
																	transition="all 0.3s ease"
																>
																	{task.externalUrl ? "Go to Task" : "View Details"}
																</Button>
															)}
														</Flex>
													</Flex>
												</Box>
											);
										})}
									</Grid>
								)}
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
											How Rewards Work
										</Text>
									</Flex>

									<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
										{[
											{ icon: FaBolt, text: "Tasks are verified automatically when possible", color: "cyan.400" },
											{ icon: FaRocket, text: "Some tasks may require manual verification (24-48 hours)", color: "purple.400" },
											{ icon: FaCoins, text: "Rewards are sent directly to your connected wallet", color: "green.400" },
											{ icon: FaStar, text: "New tasks are added regularly for more earning opportunities", color: "yellow.400" },
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
												All rewards are distributed securely on the Solana blockchain
											</Text>
										</Flex>
									</Box>
								</Flex>
							</Box>
						</>
					)
				)}
			</Flex>
		</Container>
	);
};

export default Rewards;
