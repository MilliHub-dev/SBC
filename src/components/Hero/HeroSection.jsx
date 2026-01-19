import React from "react";
import { Box, Container, Button, Image, Text } from "@chakra-ui/react";
import { cryptoImgData } from "../../assets/images/imagesData";
import MinersCard from "../MinersCard/MinersCard";
import { ConnectWallet } from "@thirdweb-dev/react";
// import { useWeb3 } from "../../hooks/useWeb3";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../ui/button";

const HeroSection = () => {
	// const { isConnected, address } = useWeb3();
	// const navigate = useNavigate();

	// const handleDashboardClick = () => {
	// 	navigate("/dashboard");
	// };

	return (
		<Container>
			<Box
				display={"flex"}
				flexDirection={"column"}
				justifyContent={"center"}
				alignItems={"center"}
				gap={10}
			>
				<Box
					w={{ base: "100%", md: "60%" }}
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
						fontSize={{ base: "17px", md: "20px" }}
						fontWeight={"300"}
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
					display={"flex"}
					alignItems={"stretch"}
					w={`full`}
					justifyContent={`center`}
					flexWrap={`wrap`}
					fontWeight={"500"}
					gap={{ base: 3, md: 6 }}
				>
					<ConnectWallet theme="dark" btnTitle="Connect Wallet" />
					<Button
						bg={"gray.800"}
						color={"#fff"}
						rounded={"lg"}
						fontWeight={`bold`}
					>
						Join Community
					</Button>
				</Box>

				<MinersCard />
			</Box>
		</Container>
	);
};

export default HeroSection;
