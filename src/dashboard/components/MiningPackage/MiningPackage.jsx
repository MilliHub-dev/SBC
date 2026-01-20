import { Box, Button, Flex, Icon, Image, Text, Badge } from "@chakra-ui/react";
import React, { useState } from "react";
import { BiInfoCircle } from "react-icons/bi";
import { FaChevronUp, FaChevronDown, FaBolt, FaClock, FaFire, FaRocket } from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useWeb3 } from "../../../hooks/useWeb3";

const MiningPackage = ({
	packageData = {
		name: "Baby Chip",
		price: 25,
		apr: 24.16,
		duration: 3,
		hashpower: "0.9969 TH/s",
		electricityCost: "$0.0698/kwh",
		totalElectricityCost: "$2.82",
		energyDiscount: "0.33%",
		estimatedValue: 26.51,
		retainedAmount: 21.81,
		minedAmount: 4.7,
		btcPrice: 105506.0,
		popular: false,
		color: "cyan",
	},
}) => {
	const [showDetails, setShowDetails] = useState(false);
	const [quantity] = useState(2);
	const { buySabiWithSolana, isConnected } = useWeb3();

	const handleSelectPackage = async () => {
		try {
			if (!isConnected) {
				alert("Please connect your wallet first");
				return;
			}

			const totalCost = packageData.price * quantity;
			const solAmount = totalCost / 100;

			await buySabiWithSolana(solAmount);
			alert(`Successfully purchased ${quantity} ${packageData.name} package(s)!`);
		} catch (error) {
			console.error("Purchase failed:", error);
			alert("Purchase failed. Please try again.");
		}
	};

	const totalPrice = packageData.price * quantity;
	const totalEstimatedValue = packageData.estimatedValue * quantity;

	const colorMap = {
		cyan: { gradient: "linear-gradient(135deg, #00FFFF 0%, #0088CC 100%)", light: "cyan.400", bg: "rgba(0, 255, 255, 0.1)" },
		purple: { gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", light: "purple.400", bg: "rgba(168, 85, 247, 0.1)" },
		pink: { gradient: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)", light: "pink.400", bg: "rgba(236, 72, 153, 0.1)" },
		green: { gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)", light: "green.400", bg: "rgba(16, 185, 129, 0.1)" },
	};

	const colors = colorMap[packageData.color] || colorMap.cyan;

	return (
		<Box
			className="blockchain-card"
			p={6}
			position="relative"
			overflow="hidden"
			role="group"
		>
			{/* Popular badge */}
			{packageData.popular && (
				<Badge
					position="absolute"
					top={4}
					right={4}
					bg={colors.gradient}
					color="white"
					px={3}
					py={1}
					borderRadius="full"
					fontSize="xs"
					fontWeight="bold"
					display="flex"
					alignItems="center"
					gap={1}
				>
					<Icon as={FaFire} boxSize={3} />
					POPULAR
				</Badge>
			)}

			{/* Glow effect */}
			<Box
				position="absolute"
				top="-50%"
				right="-20%"
				w="200px"
				h="200px"
				bg={`radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`}
				filter="blur(40px)"
				opacity={0}
				transition="opacity 0.3s ease"
				_groupHover={{ opacity: 1 }}
				pointerEvents="none"
			/>

			<Flex direction="column" gap={4} position="relative" zIndex={1}>
				{/* Header */}
				<Flex align="center" justify="space-between">
					<Flex align="center" gap={3}>
						<Box
							w="48px"
							h="48px"
							borderRadius="xl"
							bg={colors.bg}
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Icon as={HiOutlineSparkles} color={colors.light} boxSize={6} />
						</Box>
						<Box>
							<Text
								fontSize="lg"
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
							>
								{packageData.name}
							</Text>
							<Text fontSize="xs" color="whiteAlpha.600">
								{packageData.hashpower} hash power
							</Text>
						</Box>
					</Flex>
				</Flex>

				{/* Price */}
				<Box className="glass" p={4} borderRadius="xl" textAlign="center">
					<Text
						fontSize="3xl"
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						className="text-gradient-cyber"
					>
						{totalPrice === 0 ? "FREE" : `${totalPrice} SBC`}
					</Text>
					{packageData.description && (
						<Text fontSize="xs" color="whiteAlpha.600" mt={1}>
							{packageData.description}
						</Text>
					)}
				</Box>

				{/* APR Card */}
				<Box className="glass" p={4} borderRadius="xl">
					<Flex align="center" justify="space-between">
						<Flex align="center" gap={2}>
							<Icon as={FaRocket} color={colors.light} boxSize={4} />
							<Text fontSize="sm" color="whiteAlpha.700">APR</Text>
						</Flex>
						<Text
							fontSize="2xl"
							fontWeight="bold"
							color={colors.light}
							fontFamily="'Space Grotesk', sans-serif"
						>
							{packageData.apr}%
						</Text>
					</Flex>
				</Box>

				{/* Estimated Value */}
				<Box className="glass" p={4} borderRadius="xl">
					<Flex align="center" justify="space-between" mb={2}>
						<Text fontSize="sm" color="whiteAlpha.600">
							Est. Value After {packageData.duration} {packageData.duration === 24 ? "Hours" : "Days"}
						</Text>
						<Icon as={BiInfoCircle} color="whiteAlpha.400" boxSize={4} />
					</Flex>
					<Text
						fontSize="xl"
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={2}
					>
						{totalEstimatedValue.toFixed(2)} SBC
					</Text>
					<Flex gap={4} fontSize="xs" color="whiteAlpha.500">
						<Text>
							<Text as="span" color="green.400">{(packageData.retainedAmount * quantity).toFixed(2)}</Text> retained
						</Text>
						<Text>
							<Text as="span" color="cyan.400">+{(packageData.minedAmount * quantity).toFixed(2)}</Text> mined
						</Text>
					</Flex>
				</Box>

				{/* Details Toggle */}
				<Button
					onClick={() => setShowDetails(!showDetails)}
					className="glass"
					justifyContent="space-between"
					py={4}
					h="auto"
					color="whiteAlpha.700"
					_hover={{ bg: "rgba(0, 255, 255, 0.05)" }}
				>
					<Flex align="center" gap={2}>
						<Icon as={FaBolt} color={colors.light} boxSize={4} />
						<Text fontSize="sm">Package Details</Text>
					</Flex>
					<Icon as={showDetails ? FaChevronUp : FaChevronDown} boxSize={4} />
				</Button>

				{/* Details Content */}
				{showDetails && (
					<Box className="glass" p={4} borderRadius="xl">
						<Flex direction="column" gap={3} fontSize="sm">
							<Flex justify="space-between">
								<Text color="whiteAlpha.600">Mining Power</Text>
								<Text fontWeight="600">{packageData.hashpower}</Text>
							</Flex>
							<Flex justify="space-between">
								<Text color="whiteAlpha.600">Duration</Text>
								<Text fontWeight="600">
									{packageData.duration} {packageData.duration === 24 ? "Hours" : "Days"}
								</Text>
							</Flex>
							<Flex justify="space-between">
								<Text color="whiteAlpha.600">Ride Cost</Text>
								<Text fontWeight="600">{packageData.electricityCost}</Text>
							</Flex>
							<Flex justify="space-between">
								<Text color="whiteAlpha.600">Total Ride Cost</Text>
								<Text fontWeight="600">{packageData.totalElectricityCost}</Text>
							</Flex>
							<Flex justify="space-between">
								<Text color="whiteAlpha.600">Energy Discount</Text>
								<Text fontWeight="600" color="green.400">{packageData.energyDiscount}</Text>
							</Flex>
						</Flex>
					</Box>
				)}

				{/* Purchase Button */}
				<Button
					onClick={handleSelectPackage}
					isDisabled={!isConnected}
					bg={isConnected ? colors.gradient : "whiteAlpha.200"}
					color={isConnected ? "white" : "whiteAlpha.500"}
					py={6}
					h="auto"
					fontWeight="bold"
					borderRadius="xl"
					transition="all 0.3s ease"
					_hover={isConnected ? {
						transform: "translateY(-2px)",
						boxShadow: `0 0 30px ${colors.bg}`,
					} : {}}
					_disabled={{
						cursor: "not-allowed",
						opacity: 0.6,
					}}
				>
					{isConnected
						? packageData.price === 0
							? "Start Free Mining"
							: "Purchase Mining Plan"
						: "Connect Wallet to Purchase"}
				</Button>
			</Flex>
		</Box>
	);
};

export default MiningPackage;
