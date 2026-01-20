import { Box, Container, Text, Flex, Icon, Grid, GridItem, Button } from "@chakra-ui/react";
import React from "react";
import { FaDiscord, FaTwitter, FaCheckCircle, FaCar, FaCoins, FaUserFriends, FaChartLine, FaLeaf, FaShieldAlt, FaBolt, FaGlobe } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

const FeatureCard = ({ icon, title, description, color = "cyan" }) => (
	<Box
		className="blockchain-card"
		p={6}
		position="relative"
		overflow="hidden"
		role="group"
	>
		{/* Glow effect on hover */}
		<Box
			position="absolute"
			top="-50%"
			left="-50%"
			w="200%"
			h="200%"
			bg={`radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 50%)`}
			opacity={0}
			transition="opacity 0.3s ease"
			_groupHover={{ opacity: 1 }}
			pointerEvents="none"
		/>

		<Flex direction="column" gap={4} position="relative" zIndex={1}>
			<Box
				w="50px"
				h="50px"
				borderRadius="xl"
				bg={`rgba(0, 255, 255, 0.1)`}
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Icon as={icon} color={`${color}.400`} boxSize={6} />
			</Box>
			<Text fontWeight="bold" fontSize="lg" fontFamily="'Space Grotesk', sans-serif">
				{title}
			</Text>
			<Text color="whiteAlpha.700" fontSize="sm" lineHeight="1.7">
				{description}
			</Text>
		</Flex>
	</Box>
);

