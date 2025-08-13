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
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useWeb3 } from "../../../hooks/useWeb3";
import AlertNotification from "@/dashboard/components/AlertNotification/AlertNotification";

const StartMining = () => {
	const [selectedCurrency, setSelectedCurrency] = useState("polygon");
	const { isConnected, address } = useWeb3();

	// Updated mining packages as requested: Free, 100 Sabi Cash, 1000 Sabi Cash
	const miningPackages = [
		{
			name: "Free Plan",
			price: 0,
			apr: 5.0,
			duration: 24, // 24 hours
			hashpower: "0.1 TH/s",
			electricityCost: "$0.00/kwh",
			totalElectricityCost: "$0.00",
			energyDiscount: "0%",
			estimatedValue: 0.5,
			retainedAmount: 0.5,
			minedAmount: 0.5,
			btcPrice: 105506.0,
			description: "Try mining for free! Limited daily rewards.",
		},
		{
			name: "Standard Mining",
			price: 100,
			apr: 26.34,
			duration: 30, // 30 days
			hashpower: "2.5 TH/s",
			electricityCost: "$0.0685/kwh",
			totalElectricityCost: "$5.89",
			energyDiscount: "0.65%",
			estimatedValue: 126.34,
			retainedAmount: 105.67,
			minedAmount: 26.34,
			btcPrice: 105506.0,
			description:
				"Deposit 100 Sabi Cash for 30 days of mining with good returns.",
		},
		{
			name: "Pro Mining",
			price: 1000,
			apr: 35.5,
			duration: 30, // 30 days
			hashpower: "15.8 TH/s",
			electricityCost: "$0.0550/kwh",
			totalElectricityCost: "$45.23",
			energyDiscount: "2.5%",
			estimatedValue: 1355.0,
			retainedAmount: 1155.0,
			minedAmount: 355.0,
			btcPrice: 105506.0,
			description:
				"Deposit 1000 Sabi Cash for maximum mining power and highest returns.",
		},
	];

	return (
		<Container maxW="6xl" p={0}>
			{!isConnected && (
				<AlertNotification
					status={"warning"}
					alertMsg={
						"	Please connect your wallet to start mining and make purchases."
					}
				/>
			)}

			<Box
				bg={"gray.900"}
				rounded={"md"}
				padding={"2.3rem"}
				display={"flex"}
				flexDirection={"column"}
				gap={3}
				mb={6}
				mt={3}
			>
				<Text as={"p"} fontSize={18} color={"gray.400"}>
					Step 1
				</Text>
				<Text as={"h2"} fontSize={20} fontWeight={"bold"}>
					Choose Currency to Mine
				</Text>

				<Box
					display={"flex"}
					alignItems={"center"}
					gap={2}
					flexWrap={"wrap"}
				>
					{whatWeMine.map((item) => {
						const isSelected = selectedCurrency === item.crypto;
						return (
							<Button
								key={item.crypto}
								fontSize={14}
								padding={"10px 15px"}
								rounded={"md"}
								bg={isSelected ? "#0088CD" : "transparent"}
								border={"1px solid"}
								borderColor={isSelected ? "#0088CD" : "gray.700"}
								color={isSelected ? "#fff" : "#fff"}
								display={"flex"}
								alignItems={"center"}
								justifyContent={"center"}
								h={"full"}
								gap={2}
								onClick={() => setSelectedCurrency(item.crypto)}
								_hover={{
									bg: isSelected ? "#0077B3" : "gray.800",
									borderColor: "#0088CD",
								}}
								transition={"all 0.2s"}
							>
								<Image
									height={"20px"}
									width={"20px"}
									src={item.img}
									alt={item.crypto}
									objectFit={"contain"}
								/>
								{item.name}
							</Button>
						);
					})}
				</Box>

				{selectedCurrency && (
					<Box mt={3} p={3} bg={"gray.800"} rounded={"md"}>
						<Text fontSize={"sm"} color={"gray.400"}>
							Selected currency:{" "}
							<Text as="span" fontWeight="bold" color="#0088CD">
								{selectedCurrency}
							</Text>
						</Text>
						<Text fontSize={"xs"} color={"gray.500"} mt={1}>
							Mining rewards will be distributed in the selected
							cryptocurrency
						</Text>
					</Box>
				)}
			</Box>

			<Box
				display={"flex"}
				flexDirection={"column"}
				gap={3}
				padding={"2.3rem"}
				border={"1px solid"}
				rounded={"md"}
				borderColor={"gray.700"}
				my={5}
			>
				<Text as={"p"} color={"gray.400"}>
					Step 2
				</Text>
				<Text as={"h2"} fontSize={20} fontWeight={"bold"}>
					Select Mining Package
				</Text>
				<Text fontSize={"sm"} color={"gray.500"}>
					Choose from our range of mining packages with different hash
					rates and returns
				</Text>
			</Box>

			<Box
				display={"grid"}
				gridTemplateColumns={"repeat(auto-fit, minmax(300px, 1fr))"}
				gap={5}
			>
				{miningPackages.map((packageData, index) => (
					<MiningPackage key={index} packageData={packageData} />
				))}
			</Box>

			{isConnected && (
				<Box mt={8} p={6} bg={"gray.900"} rounded={"md"} mx={8}>
					<Flex alignItems={"center"} gap={3} mb={4}>
						<Icon as={checkIcon} color={"green.400"} />

						<Text fontWeight={"bold"} color={"green.400"}>
							Wallet Connected
						</Text>
					</Flex>
					<Text fontSize={"sm"} color={"gray.400"}>
						Address: {address}
					</Text>
					<Text fontSize={"sm"} color={"gray.500"} mt={2}>
						You can now purchase mining packages and start earning
						rewards!
					</Text>
				</Box>
			)}
		</Container>
	);
};

const checkIcon = () => {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
			<path
				fillRule="evenodd"
				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
				clipRule="evenodd"
			/>
		</svg>
	);
};

export default StartMining;
