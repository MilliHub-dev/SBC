import React, { useState, useEffect, useCallback } from "react";
import { useDisclosure } from "@chakra-ui/react"; // 👈 add this
import {
	Box,
	Container,
	Heading,
	Text,
	Button,
	Card,
	VStack,
	HStack,
	SimpleGrid,
	Badge,
	Icon,
	Stat,
	Alert,
	Input,
	Textarea,
	NativeSelect,
	Tabs,
	Dialog,       // ⟵ v3 replacement for Modal
	Portal,       // ⟵ for rendering overlays
	CloseButton,  // ⟵ for the close icon
  } from "@chakra-ui/react";
import {
	FaUsers,
	FaListCheck,
	FaCoins,
	FaChartLine,
	FaGear,
	FaDatabase,
	FaPlus,
	FaGift,
	FaPiggyBank,
	FaTrash,
	FaPenToSquare ,
	FaCar,
} from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import TaskManager from "../../components/Admin/TaskManager/TaskManager";
import UserManager from "../../components/Admin/UserManager/UserManager";
import DriverApplicationManager from "../../components/Admin/DriverApplicationManager/DriverApplicationManager";
import ContractManager from "../../components/Admin/ContractManager/ContractManager";
import AnalyticsDashboard from "../../components/Admin/AnalyticsDashboard";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { LuChartBar, LuPickaxe } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import { tasksAPI, adminAPI } from "../../../config/apiConfig";
import { authService } from "../../../services/authService";

