import MiningPackage from "../../../dashboard/components/MiningPackage/MiningPackage";
import { whatWeMine } from "../../../assets/images/imagesData";
import {
	Box,
	Button,
	Icon,
	Image,
	Text,
	Flex,
	Container,
	Grid,
	Badge,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useWeb3 } from "../../../hooks/useWeb3";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";
import { FaCubes, FaCheckCircle, FaWallet, FaBolt, FaFire } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

const StartMining = () => {
	const [selectedCurrency, setSelectedCurrency] = useState("solana");
	const { isConnected, address } = useWeb3();

	const miningPackages = [
		{
			name: "Free Plan",
			price: 0,
			apr: 5.0,
			duration: 24,
			hashpower: "0.1 TH/s",
			electricityCost: "$0.00/kwh",
			totalElectricityCost: "$0.00",
			energyDiscount: "0%",
			estimatedValue: 0.5,
			retainedAmount: 0.5,
			minedAmount: 0.5,
			btcPrice: 105506.0,
			description: "Try mining for free! Limited daily rewards.",
			popular: false,
			color: "cyan",
		},
		{
			name: "Standard Mining",
			price: 100,
			apr: 26.34,
			duration: 30,
			hashpower: "2.5 TH/s",
			electricityCost: "$0.0685/kwh",
			totalElectricityCost: "$5.89",
			energyDiscount: "0.65%",
			estimatedValue: 126.34,
			retainedAmount: 105.67,
			minedAmount: 26.34,
			btcPrice: 105506.0,
			description: "Deposit 100 Sabi Cash for 30 days of mining with good returns.",
			popular: true,
			color: "purple",
		},
		{
			name: "Pro Mining",
			price: 1000,
			apr: 35.5,
			duration: 30,
			hashpower: "15.8 TH/s",
			electricityCost: "$0.0550/kwh",
			totalElectricityCost: "$45.23",
			energyDiscount: "2.5%",
			estimatedValue: 1355.0,
			retainedAmount: 1155.0,
			minedAmount: 355.0,
			btcPrice: 105506.0,
			description: "Deposit 1000 Sabi Cash for maximum mining power and highest returns.",
			popular: false,
			color: "pink",
		},
	];

	return (
		<Box>
			{/* Page Header */}
			<Flex direction="column" mb={8}>
				<Flex align="center" gap={3} mb={2}>
					<Box
						w="48px"
						h="48px"
						borderRadius="xl"
						bg="linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)"
						display="flex"
						alignItems="center"
						justifyContent="center"
						className="mining-pulse"
					>
						<Icon as={FaCubes} color="cyan.400" boxSize={6} />
					</Box>
					<Box>
						<Text
							fontSize={{ base: "2xl", md: "3xl" }}
							fontWeight="bold"
							fontFamily="'Space Grotesk', sans-serif"
						>
							Start <Text as="span" className="text-gradient-cyber">Mining</Text>
						</Text>
						<Text color="whiteAlpha.600" fontSize="sm">
							Choose a plan and start earning crypto rewards
						</Text>
					</Box>
				</Flex>
			</Flex>

			{!isConnected && (
				<Box
					className="blockchain-card"
					p={4}
					mb={6}
					borderColor="rgba(251, 191, 36, 0.3)"
				>
					<Flex align="center" gap={3}>
						<Box
							w="40px"
							h="40px"
							borderRadius="xl"
							bg="rgba(251, 191, 36, 0.1)"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Icon as={FaWallet} color="yellow.400" boxSize={5} />
						</Box>
						<Box>
							<Text fontWeight="600" color="yellow.400">
								Wallet Not Connected
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Connect your wallet to start mining and make purchases
							</Text>
						</Box>
					</Flex>
				</Box>
			)}

			{/* Step 1 - Choose Currency */}
			<Box className="blockchain-card" p={6} mb={6}>
				<Flex align="center" gap={3} mb={4}>
					<Badge
						bg="rgba(0, 255, 255, 0.1)"
						color="cyan.400"
						px={3}
						py={1}
						borderRadius="full"
						fontSize="xs"
						fontWeight="bold"
					>
						STEP 1
					</Badge>
				</Flex>
				<Text
					fontSize="xl"
					fontWeight="bold"
					fontFamily="'Space Grotesk', sans-serif"
					mb={2}
				>
					Choose Currency to Mine
				</Text>
				<Text fontSize="sm" color="whiteAlpha.600" mb={6}>
					Select the cryptocurrency you want to earn from mining
				</Text>

				<Flex gap={3} flexWrap="wrap">
					{whatWeMine.map((item) => {
						const isSelected = selectedCurrency === item.crypto;
						return (
							<Button
								key={item.crypto}
								onClick={() => setSelectedCurrency(item.crypto)}
								className={isSelected ? "" : "glass"}
								bg={isSelected ? "linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)" : "transparent"}
								color={isSelected ? "#0a0a0f" : "white"}
								border="1px solid"
								borderColor={isSelected ? "transparent" : "whiteAlpha.200"}
								borderRadius="xl"
								px={4}
								py={3}
								h="auto"
								fontWeight="600"
								fontSize="sm"
								display="flex"
								alignItems="center"
								gap={2}
								transition="all 0.3s ease"
								_hover={{
									transform: "translateY(-2px)",
									boxShadow: isSelected
										? "0 0 30px rgba(0, 255, 255, 0.4)"
										: "0 0 20px rgba(0, 255, 255, 0.2)",
								}}
							>
								<Image
									h="24px"
									w="24px"
									src={item.img}
									alt={item.crypto}
									objectFit="contain"
									className={isSelected ? "" : "token-icon"}
								/>
								{item.name}
							</Button>
						);
					})}
				</Flex>

				{selectedCurrency && (
					<Box mt={6} className="glass" p={4} borderRadius="xl">
						<Flex align="center" gap={2}>
							<Icon as={FaCheckCircle} color="green.400" boxSize={4} />
							<Text fontSize="sm" color="whiteAlpha.700">
								Mining currency:{" "}
								<Text as="span" fontWeight="bold" className="text-gradient-cyber">
									{selectedCurrency.toUpperCase()}
								</Text>
							</Text>
						</Flex>
						<Text fontSize="xs" color="whiteAlpha.500" mt={2} pl={6}>
							Rewards will be distributed in the selected cryptocurrency
						</Text>
					</Box>
				)}
			</Box>

			{/* Step 2 - Select Package */}
			<Box className="blockchain-card" p={6} mb={6}>
				<Flex align="center" gap={3} mb={4}>
					<Badge
						bg="rgba(168, 85, 247, 0.1)"
						color="purple.400"
						px={3}
						py={1}
						borderRadius="full"
						fontSize="xs"
						fontWeight="bold"
					>
						STEP 2
					</Badge>
				</Flex>
				<Text
					fontSize="xl"
					fontWeight="bold"
					fontFamily="'Space Grotesk', sans-serif"
					mb={2}
				>
					Select Mining Package
				</Text>
				<Text fontSize="sm" color="whiteAlpha.600">
					Choose from our range of mining packages with different hash rates and returns
				</Text>
			</Box>

			{/* Mining Packages Grid */}
			<Grid
				templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
				gap={6}
				mb={8}
			>
				{miningPackages.map((packageData, index) => (
					<MiningPackage key={index} packageData={packageData} />
				))}
			</Grid>

			{/* Connected Status */}
			{isConnected && (
				<Box className="blockchain-card" p={6} position="relative" overflow="hidden">
					{/* Glow effect */}
					<Box
						position="absolute"
						top="-50%"
						right="-10%"
						w="200px"
						h="200px"
						bg="radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)"
						filter="blur(40px)"
						pointerEvents="none"
					/>

					<Flex align="center" gap={4} position="relative" zIndex={1}>
						<Box
							w="50px"
							h="50px"
							borderRadius="xl"
							bg="rgba(16, 185, 129, 0.1)"
							display="flex"
							alignItems="center"
							justifyContent="center"
							border="1px solid"
							borderColor="green.400"
						>
							<Icon as={FaCheckCircle} color="green.400" boxSize={6} />
						</Box>
						<Box flex="1">
							<Flex align="center" gap={2} mb={1}>
								<Text fontWeight="bold" color="green.400">
									Wallet Connected
								</Text>
								<Box className="network-online" />
							</Flex>
							<Text fontSize="sm" color="whiteAlpha.600" fontFamily="mono">
								{address?.slice(0, 6)}...{address?.slice(-4)}
							</Text>
							<Text fontSize="xs" color="whiteAlpha.500" mt={1}>
								Ready to purchase mining packages and earn rewards
							</Text>
						</Box>
					</Flex>
				</Box>
			)}
		</Box>
	);
};

export default StartMining;
