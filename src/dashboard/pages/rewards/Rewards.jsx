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
	SimpleGrid,
	Icon,
	Spinner,
	Center,
} from "@chakra-ui/react";
import {
	FaTwitter,
	FaUserPlus,
	FaThumbsUp,
	FaComment,
	FaCheck,
	FaExternalLinkAlt,
	FaTelegram,
	FaDiscord,
	FaYoutube,
	FaGlobe,
} from "react-icons/fa";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import SimpleHeading from "@/dashboard/components/SimpleHeading/SimpleHeading";
import { FaGift } from "react-icons/fa6";
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
				// Fetch active tasks
				const tasksResponse = await tasksAPI.getTasks({ active_only: true });
				
				if (tasksResponse.success) {
					setTasks(tasksResponse.results);
				}

				// If logged in, fetch user stats
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

	const getTaskColor = (category) => {
		switch (category) {
			case 'social': return 'blue';
			case 'referral': return 'green';
			case 'content': return 'purple';
			default: return 'orange';
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

	return (
		<>
			{/* Removed Modal component */}

			<Container maxW="4xl" p={0}>
				<VStack gap={6} align="stretch">
					<SimpleHeading
						icon={FaGift}
						headingTitle={"Rewards & Tasks"}
						headingDesc={"	Complete tasks to earn Sabi Cash rewards"}
					/>

					{!isConnected && (
						<AlertNotification
							status={"warning"}
							alertMsg={
								"  Please connect your wallet to access rewards and tasks"
							}
						/>
					)}

					{isLoading ? (
						<Center py={10}>
							<Spinner size="xl" />
						</Center>
					) : (
						isConnected && (
							<>
								{/* Earnings Summary */}
								<Card.Root border={0} mb={3} rounded={"sm"}>
									<Card.Body rounded={"sm"}>
										<VStack gap={4}>
											<HStack justify="space-between" w="full">
												<Text fontWeight="500">Tasks Completed:</Text>
												<Badge
													colorPalette="green"
													variant={"solid"}
													fontSize="md"
													p={2}
												>
													{userStats.completed_tasks} / {tasks.length}
												</Badge>
											</HStack>
											<HStack justify="space-between" w="full">
												<Text fontWeight="500">Total Earned:</Text>
												<Badge
													colorPalette="green"
													variant={"solid"}
													fontSize="md"
													p={2}
												>
													{Number(userStats.total_rewards_sabi).toFixed(2)} SBC
												</Badge>
											</HStack>
										</VStack>
									</Card.Body>
								</Card.Root>

								{/* Available Tasks */}
								<SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
									{tasks.map((task) => {
										const isCompleted = task.user_completed;
										const TaskIcon = getTaskIcon(task.taskType, task.category);
										const colorScheme = getTaskColor(task.category);

										return (
											<Card.Root
												key={task.id}
												border="2px solid"
												borderColor={
													isCompleted ? "green.500" : "gray.200"
												}
												opacity={isCompleted ? 0.7 : 1}
												cursor={isCompleted ? "default" : "pointer"}
												_hover={
													!isCompleted
														? {
																borderColor: `${colorScheme}.300`,
																transform: "translateY(-2px)",
														  }
														: {}
												}
												transition="all 0.2s"
												onClick={() => handleTaskClick(task)}
											>
												<Card.Body>
													<VStack gap={4} align="stretch">
														<HStack>
															<Icon
																as={
																	isCompleted
																		? FaCheck
																		: TaskIcon
																}
																color={
																	isCompleted
																		? "green.500"
																		: `${colorScheme}.500`
																}
																boxSize={6}
															/>
															<Box flex={1}>
																<Heading size="sm" mb={1}>
																	{task.title}
																</Heading>
																<Text
																	fontSize="sm"
																	color="gray.600"
																>
																	{task.description}
																</Text>
															</Box>
															<Badge
																colorScheme={
																	isCompleted
																		? "green"
																		: colorScheme
																}
																fontSize="sm"
																p={2}
															>
																{isCompleted
																	? "✓ Done"
																	: `+${Number(task.rewardSabiCash).toFixed(0)} SBC`}
															</Badge>
														</HStack>

														{!isCompleted && (
															<Button
																bg={`${colorScheme}.500`}
																color="white"
																size="sm"
																_hover={{
																	bg: `${colorScheme}.600`,
																}}
															>
																{task.externalUrl ? "Go to Task" : "View Details"}
															</Button>
														)}
													</VStack>
												</Card.Body>
											</Card.Root>
										);
									})}
									{tasks.length === 0 && (
										<Box gridColumn="1 / -1">
											<AlertNotification
												status="info"
												alertMsg="No tasks available at the moment. Check back later!"
											/>
										</Box>
									)}
								</SimpleGrid>

								{/* Information */}
								<Card.Root bg="blue.900" borderColor="blue.700" mt={"5"}>
									<Card.Body>
										<VStack gap={3} align="start">
											<Text fontWeight="bold" color="blue.200">
												Task Rewards Information:
											</Text>
											<Text fontSize="sm" color="blue.300">
												• Tasks are verified automatically when
												possible
											</Text>
											<Text fontSize="sm" color="blue.300">
												• Some tasks may require manual verification
												(24-48 hour review)
											</Text>
											<Text fontSize="sm" color="blue.300">
												• Rewards are sent directly to your connected
												wallet
											</Text>
											<Text fontSize="sm" color="blue.300">
												• More tasks will be added regularly for
												additional earning opportunities
											</Text>
										</VStack>
									</Card.Body>
								</Card.Root>
							</>
						)
					)}
				</VStack>
			</Container>
		</>
	);
};

export default Rewards;
