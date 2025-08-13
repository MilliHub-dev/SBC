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
	SimpleGrid,
	Tabs,
	Badge,
	Icon,
	Stat,
	TabsTrigger,
	Alert,
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
} from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import TaskManager from "../../components/Admin/TaskManager/TaskManager";
import UserManager from "../../components/Admin/UserManager/UserManager";
import ContractManager from "../../components/Admin/ContractManager/ContractManager";
import AnalyticsDashboard from "../../components/Admin/AnalyticsDashboard";
import MiningPlanManager from "../../components/Admin/MiningPlanManager/MiningPlanManager";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { LuChartBar, LuPickaxe } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";

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
	});

	// Check if user is admin
	useEffect(() => {
		const checkAdminStatus = async () => {
			if (!isConnected || !address) return;

			// TODO: Implement actual admin check
			// For now, we'll use a mock check
			const adminAddresses = [
				// Add admin wallet addresses here
				"0x...", // Replace with actual admin addresses
			];

			const isAdmin =
				adminAddresses.includes(address.toLowerCase()) ||
				localStorage.getItem("isAdmin") === "true"; // For demo purposes

			setIsAuthorized(isAdmin);

			if (!isAdmin) {
				toaster.create({
					title: "Access Denied",
					description: "You do not have administrator privileges",
					type: "error",
					duration: 5000,
				});
			}
		};

		checkAdminStatus();
	}, [isConnected, address]);

	// Fetch admin statistics
	useEffect(() => {
		const fetchAdminStats = async () => {
			if (!isAuthorized) return;

			try {
				// TODO: Replace with actual API calls
				setAdminStats({
					totalUsers: 1250,
					totalTokens: 500000,
					activeTasks: 12,
					pendingRewards: 15000,
					totalStaked: 250000,
					monthlyGrowth: 15.8,
				});
			} catch (error) {
				console.error("Error fetching admin stats:", error);
			}
		};

		fetchAdminStats();
	}, [isAuthorized]);

	// Admin tabs configuration
	const adminTabs = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: FaChartLine,
			component: <AnalyticsDashboard stats={adminStats} />,
		},
		{
			id: "tasks",
			label: "Task Manager",
			icon: FaListCheck,
			component: <TaskManager />,
		},
		{
			id: "users",
			label: "User Manager",
			icon: FaUsers,
			component: <UserManager />,
		},
		{
			id: "mining",
			label: "Mining Plans",
			icon: FaCoins,
			component: <MiningPlanManager />,
		},
		{
			id: "contract",
			label: "Contract Admin",
			icon: FaGear,
			component: <ContractManager />,
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
			title: "Total SABI",
			icon: FaCoins,
			value: adminStats.totalTokens.toLocaleString(),
			helperText: "In circulation",
		},
		{
			title: "Active Tasks",
			icon: FaCheckCircle,
			value: adminStats.activeTasks,
			helperText: "Currently available",
		},
		{
			title: "Pending Rewards",
			icon: FaGift,
			value: adminStats.pendingRewards.toLocaleString(),
			helperText: "SABI to be claimed",
		},
		{
			title: "Total Staked",
			icon: FaPiggyBank,
			value: adminStats.totalStaked.toLocaleString(),
			helperText: "SABI in mining plans",
		},
		{
			title: "Growth Rate",
			icon: LuChartBar,
			value: `${adminStats.monthlyGrowth}%`,
			helperText: "Monthly increase",
		},
	];

	if (!isConnected) {
		return (
			<Container maxW="6xl" py={8}>
				<AlertNotification
					status={"warning"}
					alertMsg={"	Please connect your wallet to access the admin panel"}
				/>
			</Container>
		);
	}

	if (!isAuthorized) {
		return (
			<Container maxW="lg" py={8}>
				<Alert.Root status="error">
					<Alert.Indicator />
					<Alert.Content>
						<Alert.Title fontWeight="600" fontSize={`lg`}>
							Access Denied
						</Alert.Title>

						<Text>
							You do not have administrator privileges for this panel.
						</Text>
						<Text fontSize="sm" mt={2} color="red.600">
							Connected wallet: {address?.slice(0, 6)}...
							{address?.slice(-4)}
						</Text>
						<Button
							mt={3}
							bg="#cd1800ff"
							color="white"
							w="full"
							py={6}
							rounded={"md"}
							onClick={() => {
								localStorage.setItem("isAdmin", "true");
								setIsAuthorized(true);
							}}
						>
							Enable Demo Mode
						</Button>
					</Alert.Content>
				</Alert.Root>
			</Container>
		);
	}

	return (
		<Container maxW={"6xl"} p={0}>
			<VStack gap={6} alignItems="stretch">
				{/* Header */}
				<Box>
					<HStack justify="space-between" align="center">
						<Box>
							<Heading
								as={"h1"}
								display={"flex"}
								justifyContent={"start"}
								fontSize={"28px"}
								fontWeight={600}
								gap={3}
								mb={4}
							>
								<Icon as={FaDatabase} mr={3} color="#0088CD" />
								Admin Panel
							</Heading>
							<Text color="gray.500" fontSize={16}>
								Manage Sabi Cash ecosystem and user rewards
							</Text>
						</Box>
						<Badge
							colorPalette="gray"
							variant={"solid"}
							fontSize="md"
							p={3}
						>
							Administrator
						</Badge>
					</HStack>
				</Box>

				{/* Quick Stats */}
				<SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={2}>
					{statsTabs.map((stat, index) => {
						const IconComponent = stat.icon;
						return (
							<Card.Root rounded={"md"} key={index} border={0}>
								<Card.Body rounded={"md"} p={"25px 20px"}>
									<Stat.Root display={"grid"}>
										<Stat.Label
											display={"flex"}
											justifyContent={"space-between"}
											alignItems={"center"}
										>
											{stat.title} <IconComponent size={15} />{" "}
										</Stat.Label>
										<Stat.ValueText fontWeight={800}>
											{stat.value}
										</Stat.ValueText>
										<Stat.HelpText>{stat.helperText}</Stat.HelpText>
									</Stat.Root>
								</Card.Body>
							</Card.Root>
						);
					})}
				</SimpleGrid>

				{/* Admin Navigation */}
				<Card.Root>
					<Card.Body>
						<Tabs.Root
							outline={`none`}
							value={activeTab.toString()}
							onValueChange={(details) =>
								setActiveTab(parseInt(details.value))
							}
						>
							<Tabs.List>
								{adminTabs.map((tab, index) => (
									<TabsTrigger
										key={tab.id}
										w={"full"}
										value={index.toString()}
										display={"flex"}
										justifyContent={"space-between"}
										alignItems={"center"}
									>
										<HStack justifyContent={"center"} w={"full"}>
											<Icon as={tab.icon} />
											<Text display={{ base: "none", md: "block" }}>
												{tab.label}
											</Text>
										</HStack>
									</TabsTrigger>
								))}
								<Tabs.Indicator rounded="sm" />
							</Tabs.List>

							{adminTabs.map((tab, index) => (
								<Tabs.Content
									key={tab.id}
									value={index.toString()}
									outline={`none`}
								>
									<Box mt={6}>{tab.component}</Box>
								</Tabs.Content>
							))}
						</Tabs.Root>
					</Card.Body>
				</Card.Root>

				{/* Quick Actions */}
				<Card.Root>
					<Card.Body>
						<Heading fontWeight={600} size="lg" mb={4}>
							Quick Actions
						</Heading>
						<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
							<Button
								colorPalette="blue"
								fontSize={{ base: 14, md: `initial` }}
								onClick={() => setActiveTab(1)} // Switch to Task Manager
							>
								<FaPlus /> Add New Task
							</Button>

							<Button
								colorPalette="green"
								fontSize={{ base: 14, md: `initial` }}
								onClick={() => setActiveTab(2)} // Switch to User Manager
							>
								<FaUsers /> Manage Users
							</Button>

							<Button
								colorPalette="orange"
								fontSize={{ base: 14, md: `initial` }}
								onClick={() => setActiveTab(4)} // Switch to Contract Manager
							>
								<FaGear /> Contract Settings
							</Button>

							<Button
								colorPalette="purple"
								fontSize={{ base: 14, md: `initial` }}
								onClick={() => setActiveTab(0)} // Switch to Analytics
							>
								<FaChartLine /> View Analytics
							</Button>
						</SimpleGrid>
					</Card.Body>
				</Card.Root>

				{/* System Status */}
				<Card.Root>
					<Card.Body>
						<Heading fontWeight={600} size="lg" mb={4}>
							System Status
						</Heading>
						<VStack gap={3} align="stretch">
							<SystemStatus
								title={`Smart Contract Status`}
								status={`Active`}
								statusColor={`green`}
							/>
							<SystemStatus
								title={`API Backend Status`}
								status={`Online`}
								statusColor={`green`}
							/>
							<SystemStatus
								title={`Polygon zkEVM Network`}
								status={`Connected`}
								statusColor={`green`}
							/>
							<SystemStatus
								title={`Task Verification Service`}
								status={`Maintenance`}
								statusColor={`orange`}
							/>
						</VStack>
					</Card.Body>
				</Card.Root>
			</VStack>
		</Container>
	);
};

const SystemStatus = ({ title, status, statusColor }) => {
	return (
		<HStack
			justify="space-between"
			alignItems={"center"}
			borderBottom={"1px solid"}
			borderColor={"gray.200"}
			p={"10px 0"}
		>
			<Text>{title}</Text>
			<Badge variant={"solid"} colorPalette={statusColor}>
				{status}
			</Badge>
		</HStack>
	);
};

export default AdminPanel;
