import React, { useState } from "react";
import {
	Box,
	Card,
	VStack,
	HStack,
	Text,
	Heading,
	SimpleGrid,
	Stat,
	Badge,
	Progress,
	Button,
	Table,
	NativeSelect,
} from "@chakra-ui/react";
import { FaDownload, FaArrowUp, FaArrowDown } from "react-icons/fa";

const AnalyticsDashboard = ({ stats, data }) => {
	const [timeRange, setTimeRange] = useState("30d");

	// Process data from props
	const recentActivity = (data?.recentActivity || []).map((item, index) => {
		let description = "";
		let reward = 0;
		let user = "";
		let type = "unknown";

		if (item.type === 'user_registration') {
			type = 'referral';
			description = "New User Registration";
			user = item.data.email;
		} else if (item.type === 'task_completion') {
			type = 'task_completed';
			description = `Task Completed: ${item.data.title || item.data.task_id}`;
			user = item.data.email || "Unknown User";
		} else if (item.type === 'mining_stake') {
			type = 'staking_reward';
			description = `New Mining Stake (${item.data.plan_type})`;
			reward = item.data.amount;
			user = item.data.email || "Unknown User";
		}

		return {
			id: index,
			type,
			user,
			description,
			reward,
			timestamp: new Date(item.created_at).toLocaleString()
		};
	});

	const topUsers = (data?.topUsers || []).map((user, index) => ({
		rank: index + 1,
		name: user.username || "Unknown",
		email: user.email,
		totalEarned: user.totalEarned,
		tasksCompleted: user.tasksCompleted,
		trend: "neutral"
	}));

	const taskPerformance = (data?.taskPerformance || []).map(task => ({
		taskName: task.taskName,
		completions: parseInt(task.completions),
		successRate: parseFloat(task.successRate).toFixed(1),
		avgTimeToComplete: "-",
		totalRewards: parseInt(task.totalRewards)
	}));

	const getActivityIcon = (type) => {
		switch (type) {
			case "task_completed":
				return "✅";
			case "points_converted":
				return "🔄";
			case "token_purchase":
				return "💰";
			case "staking_reward":
				return "🎁";
			case "referral":
				return "👥";
			default:
				return "📝";
		}
	};

	const getActivityColor = (type) => {
		switch (type) {
			case "task_completed":
				return "green";
			case "points_converted":
				return "blue";
			case "token_purchase":
				return "purple";
			case "staking_reward":
				return "orange";
			case "referral":
				return "pink";
			default:
				return "gray";
		}
	};

	const exportData = () => {
		// Mock export functionality
		const data = {
			stats,
			recentActivity,
			topUsers,
			taskPerformance,
			exportedAt: new Date().toISOString(),
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `sabi_analytics_${new Date().getTime()}.json`;
		link.click();
		window.URL.revokeObjectURL(url);
	};

	return (
		<VStack gap={6} align="stretch">
			{/* Header with Controls */}
			<HStack justify="space-between" flexWrap={`wrap`}>
				<Box>
					<Heading size="lg" fontWeight={600}>
						Analytics Dashboard
					</Heading>
					<Text color="gray.600" fontSize={{ base: 13, md: 16 }}>
						Real-time insights and performance metrics
					</Text>
				</Box>
				<HStack gap={4}>
					<NativeSelect.Root
						value={timeRange}
						onChange={(e) => setTimeRange(e.target.value)}
						maxW="150px"
					>
						<NativeSelect.Field color={`#000`}>
							<option value="7d">Last 7 days</option>
							<option value="30d">Last 30 days</option>
							<option value="90d">Last 3 months</option>
							<option value="1y">Last year</option>
						</NativeSelect.Field>
						<NativeSelect.Indicator />
					</NativeSelect.Root>
					<Button colorPalette="blue" onClick={exportData}>
						<FaDownload /> Export Data
					</Button>
				</HStack>
			</HStack>

			{/* Key Performance Indicators */}
			<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>User Growth</Stat.Label>
							<Stat.ValueText>+{stats.monthlyGrowth}%</Stat.ValueText>
							<Stat.HelpText>
								<Stat.UpIndicator />
								vs last month
							</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Task Completion Rate</Stat.Label>
							<Stat.ValueText>{stats.taskCompletionRate}%</Stat.ValueText>
							<Stat.HelpText>
								Verified completions
							</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Avg. Tokens per User</Stat.Label>
							<Stat.ValueText>{stats.avgTokensPerUser}</Stat.ValueText>
							<Stat.HelpText>
								SABI per user
							</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Daily Active Users</Stat.Label>
							<Stat.ValueText>{parseInt(stats.dailyActiveUsers).toLocaleString()}</Stat.ValueText>
							<Stat.HelpText>
								Last 24 hours
							</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>

			{/* Charts and Activity */}
			<SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
				{/* Recent Activity */}
				<Card.Root>
					<Card.Body>
						<VStack gap={4} align="stretch">
							<Heading size="md">Recent Activity</Heading>
							<VStack gap={3} align="stretch">
								{recentActivity.map((activity) => (
									<HStack
										key={activity.id}
										p={3}
										border="1px solid"
										borderColor="gray.200"
										rounded="md"
										flexWrap={`wrap`}
									>
										<Text fontSize="lg">
											{getActivityIcon(activity.type)}
										</Text>
										<Box flex={1} spaceY={2}>
											<Text fontSize="sm" fontWeight="600">
												{activity.description}
											</Text>
											<Text fontSize="xs" color="gray.600">
												{activity.user}
											</Text>
										</Box>
										<VStack gap={2} align="end">
											<Badge
												colorPalette={getActivityColor(
													activity.type
												)}
											>
												+{activity.reward} SABI
											</Badge>
											<Text fontSize="xs" color="gray.500">
												{activity.timestamp}
											</Text>
										</VStack>
									</HStack>
								))}
							</VStack>
						</VStack>
					</Card.Body>
				</Card.Root>

				{/* Top Performing Users */}
				<Card.Root>
					<Card.Body>
						<VStack gap={4} align="stretch">
							<Heading size="md" fontWeight={600}>
								Top Performing Users
							</Heading>
							<Table.ScrollArea maxH="500px">
								<Table.Root size="md" stickyHeader>
									<Table.Header>
										<Table.Row
											fontSize={15}
											bg={`bg.muted`}
											fontWeight={`bold`}
										>
											<Table.ColumnHeader>Rank</Table.ColumnHeader>
											<Table.ColumnHeader>User</Table.ColumnHeader>
											<Table.ColumnHeader>Earned</Table.ColumnHeader>
											<Table.ColumnHeader>Tasks</Table.ColumnHeader>
										</Table.Row>
									</Table.Header>
									<Table.Body spaceY={2}>
										{topUsers.map((user) => (
											<Table.Row key={user.rank}>
												<Table.Cell>
													<HStack>
														<Text fontWeight="500">
															#{user.rank}
														</Text>
														{user.trend === "up" ? (
															<FaArrowUp color="green" />
														) : (
															<FaArrowDown color="red" />
														)}
													</HStack>
												</Table.Cell>
												<Table.Cell>
													<Box spaceY={1}>
														<Text fontSize="sm" fontWeight="600">
															{user.name}
														</Text>
														<Text fontSize="xs" color="gray.600">
															{user.email}
														</Text>
													</Box>
												</Table.Cell>
												<Table.Cell>
													<Text fontWeight="bold">
														{user.totalEarned} SABI
													</Text>
												</Table.Cell>
												<Table.Cell>
													{user.tasksCompleted}
												</Table.Cell>
											</Table.Row>
										))}
									</Table.Body>
								</Table.Root>
							</Table.ScrollArea>
						</VStack>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>

			{/* Task Performance Analysis */}
			<Card.Root>
				<Card.Body>
					<VStack gap={4} align="stretch">
						<Heading size="md">Task Performance Analysis</Heading>
						<Table.ScrollArea maxH="500px">
							<Table.Root stickyHeader>
								<Table.Header>
									<Table.Row fontSize={15}>
										<Table.ColumnHeader>Task Name</Table.ColumnHeader>
										<Table.ColumnHeader>
											Completions
										</Table.ColumnHeader>
										<Table.ColumnHeader>
											Success Rate
										</Table.ColumnHeader>
										<Table.ColumnHeader>Avg. Time</Table.ColumnHeader>
										<Table.ColumnHeader>
											Total Rewards
										</Table.ColumnHeader>
										<Table.ColumnHeader>
											Performance
										</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{taskPerformance.map((task, index) => (
										<Table.Row key={index}>
											<Table.Cell fontWeight="bold">
												{task.taskName}
											</Table.Cell>
											<Table.Cell>{task.completions}</Table.Cell>
											<Table.Cell>
												<HStack>
													<Text>{task.successRate}%</Text>
													<Progress.Root
														value={task.successRate}
														size="sm"
														colorPalette="green"
														w="50px"
													/>
												</HStack>
											</Table.Cell>
											<Table.Cell>
												{task.avgTimeToComplete}
											</Table.Cell>
											<Table.Cell>
												{task.totalRewards} SABI
											</Table.Cell>
											<Table.Cell>
												<Badge
													colorPalette={
														task.successRate > 85
															? "green"
															: task.successRate > 70
															? "yellow"
															: "red"
													}
												>
													{task.successRate > 85
														? "Excellent"
														: task.successRate > 70
														? "Good"
														: "Needs Improvement"}
												</Badge>
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Root>
						</Table.ScrollArea>
					</VStack>
				</Card.Body>
			</Card.Root>

			{/* System Health */}
			<SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
				<Card.Root>
					<Card.Body>
						<VStack gap={3}>
							<Heading size="md">Smart Contract Health</Heading>
							<Progress.Root
								value={98}
								colorPalette="green"
								size="lg"
								w="full"
							/>
							<Text fontSize="sm" color="green.600">
								98% Uptime
							</Text>
						</VStack>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<VStack gap={3}>
							<Heading size="md">API Response Time</Heading>
							<Progress.Root
								value={85}
								colorPalette="blue"
								size="lg"
								w="full"
							/>
							<Text fontSize="sm" color="blue.600">
								142ms Avg
							</Text>
						</VStack>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<VStack gap={3}>
							<Heading size="md">Task Verification Rate</Heading>
							<Progress.Root
								value={92}
								colorScheme="purple"
								size="lg"
								w="full"
							/>
							<Text fontSize="sm" color="purple.600">
								92% Auto-verified
							</Text>
						</VStack>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>
		</VStack>
	);
};

export default AnalyticsDashboard;
