import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Card,
	VStack,
	HStack,
	Text,
	Input,
	Badge,
	Icon,
	Heading,
	SimpleGrid,
	Stat,
	InputGroup,
	Avatar,
	Center,
	Portal,
	Spinner,
	Table,
	Dialog,
	Menu,
	NativeSelect,
} from "@chakra-ui/react";
import {
	FaSearch,
	FaDownload,
	FaEye,
	FaBan,
	FaGift,
	FaChevronDown,
} from "react-icons/fa";
import { toaster } from "../../../../components/ui/toaster";
import UserDetailsModal from "./UserDetailsModal";
import SendRewardsModal from "./SendRewardsModal";
import { adminAPI } from "../../../../config/apiConfig";

const UserManager = () => {
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [filterType, setFilterType] = useState("all");
	const [isLoading, setIsLoading] = useState(false);
	const [userStats, setUserStats] = useState({
		totalUsers: 0,
		activeUsers: 0,
		totalPoints: 0,
		totalSabiEarned: 0,
	});

	// Rewards modal props
	const [openSendRewardsModal, setOpenSendRewardsModal] = useState(false);
	// const cancelRef = React.useRef();

	// Reward form state
	const [rewardForm, setRewardForm] = useState({
		amount: 0,
		reason: "",
		type: "bonus",
	});

	// Fetch users from API
	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const response = await adminAPI.getUsers();
			if (response.success) {
				const mappedUsers = response.results.map((user) => ({
					id: user.id,
					email: user.email,
					walletAddress: user.wallet_address || "N/A",
					name: user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",
					status: user.is_active ? "active" : "inactive",
					userType: user.user_type,
					points: parseInt(user.total_points) || 0,
					sabiEarned: parseFloat(user.sabi_cash_balance) || 0,
					totalRides: 0, // Not available in list view
					referrals: 0, // Not available in list view
					tasksCompleted: 0, // Not available in list view
					joinedDate: new Date(user.created_at).toLocaleDateString(),
					lastActive: user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never",
					isBlocked: !user.is_active,
					avatar: null,
				}));

				setUsers(mappedUsers);
				setFilteredUsers(mappedUsers);
				
				// Update stats
				setUserStats({
					totalUsers: response.count || mappedUsers.length,
					activeUsers: mappedUsers.filter((u) => u.status === "active").length,
					totalPoints: mappedUsers.reduce((sum, user) => sum + user.points, 0),
					totalSabiEarned: mappedUsers.reduce((sum, user) => sum + user.sabiEarned, 0),
				});
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			toaster.create({
				title: "Error",
				description: "Failed to fetch users",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	// Filter users based on search and filters
	useEffect(() => {
		let filtered = users;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(user) =>
					user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.walletAddress
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			);
		}

		// Status filter
		if (filterStatus !== "all") {
			filtered = filtered.filter((user) => user.status === filterStatus);
		}

		// Type filter
		if (filterType !== "all") {
			filtered = filtered.filter((user) => user.userType === filterType);
		}

		setFilteredUsers(filtered);
	}, [users, searchTerm, filterStatus, filterType]);

	const handleUserAction = async (action, user) => {
		setSelectedUser(user);

		try {
			switch (action) {
				case "block":
					// API Call: Toggle active status
					// If currently blocked (inactive), set to active (true)
					// If currently active (not blocked), set to inactive (false)
					await adminAPI.updateUserStatus(user.id, user.isBlocked);
					
					setUsers((prev) =>
						prev.map((u) =>
							u.id === user.id
								? {
										...u,
										isBlocked: !u.isBlocked,
										status: u.isBlocked ? "active" : "inactive",
								  }
								: u
						)
					);
					toaster.create({
						title: `User ${user.isBlocked ? "Unblocked" : "Blocked"}`,
						description: `${user.name} has been ${
							user.isBlocked ? "unblocked" : "blocked"
						} successfully`,
						type: user.isBlocked ? "success" : "warning",
						duration: 3000,
					});
					break;

				case "reward":
					setOpenSendRewardsModal(true);
					break;

				default:
					break;
			}
		} catch (error) {
			console.error("User action error:", error);
			toaster.create({
				title: "Error",
				description: "Failed to perform action. Please try again.",
				type: "error",
				duration: 3000,
			});
		}
	};

	const handleRewardUser = async () => {
		if (!selectedUser || !rewardForm.amount || !rewardForm.reason) return;

		try {
			const type = rewardForm.type === "bonus" ? "sabi_cash" : "points";
			await adminAPI.sendReward(selectedUser.id, rewardForm.amount, type, rewardForm.reason);

			setUsers((prev) =>
				prev.map((u) =>
					u.id === selectedUser.id
						? {
								...u,
								sabiEarned: type === "sabi_cash" ? u.sabiEarned + rewardForm.amount : u.sabiEarned,
								points: type === "points" ? u.points + rewardForm.amount : u.points,
						  }
						: u
				)
			);

			toaster.create({
				title: "Reward Sent",
				description: `${rewardForm.amount} ${
					type === "points" ? "points" : "SABI"
				} awarded to ${selectedUser.name}`,
				type: "success",
				duration: 3000,
			});

			setRewardForm({ amount: 0, reason: "", type: "bonus" });
			setOpenSendRewardsModal(false);
		} catch (error) {
			console.error("Reward error:", error);
			toaster.create({
				title: "Error",
				description: "Failed to send reward. Please try again.",
				type: "error",
				duration: 3000,
			});
		}
	};

	const exportUsers = () => {
		// Convert users data to CSV
		const csvData = [
			[
				"Name",
				"Email",
				"Wallet Address",
				"Status",
				"Type",
				"Points",
				"SABI Earned",
				"Total Rides",
				"Joined Date",
			],
			...filteredUsers.map((user) => [
				user.name,
				user.email,
				user.walletAddress,
				user.status,
				user.userType,
				user.points,
				user.sabiEarned,
				user.totalRides,
				user.joinedDate,
			]),
		];

		const csvContent = csvData.map((row) => row.join(",")).join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "sabi_ride_users.csv";
		link.click();
		window.URL.revokeObjectURL(url);

		toaster.create({
			title: "Export Complete",
			description: "User data has been exported successfully",
			type: "success",
			duration: 3000,
		});
	};

	const handleViewUser = async (user) => {
		setSelectedUser(user);
		try {
			const response = await adminAPI.getUserDetails(user.id);
			if (!response.success) return;
			const details = response.user;
			const statistics = response.statistics;

			setSelectedUser((prev) => ({
				...prev,
				email: details.email ?? prev.email,
				name:
					details.username ||
					`${details.first_name || ""} ${details.last_name || ""}`.trim() ||
					prev.name,
				walletAddress: details.wallet_address || prev.walletAddress,
				status: details.is_active ? "active" : "inactive",
				userType: details.user_type || prev.userType,
				points: Number(details.total_points ?? prev.points) || 0,
				sabiEarned: Number(details.sabi_cash_balance ?? prev.sabiEarned) || 0,
				joinedDate: details.created_at
					? new Date(details.created_at).toLocaleDateString()
					: prev.joinedDate,
				lastActive: details.last_login
					? new Date(details.last_login).toLocaleDateString()
					: prev.lastActive,
				isBlocked: !details.is_active,
				tasksCompleted: Number(statistics?.total_task_completions ?? prev.tasksCompleted) || 0,
			}));
		} catch (error) {
			console.error("Error fetching user details:", error);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "green";
			case "inactive":
				return "red";
			default:
				return "gray";
		}
	};

	const getUserTypeColor = (userType) => {
		switch (userType) {
			case "admin":
				return "purple";
			case "driver":
				return "blue";
			case "passenger":
				return "green";
			default:
				return "gray";
		}
	};

	return (
		<VStack gap={6} align="stretch">
			{/* User Statistics */}
			<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Total Users</Stat.Label>
							<Stat.ValueText>{userStats.totalUsers}</Stat.ValueText>
							<Stat.HelpText>All registered users</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Active Users</Stat.Label>
							<Stat.ValueText>{userStats.activeUsers}</Stat.ValueText>
							<Stat.HelpText>Currently active</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Total Points</Stat.Label>
							<Stat.ValueText>
								{userStats.totalPoints.toLocaleString()}
							</Stat.ValueText>
							<Stat.HelpText>All user points</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>SABI Earned</Stat.Label>
							<Stat.ValueText>
								{userStats.totalSabiEarned.toLocaleString()}
							</Stat.ValueText>
							<Stat.HelpText>Total distributed</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>

			{/* Header with Search and Filters */}
			<Card.Root>
				<Card.Body>
					<VStack gap={4}>
						<HStack justify="space-between" w="full" mb={3}>
							<Heading size="md">User Management</Heading>
							<Button colorPalette="green" onClick={exportUsers}>
								<FaDownload /> Export Data
							</Button>
						</HStack>

						<HStack gap={4} w="full">
							<InputGroup
								flex={2}
								startElement={<Icon as={FaSearch} color="gray.400" />}
							>
								<Input
									placeholder="Search by name, email, or wallet address..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</InputGroup>

							<NativeSelect.Root
								placeholder="Filter by Status"
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								maxW="200px"
							>
								<NativeSelect.Field>
									<option value="all">All Status</option>
									<option value="active">Active</option>
									<option value="inactive">Inactive</option>
								</NativeSelect.Field>
								<NativeSelect.Indicator />
							</NativeSelect.Root>

							<NativeSelect.Root
								placeholder="Filter by Type"
								value={filterType}
								onChange={(e) => setFilterType(e.target.value)}
								maxW="150px"
							>
								<NativeSelect.Field>
									<option value="all">All Types</option>
									<option value="passenger">Passenger</option>
									<option value="driver">Driver</option>
									<option value="admin">Admin</option>
								</NativeSelect.Field>
								<NativeSelect.Indicator />
							</NativeSelect.Root>
						</HStack>
					</VStack>
				</Card.Body>
			</Card.Root>

			{/* Users Table */}
			<Card.Root>
				<Card.Body>
					<Table.ScrollArea maxH={`400px`}>
						<Table.Root size={`md`} stickyHeader>
							<Table.Header>
								<Table.Row
									fontSize={15}
									bg={`bg.muted`}
									fontWeight={`bold`}
								>
									<Table.ColumnHeader>User</Table.ColumnHeader>
									<Table.ColumnHeader>Wallet</Table.ColumnHeader>
									<Table.ColumnHeader>Status</Table.ColumnHeader>
									<Table.ColumnHeader>Type</Table.ColumnHeader>
									<Table.ColumnHeader>Points</Table.ColumnHeader>
									<Table.ColumnHeader>SABI Earned</Table.ColumnHeader>
									<Table.ColumnHeader>Rides</Table.ColumnHeader>
									<Table.ColumnHeader>Actions</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{isLoading ? (
									<Table.Row>
										<Table.Cell colSpan={8}>
											<Center py={8}>
												<Spinner />
											</Center>
										</Table.Cell>
									</Table.Row>
								) : (
									filteredUsers.map((user) => (
										<Table.Row key={user.id}>
											<Table.Cell>
												<HStack>
													<Avatar.Root size={`sm`}>
														<Avatar.Fallback name={user.name} />
														<Avatar.Image src={user.avatar} />
													</Avatar.Root>
													<Box>
														<Text fontWeight="bold">
															{user.name}
														</Text>
														<Text fontSize="sm" color="gray.600">
															{user.email}
														</Text>
													</Box>
												</HStack>
											</Table.Cell>
											<Table.Cell>
												<Text fontSize="sm" fontFamily="mono">
													{user.walletAddress}
												</Text>
											</Table.Cell>
											<Table.Cell>
												<Badge
													colorPalette={getStatusColor(user.status)}
												>
													{user.status}
												</Badge>
											</Table.Cell>
											<Table.Cell>
												<Badge
													colorPalette={getUserTypeColor(
														user.userType
													)}
												>
													{user.userType}
												</Badge>
											</Table.Cell>
											<Table.Cell>
												{user.points.toLocaleString()}
											</Table.Cell>
											<Table.Cell>
												{user.sabiEarned.toLocaleString()}
											</Table.Cell>
											<Table.Cell>{user.totalRides}</Table.Cell>
											<Table.Cell>
												<Menu.Root closeOnSelect={false}>
													<Menu.Trigger asChild>
														<Button size="sm">
															Actions <FaChevronDown />
														</Button>
													</Menu.Trigger>
													<Portal>
														<Menu.Positioner>
															<Menu.Content>
																<UserDetailsModal
																	getStatusColor={getStatusColor}
																	getUserTypeColor={getUserTypeColor}
																	selectedUser={selectedUser}
																>
																	<Menu.Item
																		value="view details"
																		onClick={() => handleViewUser(user)}
																	>
																		<Dialog.Trigger
																			display={`flex`}
																			alignItems={`center`}
																			gap={2}
																		>
																			<FaEye /> View Details
																		</Dialog.Trigger>
																	</Menu.Item>
																</UserDetailsModal>

																<SendRewardsModal
																	handleRewardUser={handleRewardUser}
																	rewardForm={rewardForm}
																	selectedUser={selectedUser}
																	setRewardForm={setRewardForm}
																	openSendRewardsModal={openSendRewardsModal}
																	setOpenSendRewardsModal={setOpenSendRewardsModal}
																>
																	<Menu.Item
																		value="send reward"
																		onClick={() =>
																			handleUserAction("reward", user)
																		}
																	>
																		<Dialog.Trigger
																			display={`flex`}
																			alignItems={`center`}
																			gap={2}
																		>
																			<FaGift /> Send Reward
																		</Dialog.Trigger>
																	</Menu.Item>
																</SendRewardsModal>

																<Menu.Item
																	value="block or unblock"
																	onClick={() =>
																		handleUserAction("block", user)
																	}
																	color={
																		user.isBlocked
																			? "green.500"
																			: "red.500"
																	}
																>
																	<FaBan />{" "}
																	{user.isBlocked
																		? "Unblock User"
																		: "Block User"}
																</Menu.Item>
															</Menu.Content>
														</Menu.Positioner>
													</Portal>
												</Menu.Root>
											</Table.Cell>
										</Table.Row>
									))
								)}
							</Table.Body>
						</Table.Root>
					</Table.ScrollArea>
				</Card.Body>
			</Card.Root>
		</VStack>
	);
};

export default UserManager;
