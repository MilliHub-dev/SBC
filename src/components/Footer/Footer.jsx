import { Box, Container, Link, Text, Flex, Icon, Grid, GridItem } from "@chakra-ui/react";
import React from "react";
import { FaTwitter, FaDiscord, FaTelegram, FaGithub, FaMedium } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
	const socialLinks = [
		{ icon: FaTwitter, href: "https://x.com/SabiRide", label: "Twitter" },
		{ icon: FaDiscord, href: "https://discord.gg/ZvpTZXBC", label: "Discord" },
		{ icon: FaTelegram, href: "#", label: "Telegram" },
		{ icon: FaGithub, href: "#", label: "GitHub" },
		{ icon: FaMedium, href: "#", label: "Medium" },
	];

	const quickLinks = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Staking", href: "/dashboard/staking" },
		{ label: "Mining", href: "/dashboard/start-mining" },
		{ label: "Rewards", href: "/dashboard/rewards" },
	];

	const resourceLinks = [
		{ label: "Documentation", href: "#" },
		{ label: "Whitepaper", href: "#" },
		{ label: "Tokenomics", href: "#tokenomics" },
		{ label: "Roadmap", href: "#" },
	];

	const legalLinks = [
		{ label: "Privacy Policy", href: "#" },
		{ label: "Terms of Service", href: "#" },
		{ label: "Cookie Policy", href: "#" },
	];

	return (
		<Box
			as="footer"
			className="gradient-cyber blockchain-grid"
			position="relative"
			mt={20}
			pt={16}
			pb={8}
			borderTop="1px solid rgba(0, 255, 255, 0.1)"
		>
			{/* Top gradient line */}
			<Box
				position="absolute"
				top={0}
				left={0}
				right={0}
				h="1px"
				bg="linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), rgba(168, 85, 247, 0.5), transparent)"
			/>

			<Container maxW="1400px">
				<Grid
					templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "2fr 1fr 1fr 1fr" }}
					gap={{ base: 10, lg: 8 }}
					mb={12}
				>
					{/* Brand section */}
					<GridItem>
						<Flex align="center" gap={2} mb={4}>
							<Box
								w="40px"
								h="40px"
								borderRadius="xl"
								bg="linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<Icon as={HiOutlineSparkles} color="#0a0a0f" boxSize={5} />
							</Box>
							<Text
								fontSize="xl"
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
								className="text-gradient-cyber"
							>
								SabiCash
							</Text>
						</Flex>
						<Text color="whiteAlpha.700" fontSize="sm" lineHeight="1.8" mb={6} maxW="300px">
							The future of mobility rewards. Earn $SBC tokens for every ride, stake for
							passive income, and be part of the decentralized transportation revolution.
						</Text>
						{/* Social links */}
						<Flex gap={3}>
							{socialLinks.map((social, index) => (
								<Link
									key={index}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="glass"
									w="40px"
									h="40px"
									borderRadius="xl"
									display="flex"
									alignItems="center"
									justifyContent="center"
									transition="all 0.3s ease"
									_hover={{
										bg: "rgba(0, 255, 255, 0.1)",
										borderColor: "rgba(0, 255, 255, 0.3)",
										transform: "translateY(-2px)",
									}}
								>
									<Icon as={social.icon} color="whiteAlpha.800" boxSize={4} />
								</Link>
							))}
						</Flex>
					</GridItem>

					{/* Quick Links */}
					<GridItem>
						<Text
							fontSize="sm"
							fontWeight="bold"
							textTransform="uppercase"
							letterSpacing="wider"
							color="cyan.400"
							mb={4}
						>
							Quick Links
						</Text>
						<Flex direction="column" gap={3}>
							{quickLinks.map((link, index) => (
								<RouterLink key={index} to={link.href}>
									<Text
										color="whiteAlpha.700"
										fontSize="sm"
										transition="all 0.3s ease"
										_hover={{ color: "cyan.400", pl: 1 }}
									>
										{link.label}
									</Text>
								</RouterLink>
							))}
						</Flex>
					</GridItem>

					{/* Resources */}
					<GridItem>
						<Text
							fontSize="sm"
							fontWeight="bold"
							textTransform="uppercase"
							letterSpacing="wider"
							color="cyan.400"
							mb={4}
						>
							Resources
						</Text>
						<Flex direction="column" gap={3}>
							{resourceLinks.map((link, index) => (
								<Link
									key={index}
									href={link.href}
									color="whiteAlpha.700"
									fontSize="sm"
									transition="all 0.3s ease"
									_hover={{ color: "cyan.400", textDecoration: "none", pl: 1 }}
								>
									{link.label}
								</Link>
							))}
						</Flex>
					</GridItem>

					{/* Legal */}
					<GridItem>
						<Text
							fontSize="sm"
							fontWeight="bold"
							textTransform="uppercase"
							letterSpacing="wider"
							color="cyan.400"
							mb={4}
						>
							Legal
						</Text>
						<Flex direction="column" gap={3}>
							{legalLinks.map((link, index) => (
								<Link
									key={index}
									href={link.href}
									color="whiteAlpha.700"
									fontSize="sm"
									transition="all 0.3s ease"
									_hover={{ color: "cyan.400", textDecoration: "none", pl: 1 }}
								>
									{link.label}
								</Link>
							))}
						</Flex>
					</GridItem>
				</Grid>

				{/* Newsletter section */}
				<Box
					className="blockchain-card"
					p={6}
					mb={12}
					textAlign="center"
				>
					<Text
						fontSize="lg"
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={2}
					>
						Stay Updated with SabiCash
					</Text>
					<Text color="whiteAlpha.600" fontSize="sm" mb={4}>
						Get the latest news, updates, and exclusive offers directly in your inbox.
					</Text>
					<Flex
						maxW="400px"
						mx="auto"
						gap={2}
						direction={{ base: "column", sm: "row" }}
					>
						<Box
							as="input"
							flex="1"
							type="email"
							placeholder="Enter your email"
							className="glass"
							px={4}
							py={3}
							borderRadius="xl"
							color="white"
							fontSize="sm"
							outline="none"
							_focus={{
								borderColor: "rgba(0, 255, 255, 0.5)",
								boxShadow: "0 0 0 1px rgba(0, 255, 255, 0.5)",
							}}
						/>
						<Box
							as="button"
							px={6}
							py={3}
							borderRadius="xl"
							bg="linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"
							color="#0a0a0f"
							fontWeight="600"
							fontSize="sm"
							cursor="pointer"
							transition="all 0.3s ease"
							_hover={{
								transform: "translateY(-1px)",
								boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
							}}
						>
							Subscribe
						</Box>
					</Flex>
				</Box>

				{/* Bottom bar */}
				<Box
					pt={6}
					borderTop="1px solid rgba(255, 255, 255, 0.1)"
				>
					<Flex
						direction={{ base: "column", md: "row" }}
						justify="space-between"
						align="center"
						gap={4}
					>
						<Text color="whiteAlpha.500" fontSize="sm">
							&copy; {new Date().getFullYear()} SabiCash. All rights reserved.
						</Text>
						<Flex align="center" gap={2}>
							<Box className="network-online" />
							<Text color="whiteAlpha.500" fontSize="sm">
								Powered by Solana
							</Text>
						</Flex>
					</Flex>
				</Box>
			</Container>
		</Box>
	);
};

export default Footer;
