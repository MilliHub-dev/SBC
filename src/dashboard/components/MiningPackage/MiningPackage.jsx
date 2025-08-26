import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { BiInfoCircle } from "react-icons/bi";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
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
	},
}) => {
	const [showDetails, setShowDetails] = useState(false);
	const [quantity, setQuantity] = useState(2);
	const { buySabiWithPolygon, isConnected } = useWeb3();

	const handleQuantityChange = (increment) => {
		setQuantity((prev) => Math.max(1, prev + increment));
	};

	const handleSelectPackage = async () => {
		try {
			if (!isConnected) {
				alert("Please connect your wallet first");
				return;
			}

			const totalCost = packageData.price * quantity;

			// Convert price to ETH equivalent (assuming 1 ETH = $3000 for demo)
			const ethAmount = totalCost / 3000;

			await buySabiWithPolygon(ethAmount);
			alert(
				`Successfully purchased ${quantity} ${packageData.name} package(s)!`
			);
		} catch (error) {
			console.error("Purchase failed:", error);
			alert("Purchase failed. Please try again.");
		}
	};

	const totalPrice = packageData.price * quantity;
	const totalEstimatedValue = packageData.estimatedValue * quantity;

	return (
		<Box
			padding={"1.5rem"}
			display={"flex"}
			flexDirection={"column"}
			gap={"4"}
			bg={"gray.800"}
			rounded={"md"}
			border={"1px solid"}
			borderColor={"gray.700"}
			transition={"all 0.2s"}
			_hover={{
				borderColor: "#0088CD",
				transform: "translateY(-2px)",
				shadow: "lg",
			}}
		>
			<Flex alignItems={"center"} justifyContent={"space-between"}>
				<Text fontSize={20} fontWeight={"bold"}>
					{packageData.name}
				</Text>
				<Image
					src="start_mining.svg"
					alt="Mining chip"
					boxSize="40px"
					fallback={<Box w="40px" h="40px" bg="gray.600" rounded="md" />}
				/>
			</Flex>

			<Flex alignItems={"center"} justifyContent={"space-between"}>
				<Text color={"#0088CD"} fontWeight={"bold"} fontSize={30}>
					{totalPrice === 0 ? "FREE" : `${totalPrice} SBC`}
				</Text>
				
			</Flex>

			<Flex
				alignItems={"center"}
				justifyContent={"space-between"}
				bg={"gray.900"}
				padding={".5rem 1rem"}
				rounded={"sm"}
			>
				<Text color={"gray.500"}>APR:</Text>
				<Text color={"#0088CD"} fontSize={25} fontWeight={"bold"}>
					{packageData.apr}%
				</Text>
			</Flex>

			<Flex
				gap={2}
				bg={"gray.900"}
				padding={".9rem 1rem"}
				rounded={"sm"}
				flexDirection={"column"}
				fontSize={16}
				color={"gray.500"}
			>
				<Flex alignItems={"center"} justifyContent={"space-between"}>
					<Text>
						Total Est. Value After {packageData.duration} Months:
					</Text>
					<Icon size={"lg"} color={"gray.400"}>
						<BiInfoCircle />
					</Icon>
				</Flex>
				<Text fontWeight={"bold"} fontSize={25} color={"#fff"}>
					{totalEstimatedValue.toFixed(2)} SBC
				</Text>
				<Text fontSize={"sm"}>
					(Includes: {(packageData.retainedAmount * quantity).toFixed(2)}{" "}
					SBC retained + {(packageData.minedAmount * quantity).toFixed(2)}{" "}
					SBC mined)
					{packageData.description && (
						<Text as="span" color="#0088CD">
							{" "}
							• {packageData.description}
						</Text>
					)}
				</Text>
			</Flex>

			<Button
				display={"flex"}
				alignItems={"center"}
				justifyContent={"space-between"}
				padding={"1.5rem 1rem"}
				color={"gray.500"}
				bg={"gray.900"}
				onClick={() => setShowDetails(!showDetails)}
				_hover={{ bg: "gray.700" }}
			>
				Package Details
				<Icon size={"sm"}>
					{showDetails ? <FaChevronUp /> : <FaChevronDown />}
				</Icon>
			</Button>

			<Box
				display={showDetails ? "flex" : "none"}
				flexDirection={"column"}
				gap={2}
				rounded={"sm"}
				bg={"gray.900"}
				padding={"1.1rem 1rem"}
			>
				<Box
					display={"flex"}
					alignItems={"center"}
					justifyContent={"space-between"}
				>
					<Text>Mining Power:</Text>
					<Text fontWeight={"bold"}>{packageData.hashpower}</Text>
				</Box>
				<Box
					display={"flex"}
					alignItems={"center"}
					justifyContent={"space-between"}
				>
					<Text>Duration:</Text>
					<Text fontWeight={"bold"}>
						{packageData.duration}{" "}
						{packageData.duration === 24 ? "Hours" : "Days"}
					</Text>
				</Box>
				<Box
					display={"flex"}
					alignItems={"center"}
					justifyContent={"space-between"}
				>
					<Text>Ride Cost:</Text>
					<Text fontWeight={"bold"}>{packageData.electricityCost}</Text>
				</Box>
				<Box
					display={"flex"}
					alignItems={"center"}
					justifyContent={"space-between"}
				>
					<Text>Total Ride Cost:</Text>
					<Text fontWeight={"bold"}>
						{packageData.totalElectricityCost}
					</Text>
				</Box>
				<Box
					display={"flex"}
					alignItems={"center"}
					justifyContent={"space-between"}
				>
					<Text>Energy Discount:</Text>
					<Text fontWeight={"bold"} color={"green.400"}>
						{packageData.energyDiscount}
					</Text>
				</Box>
			</Box>

			<Button
				padding={"1.5rem 1rem"}
				bg={"#0088CD"}
				color={"#fff"}
				_hover={{ bg: "#0077B3" }}
				onClick={handleSelectPackage}
				isDisabled={!isConnected}
			>
				{isConnected
					? packageData.price === 0
						? "Start Free Mining"
						: `Purchase Mining Plan`
					: "Connect Wallet to Purchase"}
			</Button>
		</Box>
	);
};

export default MiningPackage;
