import { Box, Container, Text } from "@chakra-ui/react";
import React from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa6";
import CustomCard from "../CustomCard/CustomCard";

const AboutSabiRide = () => {
	return (
		<Container
			display={"flex"}
			alignItems={"center"}
			justifyContent={"center"}
			mt={20}
		>
			<Box w={{ base: "full", md: "80%" }}>
				<Text
					fontSize={"25px"}
					color={"#fff"}
					fontWeight={"bold"}
					mb={"16px"}
				>
					About
				</Text>
				<Text fontSize={"20px"} fontWeight={400} color={"#fff"} mb={2}>
					{" "}
					What is Sabi Cash?
				</Text>
				<Text as={"p"} color={"gray.500"} fontSize={"16px"}>
					Sabi Cash ($SBC) is a utility token built on the Polygon zkEVM
					blockchain that enables ride-to-earn, referrals, staking, and
					payments within the Sabi Ride platform. It’s designed to reward
					everyday transport activity while supporting a decentralized
					financial future.
				</Text>
				<Box
					display={"flex"}
					flexDirection={"column"}
					gap={2}
					mt={6}
					color={"gray.500"}
				>
					<Text>✅ Use Sabi Cash to pay for rides</Text>
					<Text>✅ Earn while you ride or drive</Text>
					<Text>✅ Get rewarded for referrals and tasks</Text>
					<Text>✅ Stake to earn passive income</Text>
					<Text>✅ Secure, fast, and eco-friendly on Polygon zkEVM</Text>
				</Box>

				<Box display={"grid"} gap={5} mt={10}>
					<CustomCard
						icon={<FaDiscord />}
						buttonTitle={
							<a
								href="https://discord.gg/ZvpTZXBC"
								target="_blank"
								rel="noopener noreferrer"
								style={{ textDecoration: "none" }}
							>
								Join Discord
							</a>
						}
						cardQuestion={"Join our Discord community"}
						cardText={
							<>
								Stay updated on our discord.
							</>
						}
					/>
					<CustomCard
						icon={<FaTwitter />}
						buttonTitle={
							<a
								href="https://x.com/SabiRide"
								target="_blank"
								rel="noopener noreferrer"
								style={{ textDecoration: "none" }}
							>
								Follow us
							</a>
						}
						cardQuestion={"Follow us on X"}
						cardText={
							<>
								Don't miss any updates on X.
							</>
						}
					/>
				</Box>
			</Box>
		</Container>
	);
};

export default AboutSabiRide;
