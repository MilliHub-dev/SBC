import React from "react";
import {
	Box,
	Button,
	Card,
	VStack,
	HStack,
	Text,
	Badge,
	SimpleGrid,
	Stat,
	Avatar,
	Portal,
	Dialog,
} from "@chakra-ui/react";
import { CgClose } from "react-icons/cg";

const UserDetailsModal = ({
	children,
	selectedUser,
	getStatusColor,
	getUserTypeColor,
}) => {
	return (
		<Dialog.Root>
			{children}
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4} color={`#000`}>
						<Dialog.Header fontSize={`lg`}>User Details</Dialog.Header>
						<Dialog.CloseTrigger>
							<Button variant="subtle" flex={1} size={`xs`}>
								<CgClose />
							</Button>
						</Dialog.CloseTrigger>
						<Dialog.Body pb={6}>
							{selectedUser && (
								<VStack gap={4} align="stretch">
									<HStack gap={4}>
										<Avatar.Root size="lg">
											<Avatar.Fallback name={selectedUser.name} />
											<Avatar.Image src={selectedUser.avatar} />
										</Avatar.Root>
										<Box flex={1}>
											<Text fontSize="xl" fontWeight="bold">
												{selectedUser.name}
											</Text>
											<Text color="gray.600">
												{selectedUser.email}
											</Text>
											<HStack mt={2}>
												<Badge
													colorPalette={getStatusColor(
														selectedUser.status
													)}
												>
													{selectedUser.status}
												</Badge>
												<Badge
													colorPalette={getUserTypeColor(
														selectedUser.userType
													)}
												>
													{selectedUser.userType}
												</Badge>
											</HStack>
										</Box>
									</HStack>
									<SimpleGrid columns={2} gap={4}>
										<Card.Root>
											<Card.Body>
												<Stat.Root>
													<Stat.Label>Points Balance</Stat.Label>
													<Stat.ValueText>
														{selectedUser.points.toLocaleString()}
													</Stat.ValueText>
												</Stat.Root>
											</Card.Body>
										</Card.Root>
										<Card.Root>
											<Card.Body>
												<Stat.Root>
													<Stat.Label>SABI Earned</Stat.Label>
													<Stat.ValueText>
														{selectedUser.sabiEarned.toLocaleString()}
													</Stat.ValueText>
												</Stat.Root>
											</Card.Body>
										</Card.Root>
										<Card.Root>
											<Card.Body>
												<Stat.Root>
													<Stat.Label>Total Rides</Stat.Label>
													<Stat.ValueText>
														{selectedUser.totalRides}
													</Stat.ValueText>
												</Stat.Root>
											</Card.Body>
										</Card.Root>
										<Card.Root>
											<Card.Body>
												<Stat.Root>
													<Stat.Label>Referrals</Stat.Label>
													<Stat.ValueText>
														{selectedUser.referrals}
													</Stat.ValueText>
												</Stat.Root>
											</Card.Body>
										</Card.Root>
									</SimpleGrid>

									<Box>
										<Text fontWeight="600" fontSize={`md`} mb={2}>
											Account Information
										</Text>
										<VStack gap={2} align="stretch">
											<HStack justify="space-between">
												<Text>Wallet Address:</Text>
												<Text fontFamily="mono" color={`gray.700`}>
													{selectedUser.walletAddress}
												</Text>
											</HStack>
											<HStack justify="space-between">
												<Text>Joined Date:</Text>
												<Text color={`gray.700`}>
													{selectedUser.joinedDate}
												</Text>
											</HStack>
											<HStack justify="space-between">
												<Text>Last Active:</Text>
												<Text color={`gray.700`}>
													{selectedUser.lastActive}
												</Text>
											</HStack>
											<HStack justify="space-between">
												<Text>Tasks Completed:</Text>
												<Text color={`gray.700`}>
													{selectedUser.tasksCompleted}
												</Text>
											</HStack>
										</VStack>
									</Box>
								</VStack>
							)}
						</Dialog.Body>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default UserDetailsModal;