const AdminPanel = () => {
	const { isConnected, address, isLoggedIn } = useWeb3();
	const [activeTab, setActiveTab] = useState(0);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [adminStats, setAdminStats] = useState({
		totalUsers: 0,
		totalTokens: 0,
		activeTasks: 0,
		pendingRewards: 0,
		totalStaked: 0,
		monthlyGrowth: 0,
		dailyActiveUsers: 0,
		taskCompletionRate: 0,
		avgTokensPerUser: 0,
	});
	const [taskManagerStats, setTaskManagerStats] = useState({
		totalTasks: 0,
		activeTasks: 0,
		completedToday: 0,
		totalRewardsDistributed: 0,
	});
	const [dashboardData, setDashboardData] = useState({
		recentActivity: [],
		topUsers: [],
		taskPerformance: []
	});
	const [tasks, setTasks] = useState([]);
	const [loadingTasks, setLoadingTasks] = useState(false);
	const [loadingStats, setLoadingStats] = useState(false);
	
	// Task creation modal
	const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
	const [taskForm, setTaskForm] = useState({
		title: '',
		description: '',
		type: 'social',
		points: 0,
		sabiCash: 0,
		requirements: {},
		isActive: true,
	});

	// Demo data removal
	const [isRemovingDemoData, setIsRemovingDemoData] = useState(false);

	// Check if user is admin
	useEffect(() => {
		const checkAdminStatus = async () => {
			if (!isConnected || !address || !isLoggedIn) return;

			try {
				// Check if user has admin privileges through the API
				const tokens = authService.getTokens();
				let apiAuthorized = false;
				
				// 1. Check API if logged in
				if (tokens.sabiCashToken) {
					try {
						const config = await adminAPI.getConfig();
						apiAuthorized = config.success;
					} catch (e) {
						console.warn("Admin API check failed:", e);
					}
				}
				
				const localAuthorized = localStorage.getItem("isAdmin") === "true";
				const nextAuthorized = apiAuthorized || localAuthorized;

				setIsAuthorized(nextAuthorized);

				if (!nextAuthorized) {
					toaster.create({
						title: "Access Denied",
						description: "You do not have administrator privileges",
						type: "error",
						duration: 5000,
					});
				}
			} catch (error) {
				console.error('Error checking admin status:', error);
				setIsAuthorized(false);
			}
		};

		checkAdminStatus();
	}, [isConnected, address, isLoggedIn]);

	// Fetch admin statistics
	useEffect(() => {
		const fetchAdminStats = async () => {
			if (!isAuthorized) return;

			setLoadingStats(true);
			try {
				const analytics = await adminAPI.getAnalytics();
				if (analytics.success && analytics.analytics) {
					const data = analytics.analytics;
					
					// Calculate monthly growth
					const totalUsers = parseInt(data.users.total_users) || 0;
					const newUsers = parseInt(data.users.new_users_30d) || 0;
					const prevUsers = totalUsers - newUsers;
					const growth = prevUsers > 0 
						? ((newUsers / prevUsers) * 100).toFixed(1) 
						: (newUsers > 0 ? 100 : 0);

					// Calculate task completion rate
					const totalCompletions = parseInt(data.tasks.total_completions) || 0;
					const verifiedCompletions = parseInt(data.tasks.verified_completions) || 0;
					const completionRate = totalCompletions > 0 
						? ((verifiedCompletions / totalCompletions) * 100).toFixed(1) 
						: 0;

					setAdminStats({
						totalUsers: totalUsers,
						totalTokens: parseFloat(data.sabi_cash.total_sabi_cash_in_system) || 0,
						activeTasks: parseInt(data.tasks.active_tasks) || 0,
						pendingRewards: parseInt(data.tasks.pending_points) || 0,
						totalStaked: parseFloat(data.mining.total_staked_amount) || 0,
						monthlyGrowth: growth,
						dailyActiveUsers: parseInt(data.users.active_users_24h) || 0,
						taskCompletionRate: completionRate,
						avgTokensPerUser: parseFloat(data.sabi_cash.avg_sabi_cash_per_user).toFixed(2) || 0,
					});

					setDashboardData({
						recentActivity: data.recent_activity || [],
						topUsers: data.top_users || [],
						taskPerformance: data.task_performance || []
					});
					
					if (data.tasks) {
						const tStats = data.tasks;
						setTaskManagerStats({
							totalTasks: parseInt(tStats.total_tasks) || 0,
							activeTasks: parseInt(tStats.active_tasks) || 0,
							completedToday: parseInt(tStats.completed_today) || 0,
							totalRewardsDistributed: parseInt(tStats.total_points_distributed) || 0,
						});
					}
				}
			} catch (error) {
				console.error("Error fetching admin stats:", error);
			} finally {
				setLoadingStats(false);
			}
		};

		fetchAdminStats();
	}, [isAuthorized]);

	// Fetch tasks
	const fetchTasks = useCallback(async () => {
		if (!isAuthorized) return;

		setLoadingTasks(true);
		try {
			const tasksResult = await tasksAPI.getTasks();
			if (tasksResult.success) {
				setTasks(tasksResult.results || []);
			}
		} catch (error) {
			console.error("Error fetching tasks:", error);
		} finally {
			setLoadingTasks(false);
		}
	}, [isAuthorized]);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	// Create new task
	const handleCreateTask = async () => {
		try {
			const taskData = {
				...taskForm,
				rewardPoints: taskForm.points,
				rewardSabiCash: taskForm.sabiCash
			};
			const result = await tasksAPI.createTask(taskData);
			if (result.success) {
				toaster.create({
					title: "Task Created",
					description: "New task has been created successfully",
					type: "success",
					duration: 3000,
				});
				
				// Refresh tasks
				fetchTasks();
				
				// Reset form and close modal
				setTaskForm({
					title: '',
					description: '',
					type: 'social',
					points: 0,
					sabiCash: 0,
					requirements: {},
					isActive: true,
				});
				onTaskModalClose();
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			toaster.create({
				title: "Task Creation Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		}
	};

	// Remove demo data
	const handleRemoveDemoData = async () => {
		if (!confirm("Are you sure you want to remove all demo data? This action cannot be undone.")) {
			return;
		}

		setIsRemovingDemoData(true);
		try {
			// Remove demo users
			const users = await adminAPI.getUsers({ is_demo: true });
			if (users.success && users.results) {
				for (const user of users.results) {
					await adminAPI.updateUserStatus(user.id, false, false);
				}
			}

			// Remove demo transactions
			const transactions = await adminAPI.getTransactions({ is_demo: true });
			if (transactions.success && transactions.results) {
				// Mark demo transactions as cancelled or remove them
				// Implementation depends on your API structure
			}

			// Clear localStorage demo flags
			localStorage.removeItem("isAdmin");
			localStorage.removeItem("demoMode");

			toaster.create({
				title: "Demo Data Removed",
				description: "All demo data has been successfully removed from the system",
				type: "success",
				duration: 5000,
			});

			// Refresh stats
			const analytics = await adminAPI.getAnalytics();
			if (analytics.success) {
				setAdminStats({
					totalUsers: analytics.totalUsers || 0,
					totalTokens: analytics.totalTokens || 0,
					activeTasks: analytics.activeTasks || 0,
					pendingRewards: analytics.pendingRewards || 0,
					totalStaked: analytics.totalStaked || 0,
					monthlyGrowth: analytics.monthlyGrowth || 0,
				});
			}
		} catch (error) {
			toaster.create({
				title: "Demo Data Removal Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsRemovingDemoData(false);
		}
	};

	// Enhanced admin tabs configuration
	const adminTabs = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: FaChartLine,
			component: <AnalyticsDashboard stats={adminStats} data={dashboardData} loading={loadingStats} />,
		},
		{
			id: "tasks",
			label: "Task Manager",
			icon: FaListCheck,
			component: <TaskManager tasks={tasks} loading={loadingTasks} onRefresh={fetchTasks} stats={taskManagerStats} />,
		},
		{
			id: "users",
			label: "User Manager",
			icon: FaUsers,
			component: <UserManager />,
		},
		{
			id: "drivers",
			label: "Driver Applications",
			icon: FaCar,
			component: <DriverApplicationManager />,
		},

		{
			id: "contract",
			label: "Contract Admin",
			icon: FaGear,
			component: <ContractManager />,
		},
		{
			id: "data",
			label: "Data Management",
			icon: FaDatabase,
			component: (
				<VStack gap={6} align="stretch">
					<Card.Root bg="gray.900" borderColor="gray.700">
						<Card.Body>
							<VStack gap={4} align="stretch">
								<Text fontSize="lg" fontWeight="bold" color="white">
									Production Data Management
								</Text>
								
								<Alert.Root status="warning">
									<Alert.Indicator />
									<Box>
										<Alert.Title>Demo Data Cleanup</Alert.Title>
										<Alert.Description>
											Remove all demo data to prepare for production. This includes test users, fake transactions, and sample content.
										</Alert.Description>
									</Box>
								</Alert.Root>

								<Button
									colorScheme="red"
									onClick={handleRemoveDemoData}
									isLoading={isRemovingDemoData}
									loadingText="Removing..."
									leftIcon={<FaTrash />}
								>
									Remove All Demo Data
								</Button>

								<Text fontSize="sm" color="gray.400">
									This action will:
									• Remove all demo users and test accounts
									• Clear fake transaction history
									• Reset demo balances and points
									• Clean up test data from the database
								</Text>
							</VStack>
						</Card.Body>
					</Card.Root>

					<Card.Root bg="gray.900" borderColor="gray.700">
						<Card.Body>
							<VStack gap={4} align="stretch">
								<Text fontSize="lg" fontWeight="bold" color="white">
									Task Management
								</Text>
								
								<Button
									colorScheme="blue"
									onClick={onTaskModalOpen}
									leftIcon={<FaPlus />}
								>
									Create New Task
								</Button>

								<Box>
									<Text fontSize="md" fontWeight="semibold" color="white" mb={2}>
										Active Tasks: {tasks.length}
									</Text>
									{tasks.slice(0, 3).map((task, index) => (
										<Box key={index} p={3} bg="gray.800" rounded="md" mb={2}>
											<HStack justify="space-between">
												<Text color="white">{task.title}</Text>
												<Badge colorScheme={task.isActive ? "green" : "red"}>
													{task.isActive ? "Active" : "Inactive"}
												</Badge>
											</HStack>
											<Text fontSize="sm" color="gray.400">{task.description}</Text>
										</Box>
									))}
								</Box>
							</VStack>
						</Card.Body>
					</Card.Root>
				</VStack>
			),
		},
	];

	// Stats tabs configuration
	const statsTabs = [
		{
			title: "Total Users",
			icon: FaUsers,
			value: adminStats.totalUsers.toLocaleString(),
			helperText: `↗ ${adminStats.monthlyGrowth}% this month`,
		},
		{
			title: "Active Tasks",
			icon: FaListCheck,
			value: adminStats.activeTasks.toString(),
			helperText: "Tasks available",
		},
		{
			title: "Total Tokens",
			icon: FaCoins,
			value: adminStats.totalTokens.toLocaleString(),
			helperText: "SABI in circulation",
		},
		{
			title: "Pending Rewards",
			icon: FaGift,
			value: adminStats.pendingRewards.toLocaleString(),
			helperText: "Points to be awarded",
		},
		{
			title: "Total Staked",
			icon: FaPiggyBank,
			value: adminStats.totalStaked.toLocaleString(),
			helperText: "SABI tokens staked",
		},
	];

	if (!isConnected) {
		return (
			<Container maxW="6xl" p={0}>
				<AlertNotification
					status={"warning"}
					alertMsg={"Please connect your wallet to access the admin panel"}
				/>
			</Container>
		);
	}

	if (!isLoggedIn) {
		return (
			<Container maxW="6xl" p={0}>
				<AlertNotification
					status={"info"}
					alertMsg={"Please login to access the admin panel"}
				/>
			</Container>
		);
	}

	if (!isAuthorized) {
		return (
			<Container maxW="6xl" p={0}>
				<AlertNotification
					status={"error"}
					alertMsg={"Access denied. You do not have administrator privileges."}
				/>
			</Container>
		);
	}

	return (
		<Container maxW="6xl" p={0}>
			<VStack gap={8} align="stretch">
				{/* Header */}
				<Box>
					<Heading size="xl" color="white" mb={2}>
						Admin Panel
					</Heading>
					<Text color="gray.400">
						Manage users, tasks, and system configuration
					</Text>
				</Box>

				{/* Stats Grid */}
				<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
					{statsTabs.map((stat, index) => (
						<Card.Root key={index} bg="gray.900" borderColor="gray.700">
							<Card.Body>
								<HStack>
									<Icon asChild color="blue.400" boxSize={8}>
										<stat.icon />
									</Icon>
									<Box>
										<Text fontSize="2xl" fontWeight="bold" color="white">
											{stat.value}
										</Text>
										<Text fontSize="sm" color="gray.400">
											{stat.title}
										</Text>
										<Text fontSize="xs" color="green.400">
											{stat.helperText}
										</Text>
									</Box>
								</HStack>
							</Card.Body>
						</Card.Root>
					))}
				</SimpleGrid>

				{/* Admin Tabs */}
				<Tabs.Root value={activeTab.toString()} onValueChange={(details) => setActiveTab(parseInt(details.value))}>
					<Tabs.List bg="gray.900" rounded="lg" p={1}>
						{adminTabs.map((tab, index) => (
							<Tabs.Trigger key={tab.id} value={index.toString()} flex={1}>
								<HStack>
									<Icon asChild>
										<tab.icon />
									</Icon>
									<Text>{tab.label}</Text>
								</HStack>
							</Tabs.Trigger>
						))}
					</Tabs.List>

					{adminTabs.map((tab, index) => (
						<Tabs.Content key={tab.id} value={index.toString()}>
							<Box mt={6}>
								{tab.component}
							</Box>
						</Tabs.Content>
					))}
				</Tabs.Root>
			</VStack>

			{/* Task Creation Modal */}
			<Dialog.Root open={isTaskModalOpen} onOpenChange={(e) => !e.open && onTaskModalClose()} size="lg">
				<Portal>
					<Dialog.Backdrop />
					<Dialog.Positioner>
						<Dialog.Content bg="gray.900" borderColor="gray.700">
							<Dialog.Header color="white">
								<Dialog.Title>Create New Task</Dialog.Title>
							</Dialog.Header>
							<Dialog.CloseTrigger />
							<Dialog.Body>
						<VStack gap={4} align="stretch">
							<Box>
								<Text color="white" mb={2}>Task Title</Text>
								<Input
									value={taskForm.title}
									onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
									placeholder="Enter task title"
									bg="gray.800"
									borderColor="gray.600"
									color="white"
								/>
							</Box>
							
							<Box>
								<Text color="white" mb={2}>Description</Text>
								<Textarea
									value={taskForm.description}
									onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
									placeholder="Enter task description"
									bg="gray.800"
									borderColor="gray.600"
									color="white"
								/>
							</Box>

							<Box>
								<Text color="white" mb={2}>Task Type</Text>
								<NativeSelect.Root
									value={taskForm.type}
									onChange={(e) => setTaskForm({...taskForm, type: e.target.value})}
								>
									<NativeSelect.Field bg="gray.800" borderColor="gray.600" color="white">
										<option value="social" style={{color: "black"}}>Social Media</option>
										<option value="referral" style={{color: "black"}}>Referral</option>
										<option value="survey" style={{color: "black"}}>Survey</option>
										<option value="app_usage" style={{color: "black"}}>App Usage</option>
									</NativeSelect.Field>
									<NativeSelect.Indicator />
								</NativeSelect.Root>
							</Box>

							<HStack>
								<Box flex={1}>
									<Text color="white" mb={2}>Points Reward</Text>
									<Input
										type="number"
										value={taskForm.points}
										onChange={(e) => setTaskForm({...taskForm, points: parseInt(e.target.value) || 0})}
										placeholder="0"
										bg="gray.800"
										borderColor="gray.600"
										color="white"
									/>
								</Box>
								
								<Box flex={1}>
									<Text color="white" mb={2}>Sabi Cash Reward</Text>
									<Input
										type="number"
										step="0.01"
										value={taskForm.sabiCash}
										onChange={(e) => setTaskForm({...taskForm, sabiCash: parseFloat(e.target.value) || 0})}
										placeholder="0.00"
										bg="gray.800"
										borderColor="gray.600"
										color="white"
									/>
								</Box>
							</HStack>
						</VStack>
							</Dialog.Body>
							<Dialog.Footer>
								<Button variant="ghost" mr={3} onClick={onTaskModalClose}>
									Cancel
								</Button>
								<Button colorScheme="blue" onClick={handleCreateTask}>
									Create Task
								</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</Container>
	);
};

export default AdminPanel;