const AboutSabiRide = () => {
	const features = [
		{
			icon: FaCar,
			title: "Ride-to-Earn",
			description: "Earn $SBC tokens for every completed ride as a passenger or driver. The more you ride, the more you earn.",
			color: "cyan",
		},
		{
			icon: FaCoins,
			title: "Staking Rewards",
			description: "Stake your tokens to earn up to 45% APY passive income. Multiple flexible plans to suit your strategy.",
			color: "purple",
		},
		{
			icon: FaUserFriends,
			title: "Referral Program",
			description: "Invite friends and earn bonus tokens when they complete their first ride or make their first stake.",
			color: "green",
		},
		{
			icon: FaBolt,
			title: "Instant Payments",
			description: "Pay for rides instantly with $SBC at discounted rates. Fast, seamless blockchain transactions.",
			color: "yellow",
		},
		{
			icon: FaShieldAlt,
			title: "Secure & Audited",
			description: "Built on Solana with audited smart contracts. Your assets are always secure and under your control.",
			color: "blue",
		},
		{
			icon: FaLeaf,
			title: "Eco-Friendly",
			description: "Solana's proof-of-stake is energy efficient. Earn rewards while supporting sustainable blockchain.",
			color: "green",
		},
	];

	const stats = [
		{ value: "0.00025s", label: "Block Time" },
		{ value: "$0.00025", label: "Avg Transaction" },
		{ value: "65,000", label: "TPS Capacity" },
		{ value: "100%", label: "Carbon Neutral" },
	];

	return (
		<Box id="about" className="gradient-cyber" py={20} position="relative">
			{/* Background decorations */}
			<Box
				position="absolute"
				top="20%"
				left="5%"
				w="300px"
				h="300px"
				bg="radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)"
				filter="blur(60px)"
				pointerEvents="none"
			/>
			<Box
				position="absolute"
				bottom="20%"
				right="5%"
				w="400px"
				h="400px"
				bg="radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)"
				filter="blur(80px)"
				pointerEvents="none"
			/>

			<Container maxW="1400px" position="relative" zIndex={1}>
				{/* Section header */}
				<Flex direction="column" align="center" textAlign="center" mb={16}>
					<Flex
						align="center"
						gap={2}
						className="glass"
						px={4}
						py={2}
						borderRadius="full"
						mb={4}
					>
						<Icon as={HiOutlineSparkles} color="cyan.400" boxSize={4} />
						<Text fontSize="sm" color="cyan.400" fontWeight="medium">
							ABOUT SABICASH
						</Text>
					</Flex>
					<Text
						as="h2"
						fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={4}
					>
						The Future of{" "}
						<Text as="span" className="text-gradient-cyber">
							Mobility Rewards
						</Text>
					</Text>
					<Text color="whiteAlpha.700" maxW="700px" fontSize={{ base: "md", md: "lg" }}>
						SabiCash ($SBC) is revolutionizing transportation by rewarding every ride.
						Built on Solana for speed, security, and sustainability.
					</Text>
				</Flex>

				{/* Main content grid */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} mb={16}>
					{/* Left side - Description */}
					<GridItem>
						<Box className="blockchain-card" p={8} h="full">
							<Text
								fontSize="2xl"
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
								mb={4}
							>
								What is SabiCash?
							</Text>
							<Text color="whiteAlpha.800" lineHeight="1.8" mb={6}>
								SabiCash ($SBC) is the native utility token of the Sabi Ride ecosystem,
								built on the Solana blockchain. It powers a revolutionary ride-to-earn
								model that rewards passengers and drivers for every completed trip.
							</Text>
							<Text color="whiteAlpha.800" lineHeight="1.8" mb={6}>
								Beyond ride rewards, $SBC enables staking for passive income, governance
								participation, and serves as a payment method across the platform. It's
								designed to bridge traditional transportation with decentralized finance.
							</Text>

							{/* Key benefits */}
							<Flex direction="column" gap={3}>
								{[
									"Pay for rides at discounted rates",
									"Earn tokens for every trip completed",
									"Stake for up to 45% APY rewards",
									"Participate in platform governance",
									"Access exclusive airdrops and presales",
								].map((benefit, index) => (
									<Flex key={index} align="center" gap={3}>
										<Icon as={FaCheckCircle} color="cyan.400" boxSize={4} />
										<Text color="whiteAlpha.700">{benefit}</Text>
									</Flex>
								))}
							</Flex>
						</Box>
					</GridItem>

					{/* Right side - Stats and network info */}
					<GridItem>
						<Box className="blockchain-card" p={8} mb={6}>
							<Flex align="center" gap={3} mb={6}>
								<Box
									w="40px"
									h="40px"
									borderRadius="xl"
									bg="linear-gradient(135deg, #9945FF 0%, #14F195 100%)"
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									<Icon as={FaGlobe} color="white" boxSize={5} />
								</Box>
								<Box>
									<Text fontWeight="bold" fontFamily="'Space Grotesk', sans-serif">
										Powered by Solana
									</Text>
									<Text fontSize="sm" color="whiteAlpha.600">
										Fast, secure, and scalable
									</Text>
								</Box>
							</Flex>

							<Grid templateColumns="repeat(2, 1fr)" gap={4}>
								{stats.map((stat, index) => (
									<Box
										key={index}
										className="glass"
										p={4}
										borderRadius="xl"
										textAlign="center"
									>
										<Text
											fontSize="xl"
											fontWeight="bold"
											className="text-gradient-cyber"
											fontFamily="'Space Grotesk', sans-serif"
										>
											{stat.value}
										</Text>
										<Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase">
											{stat.label}
										</Text>
									</Box>
								))}
							</Grid>
						</Box>

						{/* Social CTAs */}
						<Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
							<Button
								as="a"
								href="https://discord.gg/ZvpTZXBC"
								target="_blank"
								rel="noopener noreferrer"
								className="blockchain-card"
								h="auto"
								p={6}
								display="flex"
								flexDirection="column"
								alignItems="flex-start"
								gap={3}
								_hover={{
									borderColor: "rgba(88, 101, 242, 0.5)",
									boxShadow: "0 0 30px rgba(88, 101, 242, 0.2)",
								}}
							>
								<Box
									w="40px"
									h="40px"
									borderRadius="xl"
									bg="rgba(88, 101, 242, 0.2)"
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									<Icon as={FaDiscord} color="#5865F2" boxSize={5} />
								</Box>
								<Box>
									<Text fontWeight="bold" fontSize="sm">Join Discord</Text>
									<Text fontSize="xs" color="whiteAlpha.600">
										Connect with the community
									</Text>
								</Box>
							</Button>

							<Button
								as="a"
								href="https://x.com/SabiRide"
								target="_blank"
								rel="noopener noreferrer"
								className="blockchain-card"
								h="auto"
								p={6}
								display="flex"
								flexDirection="column"
								alignItems="flex-start"
								gap={3}
								_hover={{
									borderColor: "rgba(29, 161, 242, 0.5)",
									boxShadow: "0 0 30px rgba(29, 161, 242, 0.2)",
								}}
							>
								<Box
									w="40px"
									h="40px"
									borderRadius="xl"
									bg="rgba(29, 161, 242, 0.2)"
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									<Icon as={FaTwitter} color="#1DA1F2" boxSize={5} />
								</Box>
								<Box>
									<Text fontWeight="bold" fontSize="sm">Follow on X</Text>
									<Text fontSize="xs" color="whiteAlpha.600">
										Get the latest updates
									</Text>
								</Box>
							</Button>
						</Grid>
					</GridItem>
				</Grid>

				{/* Features grid */}
				<Box id="features">
					<Text
						textAlign="center"
						fontSize={{ base: "xl", md: "2xl" }}
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={8}
					>
						Why Choose{" "}
						<Text as="span" className="text-gradient-cyber">
							SabiCash?
						</Text>
					</Text>
					<Grid
						templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
						gap={6}
					>
						{features.map((feature, index) => (
							<FeatureCard key={index} {...feature} />
						))}
					</Grid>
				</Box>

				{/* Tokenomics preview */}
				<Box id="tokenomics" className="blockchain-card" p={8} mt={16} textAlign="center">
					<Text
						fontSize={{ base: "xl", md: "2xl" }}
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={4}
					>
						Tokenomics
					</Text>
					<Text color="whiteAlpha.700" maxW="600px" mx="auto" mb={8}>
						A carefully designed token distribution to ensure long-term sustainability
						and community growth.
					</Text>
					<Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
						{[
							{ label: "Community Rewards", value: "40%", color: "cyan" },
							{ label: "Development", value: "25%", color: "purple" },
							{ label: "Team & Advisors", value: "15%", color: "pink" },
							{ label: "Liquidity", value: "20%", color: "green" },
						].map((item, index) => (
							<Box key={index} className="glass" p={4} borderRadius="xl">
								<Text
									fontSize="2xl"
									fontWeight="bold"
									color={`${item.color}.400`}
									fontFamily="'Space Grotesk', sans-serif"
								>
									{item.value}
								</Text>
								<Text fontSize="sm" color="whiteAlpha.600">
									{item.label}
								</Text>
							</Box>
						))}
					</Grid>
				</Box>
			</Container>
		</Box>
	);
};

export default AboutSabiRide;
