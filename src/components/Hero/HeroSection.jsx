import React from "react";
import { Box, Container, Button, Image, Text, Flex, Badge, Icon } from "@chakra-ui/react";
import { cryptoImgData } from "../../assets/images/imagesData";
import MinersCard from "../MinersCard/MinersCard";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaRocket, FaShieldAlt, FaBolt, FaChartLine } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";

const HeroSection = () => {
	const features = [
		{ icon: FaBolt, text: "Instant Rewards" },
		{ icon: FaShieldAlt, text: "Secure & Decentralized" },
		{ icon: FaChartLine, text: "Passive Income" },
	];

	return (
		<Box className="gradient-hero blockchain-grid" position="relative" overflow="hidden">
			{/* Animated background elements */}
			<Box
				position="absolute"
				top="20%"
				left="10%"
				w="300px"
				h="300px"
				bg="radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)"
				filter="blur(60px)"
				className="float"
				pointerEvents="none"
			/>
			<Box
				position="absolute"
				bottom="20%"
				right="10%"
				w="400px"
				h="400px"
				bg="radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)"
				filter="blur(80px)"
				className="float"
				style={{ animationDelay: "3s" }}
				pointerEvents="none"
			/>

			<Container maxW="1400px" py={{ base: 16, md: 24 }} position="relative" zIndex={1}>
				<Flex
					direction="column"
					align="center"
					gap={{ base: 8, md: 12 }}
				>
					{/* Badge */}
					<Badge
						className="glass"
						px={4}
						py={2}
						borderRadius="full"
						fontSize="sm"
						fontWeight="medium"
						display="flex"
						alignItems="center"
						gap={2}
					>
						<Box className="network-online" />
						<Text color="white">Live on Solana Mainnet</Text>
					</Badge>

					{/* Main heading */}
					<Box
						w={{ base: "100%", md: "80%", lg: "70%" }}
						textAlign="center"
					>
						<Text
							as="h1"
							fontSize={{ base: "2.5rem", md: "3.5rem", lg: "4rem" }}
							fontWeight="bold"
							lineHeight="1.1"
							mb={4}
							fontFamily="'Space Grotesk', sans-serif"
						>
							The Future of{" "}
							<Text as="span" className="text-gradient-cyber">
								Mobility
							</Text>
							{" "}and{" "}
							<Text as="span" className="text-gradient-cyber">
								Rewards
							</Text>
						</Text>

						<Text
							as="h2"
							fontSize={{ base: "2rem", md: "3rem", lg: "3.5rem" }}
							fontWeight="bold"
							className="text-gradient-cyber"
							mb={6}
							fontFamily="'Space Grotesk', sans-serif"
						>
							Ride. Earn. Repeat.
						</Text>

						<Text
							fontSize={{ base: "lg", md: "xl" }}
							color="whiteAlpha.800"
							maxW="800px"
							mx="auto"
							lineHeight="1.7"
						>
							Sabi Cash ($SBC) is the native utility token powering the Sabi Ride ecosystem
							on Solana. Earn rewards for every ride, stake for passive income, and be part
							of the decentralized mobility revolution.
						</Text>
					</Box>

					{/* Feature badges */}
					<Flex
						gap={{ base: 2, md: 4 }}
						flexWrap="wrap"
						justify="center"
					>
						{features.map((feature, index) => (
							<Box
								key={index}
								className="glass"
								px={4}
								py={2}
								borderRadius="full"
								display="flex"
								alignItems="center"
								gap={2}
							>
								<Icon as={feature.icon} color="cyan.400" boxSize={4} />
								<Text fontSize="sm" color="whiteAlpha.900" fontWeight="medium">
									{feature.text}
								</Text>
							</Box>
						))}
					</Flex>

					{/* Crypto logos */}
					<Box
						className="glass"
						px={8}
						py={4}
						borderRadius="2xl"
						display="flex"
						justifyContent="center"
						alignItems="center"
						flexWrap="wrap"
						gap={{ base: 4, md: 6 }}
					>
						<Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium">
							Supported Networks:
						</Text>
						{cryptoImgData.map((images, index) => (
							<Image
								key={index}
								h={{ base: "36px", md: "44px" }}
								src={images.img}
								alt={images.title}
								objectFit="contain"
								className="token-icon"
								opacity={0.9}
								_hover={{ opacity: 1 }}
								transition="all 0.3s ease"
							/>
						))}
					</Box>

					{/* CTA Buttons */}
					<Flex
						gap={{ base: 3, md: 4 }}
						flexWrap="wrap"
						justify="center"
						align="center"
					>
						<WalletMultiButton
							style={{
								background: "linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)",
								borderRadius: "12px",
								padding: "12px 24px",
								fontWeight: "600",
								fontSize: "16px",
								border: "none",
								boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
								transition: "all 0.3s ease",
							}}
						/>
						<Button
							className="btn-neon-outline"
							size="lg"
							rightIcon={<HiArrowRight />}
							onClick={() => window.open("https://discord.gg/ZvpTZXBC", "_blank")}
						>
							Join Community
						</Button>
					</Flex>

					{/* Stats section */}
					<Box w="full" mt={8}>
						<MinersCard />
					</Box>

					{/* Trust indicators */}
					<Flex
						gap={{ base: 6, md: 12 }}
						flexWrap="wrap"
						justify="center"
						mt={4}
					>
						<Box textAlign="center">
							<Text
								fontSize={{ base: "2xl", md: "3xl" }}
								fontWeight="bold"
								className="text-gradient-cyber"
							>
								100K+
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Active Users
							</Text>
						</Box>
						<Box textAlign="center">
							<Text
								fontSize={{ base: "2xl", md: "3xl" }}
								fontWeight="bold"
								className="text-gradient-cyber"
							>
								$2M+
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Total Value Locked
							</Text>
						</Box>
						<Box textAlign="center">
							<Text
								fontSize={{ base: "2xl", md: "3xl" }}
								fontWeight="bold"
								className="text-gradient-cyber"
							>
								500K+
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								Rides Completed
							</Text>
						</Box>
						<Box textAlign="center">
							<Text
								fontSize={{ base: "2xl", md: "3xl" }}
								fontWeight="bold"
								className="text-gradient-cyber"
							>
								45%
							</Text>
							<Text fontSize="sm" color="whiteAlpha.600">
								APY Rewards
							</Text>
						</Box>
					</Flex>
				</Flex>
			</Container>
		</Box>
	);
};

export default HeroSection;
