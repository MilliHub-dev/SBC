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
import { FaExclamationTriangle, FaUser, FaCar, FaWallet } from "react-icons/fa";
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
				<Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(8px)" />
				<Dialog.Positioner>
					<Dialog.Content
						mx={4}
						bg="#0f172a"
						border="1px solid"
						borderColor="cyan.800"
						borderRadius="xl"
						boxShadow="0 0 30px rgba(0, 255, 255, 0.1)"
					>
						<Dialog.Header borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
							<Dialog.Title color="white" fontWeight="bold">
								Login to SabiCash
							</Dialog.Title>
							<Dialog.CloseTrigger color="whiteAlpha.600" _hover={{ color: "white" }} />
						</Dialog.Header>
						<Dialog.Body py={5}>
							<VStack gap={4}>
								{/* User Type Selection */}
								<Box w="full">
									<Text fontSize="sm" fontWeight="600" color="whiteAlpha.800" mb={2}>
										Login as:
									</Text>
									<HStack gap={3} w="full">
										<Button
											flex={1}
											size="sm"
											bg={userType === "passenger" ? "cyan.500" : "whiteAlpha.100"}
											color={userType === "passenger" ? "white" : "whiteAlpha.700"}
											border="1px solid"
											borderColor={userType === "passenger" ? "cyan.500" : "whiteAlpha.200"}
											borderRadius="lg"
											_hover={{
												bg: userType === "passenger" ? "cyan.600" : "whiteAlpha.200",
											}}
											onClick={() => setUserType("passenger")}
										>
											<FaUser /> Passenger
										</Button>
										<Button
											flex={1}
											size="sm"
											bg={userType === "driver" ? "purple.500" : "whiteAlpha.100"}
											color={userType === "driver" ? "white" : "whiteAlpha.700"}
											border="1px solid"
											borderColor={userType === "driver" ? "purple.500" : "whiteAlpha.200"}
											borderRadius="lg"
											_hover={{
												bg: userType === "driver" ? "purple.600" : "whiteAlpha.200",
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
										bg="green.900"
										border="1px solid"
										borderColor="green.700"
										borderRadius="lg"
									>
										<Flex align="center" gap={2}>
											<Icon as={FaWallet} color="green.400" />
											<Box>
												<Text fontSize="xs" color="green.400" fontWeight="600">
													Wallet Connected
												</Text>
												<Text fontSize="sm" color="green.300" fontFamily="mono">
													{address.slice(0, 6)}...{address.slice(-4)}
												</Text>
											</Box>
										</Flex>
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
										<Field.Root w="full">
											<Field.Label color="whiteAlpha.800" fontSize="sm">Email</Field.Label>
											<Input
												name="email"
												type="email"
												value={formData.email}
												onChange={handleInputChange}
												placeholder="Enter your email"
												required
												bg="whiteAlpha.100"
												border="1px solid"
												borderColor="whiteAlpha.200"
												borderRadius="lg"
												color="white"
												_placeholder={{ color: "whiteAlpha.500" }}
												_hover={{ borderColor: "cyan.600" }}
												_focus={{ borderColor: "cyan.500", boxShadow: "0 0 0 1px rgba(0, 255, 255, 0.3)" }}
											/>
										</Field.Root>
										<Field.Root w="full">
											<Field.Label color="whiteAlpha.800" fontSize="sm">Password</Field.Label>
											<Input
												name="password"
												type="password"
												value={formData.password}
												onChange={handleInputChange}
												placeholder="Enter your password"
												required
												bg="whiteAlpha.100"
												border="1px solid"
												borderColor="whiteAlpha.200"
												borderRadius="lg"
												color="white"
												_placeholder={{ color: "whiteAlpha.500" }}
												_hover={{ borderColor: "cyan.600" }}
												_focus={{ borderColor: "cyan.500", boxShadow: "0 0 0 1px rgba(0, 255, 255, 0.3)" }}
											/>
										</Field.Root>
										<Button
											type="submit"
											bg="linear-gradient(135deg, #00FFFF 0%, #0088CC 100%)"
											color="white"
											fontWeight="bold"
											borderRadius="lg"
											_hover={{
												transform: "translateY(-1px)",
												boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
											}}
											_disabled={{
												opacity: 0.5,
												cursor: "not-allowed",
											}}
											isLoading={isLoading}
											loadingText="Logging in..."
											width="full"
											isDisabled={!isConnected}
											transition="all 0.2s ease"
										>
											Login
										</Button>
										<Text
											fontSize="xs"
											color="whiteAlpha.600"
											textAlign="center"
										>
											Don't have an account?{" "}
											<Text as="span" color="cyan.400" cursor="pointer">
												Contact support
											</Text>{" "}
											to create one.
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
