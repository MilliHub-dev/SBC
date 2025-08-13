import React, { useState } from "react";
import {
	Box,
	Container,
	Text,
	Button,
	Input,
	Field,
	Card,
	VStack,
	HStack,
} from "@chakra-ui/react";
import { useWeb3 } from "../../../hooks/useWeb3";
import LoginModal from "../../../components/Login/LoginModal";
import { toaster } from "../../../components/ui/toaster";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import SimpleHeading from "../../components/SimpleHeading/SimpleHeading";
import { FaRotate } from "react-icons/fa6";
import TokenWrap from "../buy/TokenWrap";

const ConvertTokens = () => {
	const {
		isConnected,
		isLoggedIn,
		userPoints,
		canConvertPoints,
		convertPointsToSabi,
		getConvertibleSabi,
		POINT_TO_SABI_RATE,
		MIN_POINT_CONVERSION,
	} = useWeb3();

	const [pointsToConvert, setPointsToConvert] = useState("");
	const [isConverting, setIsConverting] = useState(false);

	const handleConvertPoints = async () => {
		if (!pointsToConvert || pointsToConvert < MIN_POINT_CONVERSION) {
			toaster.create({
				title: "Invalid Amount",
				description: `Minimum ${MIN_POINT_CONVERSION} points required for conversion`,
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (pointsToConvert > userPoints) {
			toaster.create({
				title: "Insufficient Points",
				description: "You don't have enough points for this conversion",
				type: "error",
				duration: 3000,
			});
			return;
		}

		setIsConverting(true);
		try {
			await convertPointsToSabi(parseInt(pointsToConvert));
			toaster.create({
				title: "Conversion Successful",
				description: `Successfully converted ${pointsToConvert} points to ${
					pointsToConvert * POINT_TO_SABI_RATE
				} Sabi Cash`,
				type: "success",
				duration: 5000,
			});
			setPointsToConvert("");
		} catch (error) {
			toaster.create({
				title: "Conversion Failed",
				description: error.message,
				type: "error",
				duration: 5000,
			});
		} finally {
			setIsConverting(false);
		}
	};

	const handleConvertAll = () => {
		setPointsToConvert(userPoints.toString());
	};

	// if (!isConnected) {
	// 	return (
	// 		<Container maxW="4xl">
	// 			<AlertNotification
	// 				status={"warning"}
	// 				alertMsg={"Please connect your wallet to convert points"}
	// 			/>
	// 		</Container>
	// 	);
	// }

	return (
		<>
			<LoginModal />
			<Container maxW="4xl" p={0}>
				<VStack gap={10} align="stretch">
					{/* Simple Heading component  */}
					<SimpleHeading
						icon={FaRotate}
						headingTitle={"Token Convert"}
						headingDesc={
							"Convert between different cryptocurrencies instantly"
						}
					/>

					{!isConnected && (
						<AlertNotification
							status={"warning"}
							alertMsg={"Please connect your wallet to convert points"}
						/>
					)}

					{isLoggedIn && (
						<>
							<Box
								display={"grid"}
								gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }}
								gap={2}
							>
								<TokenWrap
									balance={userPoints}
									name="Available Points"
									abv="Points"
								/>
								<TokenWrap
									balance={getConvertibleSabi()}
									name="Convertible Sabi Cash"
									abv="SABI"
								/>
							</Box>

							<Card.Root border={0} bg={"gray.900"}>
								<Card.Body bg={"gray.900"} rounded={"lg"} py={8}>
									<VStack gap={4}>
										<Field.Root>
											<Field.Label
												color={"#fff"}
												fontWeight={500}
												fontSize={18}
												mb={3}
											>
												Points to Convert
											</Field.Label>
											<Input
												type="number"
												color={"#fff"}
												border={"1px solid"}
												borderColor={"gray.700"}
												focusRingWidth={2}
												outlineColor={"gray.600"}
												rounded={"sm"}
												placeholder={`Minimum ${MIN_POINT_CONVERSION} points`}
												value={pointsToConvert}
												onChange={(e) =>
													setPointsToConvert(e.target.value)
												}
												min={MIN_POINT_CONVERSION}
												max={userPoints}
											/>
											<Field.HelperText>
												{pointsToConvert &&
													`= ${
														pointsToConvert * POINT_TO_SABI_RATE
													} Sabi Cash`}
											</Field.HelperText>
										</Field.Root>

										<HStack gap={4} w="full">
											<Button
												variant="outline"
												borderColor={"gray.600"}
												padding={5}
												rounded={"sm"}
												onClick={handleConvertAll}
												transition={"background .2s ease"}
												isDisabled={
													userPoints < MIN_POINT_CONVERSION
												}
												flex={1}
												_hover={{ bg: "gray.700" }}
												color={"#fff"}
											>
												Convert All Points
											</Button>
											<Button
												bg="#0088CD"
												color="white"
												rounded={"sm"}
												padding={5}
												transition={"background .2s ease"}
												onClick={handleConvertPoints}
												isLoading={isConverting}
												loadingText="Converting..."
												isDisabled={
													!canConvertPoints() || !pointsToConvert
												}
												flex={1}
												_hover={{ bg: "#0077B6" }}
											>
												Convert Points
											</Button>
										</HStack>
									</VStack>
								</Card.Body>
							</Card.Root>

							<Card.Root bg="blue.900" borderColor="blue.700">
								<Card.Body>
									<VStack gap={3} alignItems="start">
										<Text fontWeight="bold" color="blue.200">
											Conversion Rules:
										</Text>
										<Text fontSize="sm" color="blue.300">
											• 1 point = {POINT_TO_SABI_RATE} Sabi Cash
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Minimum conversion: {MIN_POINT_CONVERSION}{" "}
											points
										</Text>
										<Text fontSize="sm" color="blue.300">
											• You can convert all points at once or in
											batches
										</Text>
										<Text fontSize="sm" color="blue.300">
											• Points will be cleared from your Sabi Ride
											account after conversion
										</Text>
									</VStack>
								</Card.Body>
							</Card.Root>
						</>
					)}
				</VStack>
			</Container>
		</>
	);
};

export default ConvertTokens;
