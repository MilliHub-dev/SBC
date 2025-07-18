import { Box, Button, Container, Image, Text } from "@chakra-ui/react";
import React from "react";
import { cryptoImgData } from "../../assets/images/imagesData";
import MinersCard from "../MinersCard/MinersCard";

import { useNavigate } from "react-router-dom";

const HeroSection = () => {

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWeb3 } from "../../hooks/useWeb3";
import { useNavigate } from "react-router";


	const { isConnected, address } = useWeb3();

	const navigate = useNavigate();

	const handleDashboardClick = () => {
		navigate('/dashboard');
	};

	return (
		<Container mt={5}>
			<Box
				display={"flex"}
				flexDirection={"column"}
				justifyContent={"center"}
				alignItems={"center"}
				gap={10}
			>
				<Box
					w={{ base: "100%", md: "50%" }}
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					gap={-5}
					fontSize={{ base: "40px", md: "50px" }}
					fontWeight={"bold"}
					textAlign={"center"}
				>
					<Text as={"h1"} fontSize={{ base: 30, md: 40 }}>
						Welcome to Sabi Cash
					</Text>
					<Text as={"h1"} fontSize={{ base: 30, md: 40 }}>
						{" "}
						The Future of Mobility and Rewards.
					</Text>
					<Text
						as={"h1"}
						fontSize={{ base: 40, md: 50 }}
						color={"#0088CD"}
					>
						Ride Earn Repeat
					</Text>
					<Text
						as={"p"}
						mb={"10px"}
						fontSize={{ base: "15px", md: "20px" }}
						fontWeight={"500"}
					>
						Sabi Cash is the official crypto token powering the Sabi Ride
						ecosystem. Whether you’re a passenger or a driver, you earn
						rewards for every ride and activity. Get rewarded for moving
						the world.
					</Text>
				</Box>
				<Box
					display={"flex"}
					justifyContent={"center"}
					alignItems={"center"}
					flexWrap={"wrap"}
					gap={3}
				>
					{cryptoImgData.map((images, index) => {
						return (
							<Image
								h={{ base: "50px", md: "60px" }}
								key={index}
								src={images.img}
								alt={images.title}
								objectFit={"contain"}
							/>
						);
					})}
				</Box>
				<Box
					paddingInline={"1.4rem"}
					fontSize={{ base: ".8rem", md: "1.5rem" }}
					display={"flex"}
					alignItems={"center"}
					fontWeight={"500"}
					gap={{ base: 3, md: 10 }}
					flexDirection={{ base: "column", md: "row" }}
				>


					{!isConnected ? (
						<>
							<ConnectButton />
							<Button
								padding={{ base: "1.6rem 1.4rem", md: "1.9rem 1.7rem" }}
								bg={"gray.800"}
								color={"#fff"}
								rounded={"lg"}
							>
								Join Community
							</Button>
						</>
					) : (
						<>
							<Box 
								display="flex" 
								alignItems="center" 
								gap={4}
								flexDirection={{ base: "column", md: "row" }}
							>
								<Text fontSize="sm" color="gray.600">
									Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
								</Text>
								<Button
									padding={{ base: "1.6rem 1.4rem", md: "1.9rem 1.7rem" }}
									bg={"#0088CD"}
									color={"#fff"}
									rounded={"lg"}
									onClick={handleDashboardClick}
								>
									Go to Dashboard
								</Button>
								<ConnectButton />
							</Box>
						</>
					)}

				</Box>
				<MinersCard />
			</Box>
		</Container>
	);
};

export default HeroSection;
