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
	Portal,
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
	FaUserShield,
	FaGift,
	FaChevronDown,
} from "react-icons/fa";
import { toaster } from "../../../../components/ui/toaster";
import UserDetailsModal from "./UserDetailsModal";
import SendRewardsModal from "./SendRewardsModal";

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

	// Mock user data
	useEffect(() => {
		const mockUsers = [
			{
				id: 1,
				email: "john.doe@example.com",
				walletAddress: "0x1234...5678",
				name: "John Doe",
				status: "active",
				userType: "premium",
				points: 1250,
				sabiEarned: 625,
				totalRides: 47,
				referrals: 3,
				tasksCompleted: 8,
				joinedDate: "2024-01-15",
				lastActive: "2024-01-20",
				isBlocked: false,
				avatar: null,
			},
			{
				id: 2,
				email: "jane.smith@example.com",
				walletAddress: "0xabcd...efgh",
				name: "Jane Smith",
				status: "active",
				userType: "regular",
				points: 890,
				sabiEarned: 445,
				totalRides: 23,
				referrals: 1,
				tasksCompleted: 5,
				joinedDate: "2024-01-10",
				lastActive: "2024-01-19",
				isBlocked: false,
				avatar: null,
			},
			{
				id: 3,
				email: "mike.wilson@example.com",
				walletAddress: "0x9876...4321",
				name: "Mike Wilson",
				status: "inactive",
				userType: "regular",
				points: 2100,
				sabiEarned: 1050,
				totalRides: 89,
				referrals: 7,
				tasksCompleted: 12,
				joinedDate: "2024-01-05",
				lastActive: "2024-01-10",
				isBlocked: true,
				avatar: null,
			},
		];

		setUsers(mockUsers);
		setFilteredUsers(mockUsers);
		setUserStats({
			totalUsers: mockUsers.length,
			activeUsers: mockUsers.filter((u) => u.status === "active").length,
			totalPoints: mockUsers.reduce((sum, user) => sum + user.points, 0),
			totalSabiEarned: mockUsers.reduce(
				(sum, user) => sum + user.sabiEarned,
				0
			),
		});
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

				case "promote":
					setUsers((prev) =>
						prev.map((u) =>
							u.id === user.id
								? {
										...u,
										userType:
											u.userType === "premium"
												? "regular"
												: "premium",
								  }
								: u
						)
					);
					toaster.create({
						title: "User Updated",
						description: `${user.name} is now a ${
							user.userType === "premium" ? "regular" : "premium"
						} user`,
						type: "success",
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
			setUsers((prev) =>
				prev.map((u) =>
					u.id === selectedUser.id
						? {
								...u,
								sabiEarned: u.sabiEarned + rewardForm.amount,
								points:
									rewardForm.type === "points"
										? u.points + rewardForm.amount
										: u.points,
						  }
						: u
				)
			);

			toaster.create({
				title: "Reward Sent",
				description: `${rewardForm.amount} ${
					rewardForm.type === "points" ? "points" : "SABI"
				} awarded to ${selectedUser.name}`,
				type: "success",
				duration: 3000,
			});

			setRewardForm({ amount: 0, reason: "", type: "bonus" });
			setOpenSendRewardsModal(false);
		} catch (error) {
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
			case "premium":
				return "purple";
			case "regular":
				return "blue";
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
									<option value="regular">Regular</option>
									<option value="premium">Premium</option>
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
								{filteredUsers.map((user) => (
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
															{/* User Details Modal */}
															<UserDetailsModal
																getStatusColor={getStatusColor}
																getUserTypeColor={
																	getUserTypeColor
																}
																selectedUser={selectedUser}
															>
																<Menu.Item
																	value="view details"
																	onClick={() => {
																		setSelectedUser(user);
																	}}
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

															{/* Send Rewards Modal */}
															<SendRewardsModal
																handleRewardUser={
																	handleRewardUser
																}
																rewardForm={rewardForm}
																selectedUser={selectedUser}
																setRewardForm={setRewardForm}
																openSendRewardsModal={
																	openSendRewardsModal
																}
																setOpenSendRewardsModal={
																	setOpenSendRewardsModal
																}
															>
																<Menu.Item
																	value="send reward"
																	onClick={() =>
																		handleUserAction(
																			"reward",
																			user
																		)
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
																value="promote or demote"
																onClick={() =>
																	handleUserAction(
																		"promote",
																		user
																	)
																}
															>
																<FaUserShield />{" "}
																{user.userType === "premium"
																	? "Demote to Regular"
																	: "Promote to Premium"}
															</Menu.Item>
															<Menu.Item
																value="block or unblock"
																onClick={() =>
																	handleUserAction(
																		"block",
																		user
																	)
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
								))}
							</Table.Body>
						</Table.Root>
					</Table.ScrollArea>
				</Card.Body>
			</Card.Root>
		</VStack>
	);
};

export default UserManager;
