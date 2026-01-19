import React, { useState } from "react";
import {
	Dialog,
	Button,
	Input,
	Field,
	VStack,
	Text,
	Alert,
	Box,
	Flex,
	Icon,
	Portal,
	Tabs,
	HStack,
} from "@chakra-ui/react";
import { useWeb3 } from "../../hooks/useWeb3";
import { toaster } from "../ui/toaster";
import { FaExclamationTriangle, FaUser, FaCar } from "react-icons/fa";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";

// isOpen, onClose,
const LoginModal = ({ openLoginModal, setOpenLoginModal }) => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [userType, setUserType] = useState("passenger"); // 'passenger' or 'driver'

	const { login, isConnected, address } = useWeb3();

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};



	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			// Check for Demo Mode login first
			if (import.meta.env.DEV && formData.password === "demo123") {
				const response = {
					success: true,
					token: `demo_jwt_token_${userType}`,
					points: userType === 'driver' ? 2500 : 1250,
					user: {
						id: userType === 'driver' ? 'driver_001' : 'passenger_001',
						email: formData.email,
						name: `Demo ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
						user_type: userType,
					},
					userType: userType
				};
				
				// Store demo auth data
				localStorage.setItem("authToken", response.token);
				localStorage.setItem("userType", userType);
				localStorage.setItem("userPoints", response.points || 0);
				localStorage.setItem("userEmail", formData.email);
				localStorage.setItem("userId", response.user.id);
				
				toaster.create({
					title: "Login successful (Demo)",
					description: `Welcome ${userType}! You have ${response.points || 0} points.`,
					type: "success",
					duration: 3000,
				});
				
				setOpenLoginModal(false);
				return;
			}

			// Production / Real Login Flow using useWeb3 hook
			const response = await login(formData.email, formData.password, userType);

			if (response.success) {
				toaster.create({
					title: "Login successful",
					description: `Welcome ${userType}! You have ${response.points || 0} points.`,
					type: "success",
					duration: 3000,
				});

				setOpenLoginModal(false);
			}
		} catch (err) {
			console.error("Login failed:", err);
			setError(err.message || "Login failed");
			toaster.create({
				title: "Login failed",
				description: err.message || "An error occurred during login",
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog.Root
			// open={isOpen}
			// onOpenChange={(details) => !details.open && onClose()}
			open={openLoginModal}
			onOpenChange={(e) => setOpenLoginModal(e.open)}
			size={{ base: `xs`, md: `sm` }}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4}>
						<Dialog.Header>
							<Dialog.Title color={`#000`}>
								Login to Sabi Ride
							</Dialog.Title>
							<Dialog.CloseTrigger color="black" />
						</Dialog.Header>
						<Dialog.Body>
							<VStack gap={4}>
								{/* User Type Selection */}
								<Box w="full">
									<Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
										Login as:
									</Text>
									<HStack gap={2} w="full">
										<Button
											flex={1}
											size="sm"
											bg={userType === "passenger" ? "blue.500" : "transparent"}
											color={userType === "passenger" ? "white" : "gray.600"}
											border="1px solid"
											borderColor={userType === "passenger" ? "blue.500" : "gray.200"}
											_hover={{
												bg: userType === "passenger" ? "blue.600" : "gray.50",
											}}
											onClick={() => setUserType("passenger")}
										>
											<FaUser /> Passenger
										</Button>
										<Button
											flex={1}
											size="sm"
											bg={userType === "driver" ? "blue.500" : "transparent"}
											color={userType === "driver" ? "white" : "gray.600"}
											border="1px solid"
											borderColor={userType === "driver" ? "blue.500" : "gray.200"}
											_hover={{
												bg: userType === "driver" ? "blue.600" : "gray.50",
											}}
											onClick={() => setUserType("driver")}
										>
											<FaCar /> Driver
										</Button>
									</HStack>
								</Box>



								{/* Wallet Connection Status */}
								{address && (
									<Box
										w="full"
										p={3}
										bg="green.50"
										border="1px solid"
										borderColor="green.200"
										rounded="md"
									>
										<Text fontSize="xs" color="green.600" mb={1}>
											Connected Wallet:
										</Text>
										<Text fontSize="sm" color="green.700" fontFamily="mono">
											{address.slice(0, 6)}...{address.slice(-4)}
										</Text>
									</Box>
								)}
								{error && (
									<>
										{/* <Alert status="error" rounded="md">
										<Icon color="red.500" mr={2}>
											<FaExclamationTriangle />
										</Icon>
										{error}
									</Alert> */}
										<AlertNotification
											status={`error`}
											alertMsg={error}
										/>
									</>
								)}
								{!isConnected && (
									<>
										{/* <Alert status="warning" rounded="md">
											<Icon color="orange.500" mr={2}>
												<FaExclamationTriangle />
											</Icon>
										</Alert> */}
										<AlertNotification
											status={`warning`}
											alertMsg={`Please connect your wallet before logging in`}
										/>
									</>
								)}
								<form onSubmit={handleSubmit} style={{ width: "100%" }}>
									<VStack gap={4} w="full">
										<Field.Root w="full" color={`#000`}>
											<Field.Label>Email</Field.Label>
											<Input
												name="email"
												type="email"
												value={formData.email}
												onChange={handleInputChange}
												placeholder="Enter your email"
												required
											/>
										</Field.Root>
										<Field.Root w="full" color={`#000`}>
											<Field.Label>Password</Field.Label>
											<Input
												name="password"
												type="password"
												value={formData.password}
												onChange={handleInputChange}
												placeholder="Enter your password"
												required
											/>
										</Field.Root>
										<Button
											type="submit"
											bg="blue.500"
											color="white"
											_hover={{ bg: "blue.600" }}
											isLoading={isLoading}
											loadingText="Logging in..."
											width="full"
											isDisabled={!isConnected}
										>
											Login
										</Button>
										<Text
											fontSize="xs"
											color="gray.500"
											textAlign="center"
										>
											Don't have an account? Contact support to
											create one.
										</Text>
									</VStack>
								</form>
							</VStack>
						</Dialog.Body>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default LoginModal;
