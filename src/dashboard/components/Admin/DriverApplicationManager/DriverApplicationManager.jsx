import React, { useEffect, useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Card,
	Center,
	HStack,
	Heading,
	Icon,
	Input,
	InputGroup,
	SimpleGrid,
	Spinner,
	Stat,
	Table,
	Text,
	VStack,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { toaster } from "../../../../components/ui/toaster";
import { adminAPI } from "../../../../config/apiConfig";

const DriverApplicationManager = () => {
	const [drivers, setDrivers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const fetchDrivers = async () => {
		setIsLoading(true);
		try {
			const response = await adminAPI.getUsers({ user_type: "driver" });
			if (response.success) {
				const mappedDrivers = (response.results || []).map((user) => ({
					id: user.id,
					email: user.email,
					name:
						user.username ||
						`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
						"Unknown",
					isActive: !!user.is_active,
					isVerified: !!user.is_verified,
					driverStatus: user.driver_status || "N/A",
					joinedDate: user.created_at
						? new Date(user.created_at).toLocaleDateString()
						: "N/A",
					lastActive: user.last_login
						? new Date(user.last_login).toLocaleDateString()
						: "Never",
				}));
				setDrivers(mappedDrivers);
			}
		} catch (error) {
			console.error("Error fetching drivers:", error);
			toaster.create({
				title: "Error",
				description: "Failed to fetch drivers",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDrivers();
	}, []);

	const filteredDrivers = useMemo(() => {
		if (!searchTerm) return drivers;
		const q = searchTerm.toLowerCase();
		return drivers.filter(
			(d) => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
		);
	}, [drivers, searchTerm]);

	const stats = useMemo(() => {
		return {
			total: drivers.length,
			active: drivers.filter((d) => d.isActive).length,
			verified: drivers.filter((d) => d.isVerified).length,
			pending: drivers.filter((d) => !d.isVerified).length,
		};
	}, [drivers]);

	const getActiveColor = (isActive) => (isActive ? "green" : "red");
	const getVerifiedColor = (isVerified) => (isVerified ? "green" : "orange");

	const handleToggleVerified = async (driver) => {
		try {
			const nextVerified = !driver.isVerified;
			await adminAPI.updateUserStatus(driver.id, undefined, nextVerified, undefined);
			setDrivers((prev) =>
				prev.map((d) => (d.id === driver.id ? { ...d, isVerified: nextVerified } : d))
			);
			toaster.create({
				title: "Driver Updated",
				description: `${driver.name} is now ${nextVerified ? "verified" : "unverified"}`,
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("Verify toggle error:", error);
			toaster.create({
				title: "Error",
				description: "Failed to update driver verification",
				type: "error",
				duration: 3000,
			});
		}
	};

	const handleToggleActive = async (driver) => {
		try {
			const nextActive = !driver.isActive;
			await adminAPI.updateUserStatus(driver.id, nextActive, undefined, undefined);
			setDrivers((prev) =>
				prev.map((d) => (d.id === driver.id ? { ...d, isActive: nextActive } : d))
			);
			toaster.create({
				title: "Driver Updated",
				description: `${driver.name} has been ${nextActive ? "unblocked" : "blocked"}`,
				type: nextActive ? "success" : "warning",
				duration: 3000,
			});
		} catch (error) {
			console.error("Active toggle error:", error);
			toaster.create({
				title: "Error",
				description: "Failed to update driver status",
				type: "error",
				duration: 3000,
			});
		}
	};

	return (
		<VStack gap={6} align="stretch">
			<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Total Drivers</Stat.Label>
							<Stat.ValueText>{stats.total}</Stat.ValueText>
							<Stat.HelpText>All driver accounts</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Active Drivers</Stat.Label>
							<Stat.ValueText>{stats.active}</Stat.ValueText>
							<Stat.HelpText>Not blocked</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Verified</Stat.Label>
							<Stat.ValueText>{stats.verified}</Stat.ValueText>
							<Stat.HelpText>Approved drivers</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Pending</Stat.Label>
							<Stat.ValueText>{stats.pending}</Stat.ValueText>
							<Stat.HelpText>Needs verification</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>

			<Card.Root>
				<Card.Body>
					<VStack gap={4} align="stretch">
						<HStack justify="space-between" w="full">
							<Heading size="md">Driver Applications</Heading>
							<Button onClick={fetchDrivers} isLoading={isLoading}>
								Refresh
							</Button>
						</HStack>

						<InputGroup
							startElement={<Icon as={FaSearch} color="gray.400" />}
						>
							<Input
								placeholder="Search drivers by name or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</InputGroup>
					</VStack>
				</Card.Body>
			</Card.Root>

			<Card.Root>
				<Card.Body>
					{isLoading ? (
						<Center py={10}>
							<Spinner />
						</Center>
					) : (
						<Table.ScrollArea maxH="450px">
							<Table.Root size="md" stickyHeader>
								<Table.Header>
									<Table.Row bg="bg.muted" fontWeight="bold">
										<Table.ColumnHeader>Driver</Table.ColumnHeader>
										<Table.ColumnHeader>Status</Table.ColumnHeader>
										<Table.ColumnHeader>Verified</Table.ColumnHeader>
										<Table.ColumnHeader>Driver Status</Table.ColumnHeader>
										<Table.ColumnHeader>Joined</Table.ColumnHeader>
										<Table.ColumnHeader>Last Active</Table.ColumnHeader>
										<Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{filteredDrivers.length === 0 ? (
										<Table.Row>
											<Table.Cell colSpan={7}>
												<Center py={8}>
													<Text color="gray.500">No drivers found</Text>
												</Center>
											</Table.Cell>
										</Table.Row>
									) : (
										filteredDrivers.map((driver) => (
											<Table.Row key={driver.id}>
												<Table.Cell>
													<Box>
														<Text fontWeight="bold">{driver.name}</Text>
														<Text fontSize="sm" color="gray.600">
															{driver.email}
														</Text>
													</Box>
												</Table.Cell>
												<Table.Cell>
													<Badge colorPalette={getActiveColor(driver.isActive)}>
														{driver.isActive ? "active" : "inactive"}
													</Badge>
												</Table.Cell>
												<Table.Cell>
													<Badge colorPalette={getVerifiedColor(driver.isVerified)}>
														{driver.isVerified ? "verified" : "pending"}
													</Badge>
												</Table.Cell>
												<Table.Cell>
													<Text>{driver.driverStatus}</Text>
												</Table.Cell>
												<Table.Cell>{driver.joinedDate}</Table.Cell>
												<Table.Cell>{driver.lastActive}</Table.Cell>
												<Table.Cell textAlign="end">
													<HStack justify="flex-end">
														<Button
															size="sm"
															colorPalette={driver.isVerified ? "orange" : "green"}
															onClick={() => handleToggleVerified(driver)}
														>
															{driver.isVerified ? "Unverify" : "Verify"}
														</Button>
														<Button
															size="sm"
															colorPalette={driver.isActive ? "red" : "green"}
															onClick={() => handleToggleActive(driver)}
														>
															{driver.isActive ? "Block" : "Unblock"}
														</Button>
													</HStack>
												</Table.Cell>
											</Table.Row>
										))
									)}
								</Table.Body>
							</Table.Root>
						</Table.ScrollArea>
					)}
				</Card.Body>
			</Card.Root>
		</VStack>
	);
};

export default DriverApplicationManager;

