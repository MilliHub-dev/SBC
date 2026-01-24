import { Box, Button, Container, Icon, Image, Link, Text, Flex, VStack } from "@chakra-ui/react";
import React from "react";
import { CgClose } from "react-icons/cg";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaUser, FaChartLine, FaTwitter, FaDiscord, FaTelegram } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

const MobileNav = ({ openNavbar, setIsOpenNavbar }) => {
	const navLinks = [
		{ label: "Features", href: "#features" },
		{ label: "FAQ", href: "#faq" },
		{ label: "About", href: "#about" },
		{ label: "Tokenomics", href: "#tokenomics" },
	];

	const socialLinks = [
		{ icon: FaTwitter, href: "https://x.com/SabiRide" },
		{ icon: FaDiscord, href: "https://discord.gg/ZvpTZXBC" },
		{ icon: FaTelegram, href: "#" },
	];

	return (
		<Container
			fluid
			position="fixed"
			top={0}
			left={0}
			right={0}
			bottom={0}
			transform={`translateX(${openNavbar ? 0 : "100%"})`}
			transition="all 0.3s ease"
			w="full"
			h="100vh"
			bg="rgba(10, 10, 15, 0.98)"
			backdropFilter="blur(20px)"
			p={6}
			zIndex={9999}
			display="flex"
			flexDirection="column"
		>
			{/* Header */}
			<Flex justify="space-between" align="center" mb={8}>
				<Link as={RouterLink} to="/" onClick={() => setIsOpenNavbar(false)}>
					<Image
						src="/Sabi-Cash.png"
						h="50px"
						alt="SabiCash"
						objectFit="contain"
					/>
				</Link>
				<Button
					onClick={() => setIsOpenNavbar(false)}
					bg="rgba(255, 255, 255, 0.1)"
					color="white"
					borderRadius="xl"
					p={2}
					_hover={{ bg: "rgba(0, 255, 255, 0.2)" }}
				>
					<Icon as={CgClose} boxSize={6} />
				</Button>
			</Flex>

			{/* Navigation Links */}
			<VStack gap={4} align="stretch" flex={1}>
				{navLinks.map((link, index) => (
					<Link
						key={index}
						href={link.href}
						onClick={() => setIsOpenNavbar(false)}
						display="flex"
						alignItems="center"
						py={4}
						px={4}
						borderRadius="xl"
						bg="rgba(255, 255, 255, 0.05)"
						border="1px solid rgba(255, 255, 255, 0.1)"
						color="white"
						fontSize="lg"
						fontWeight="500"
						transition="all 0.3s ease"
						_hover={{
							bg: "rgba(0, 255, 255, 0.1)",
							borderColor: "rgba(0, 255, 255, 0.3)",
							color: "cyan.400",
							textDecoration: "none",
						}}
					>
						{link.label}
					</Link>
				))}

				{/* Dashboard Link */}
				<Link
					as={RouterLink}
					to="/dashboard"
					onClick={() => setIsOpenNavbar(false)}
					display="flex"
					alignItems="center"
					gap={3}
					py={4}
					px={4}
					borderRadius="xl"
					bg="rgba(0, 255, 255, 0.1)"
					border="1px solid rgba(0, 255, 255, 0.3)"
					color="cyan.400"
					fontSize="lg"
					fontWeight="600"
					transition="all 0.3s ease"
					_hover={{
						bg: "rgba(0, 255, 255, 0.2)",
						textDecoration: "none",
					}}
				>
					<Icon as={FaChartLine} />
					Dashboard
				</Link>
			</VStack>

			{/* Bottom Section */}
			<Box mt="auto" pt={6}>
				{/* Wallet Button */}
				<Box mb={4}>
					<WalletMultiButton
						style={{
							width: "100%",
							background: "linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)",
							borderRadius: "12px",
							padding: "16px 24px",
							fontWeight: "600",
							fontSize: "16px",
							border: "none",
							justifyContent: "center",
						}}
					/>
				</Box>

				{/* Social Links */}
				<Flex justify="center" gap={4} mb={4}>
					{socialLinks.map((social, index) => (
						<Link
							key={index}
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							w="48px"
							h="48px"
							borderRadius="xl"
							bg="rgba(255, 255, 255, 0.1)"
							display="flex"
							alignItems="center"
							justifyContent="center"
							transition="all 0.3s ease"
							_hover={{
								bg: "rgba(0, 255, 255, 0.2)",
								transform: "translateY(-2px)",
							}}
						>
							<Icon as={social.icon} color="white" boxSize={5} />
						</Link>
					))}
				</Flex>

				{/* Network Status */}
				<Flex justify="center" align="center" gap={2}>
					<Box
						w="8px"
						h="8px"
						borderRadius="full"
						bg="#10B981"
						boxShadow="0 0 10px rgba(16, 185, 129, 0.5)"
					/>
					<Text fontSize="sm" color="whiteAlpha.600">
						Solana Mainnet
					</Text>
				</Flex>
			</Box>
		</Container>
	);
};

export default MobileNav;
