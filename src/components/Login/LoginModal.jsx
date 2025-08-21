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
import { FaInfoCircle, FaExclamationTriangle, FaUser, FaCar } from "react-icons/fa";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { authAPI } from "../../config/apiConfig";

// isOpen, onClose,
const LoginModal = ({ openLoginModal, setOpenLoginModal }) => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [userType, setUserType] = useState("passenger"); // 'passenger' or 'driver'

	const { loginToSabiRide, isConnected, address } = useWeb3();

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleDemoLogin = () => {
		setFormData({
			email: userType === "driver" ? "driver@sabiride.com" : "passenger@sabiride.com",
			password: "demo123",
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const credentials = {
				email: formData.email,
				password: formData.password,
				walletAddress: address || null,
			};

			let response;
			try {
				// Use existing Sabi Ride login endpoint
				response = await authAPI.login(credentials);
				
				// After successful login, get user profile based on type
				if (response.success || response.token) {
					let profileResponse;
					try {
						if (userType === "driver") {
							profileResponse = await authAPI.getDriverProfile();
						} else {
							profileResponse = await authAPI.getPassengerProfile();
						}
						
						// Merge profile data with login response
						response = {
							...response,
							user: profileResponse,
							userType: userType,
							points: profileResponse.total_points || 0,
						};
					} catch (profileError) {
						console.warn("Could not fetch profile, using basic login data:", profileError);
						// Continue with basic login data
						response.userType = userType;
					}
				}
			} catch (apiError) {
				// Fallback to demo mode for development
				if (process.env.NODE_ENV === 'development') {
					response = {
						success: true,
						token: `demo_jwt_token_${userType}`,
						points: userType === 'driver' ? 2500 : 1250,
						user: {
							id: userType === 'driver' ? 'driver_001' : 'passenger_001',
							email: formData.email,
							name: `Demo ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
							userType: userType,
						},
					};
				} else {
					throw apiError;
				}
			}

			if (response.success || response.token) {
				// Store auth data
				localStorage.setItem("authToken", response.token);
				localStorage.setItem("userType", userType);
				localStorage.setItem("userPoints", response.points || 0);
				localStorage.setItem("userEmail", formData.email);
				localStorage.setItem("userId", response.user?.id || response.id);

				// Also call the existing web3 login function for compatibility
				try {
					await loginToSabiRide(formData.email, formData.password);
				} catch (web3Error) {
					console.warn("Web3 login compatibility issue:", web3Error);
				}

				toaster.create({
					title: "Login successful",
					description: `Welcome ${userType}! You have ${response.points || 0} points.`,
					type: "success",
					duration: 3000,
				});

				setOpenLoginModal(false);
			}
		} catch (err) {
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
							<Dialog.CloseTrigger />
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
											variant={userType === "passenger" ? "solid" : "outline"}
											colorPalette={userType === "passenger" ? "blue" : "gray"}
											onClick={() => setUserType("passenger")}
											leftIcon={<FaUser />}
										>
											Passenger
										</Button>
										<Button
											flex={1}
											size="sm"
											variant={userType === "driver" ? "solid" : "outline"}
											colorPalette={userType === "driver" ? "blue" : "gray"}
											onClick={() => setUserType("driver")}
											leftIcon={<FaCar />}
										>
											Driver
										</Button>
									</HStack>
								</Box>

								{/* Demo credentials info */}
								<Box
									w="full"
									p={3}
									bg="blue.50"
									border="1px solid"
									borderColor="blue.200"
									rounded="md"
								>
									<Flex alignItems="center" gap={2} mb={2}>
										<Icon color="blue.500">
											<FaInfoCircle />
										</Icon>
										<Text
											fontSize="sm"
											fontWeight="bold"
											color="blue.700"
										>
											Demo Mode Available
										</Text>
									</Flex>
									<Text fontSize="xs" color="blue.600" mb={2}>
										Demo credentials for {userType}:
									</Text>
									<Box fontSize="xs" color="blue.600">
										<Text>
											<strong>Email:</strong> {userType}@sabiride.com
										</Text>
										<Text>
											<strong>Password:</strong> demo123
										</Text>
									</Box>
									<Button
										size="sm"
										variant="outline"
										colorPalette="blue"
										mt={2}
										onClick={handleDemoLogin}
									>
										Use Demo Credentials
									</Button>
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
											colorScheme="blue"
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
