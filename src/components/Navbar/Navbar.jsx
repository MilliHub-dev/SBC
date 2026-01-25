import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Icon,
	Image,
	Link as ChakraLink,
	Flex,
	Container,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenuAlt3 } from "react-icons/hi";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaUser, FaChartLine } from "react-icons/fa";
import LoginModal from "../Login/LoginModal";
import { useWeb3 } from "../../hooks/useWeb3";

const Navbar = ({ setIsOpenNavbar }) => {
	const [openLoginModal, setOpenLoginModal] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { isLoggedIn } = useWeb3();
	const navigate = useNavigate();

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleDashboardClick = () => {
		if (isLoggedIn) {
			navigate("/dashboard");
		} else {
			setOpenLoginModal(true);
		}
	};

	const navLinks = [
		{ label: "Features", href: "#features" },
		{ label: "FAQ", href: "#faq" },
		{ label: "About", href: "#about" },
		{ label: "Tokenomics", href: "#tokenomics" },
	];

	return (
		<>
			<LoginModal
				openLoginModal={openLoginModal}
				setOpenLoginModal={setOpenLoginModal}
			/>
			<Box
				as="nav"
				position="fixed"
				top={0}
				left={0}
				right={0}
				zIndex={1000}
				transition="all 0.3s ease"
				bg={scrolled ? "rgba(10, 10, 15, 0.9)" : "transparent"}
				backdropFilter={scrolled ? "blur(20px)" : "none"}
				borderBottom={scrolled ? "1px solid rgba(0, 255, 255, 0.1)" : "none"}
			>
				<Container maxW="1400px">
					<Flex
						align="center"
						justify="space-between"
						py={scrolled ? 3 : 5}
						transition="all 0.3s ease"
					>
						{/* Logo */}
						<Link to="/">
							<Flex align="center" gap={2}>
								<Image
									src="/Sabi-Cash.png"
									alt="SabiCash Logo"
									h={{ base: "40px", md: "60px" }}
									w="auto"
									objectFit="contain"
								/>
							</Flex>
						</Link>

						{/* Desktop Navigation */}
						<Flex
							display={{ base: "none", lg: "flex" }}
							gap={1}
							align="center"
							className="glass"
							borderRadius="full"
							px={2}
							py={1}
						>
							{navLinks.map((link, index) => (
								<ChakraLink
									key={index}
									href={link.href}
									px={4}
									py={2}
									borderRadius="full"
									color="whiteAlpha.800"
									fontSize="sm"
									fontWeight="medium"
									transition="all 0.3s ease"
									_hover={{
										color: "#00FFFF",
										bg: "rgba(0, 255, 255, 0.1)",
										textDecoration: "none",
									}}
								>
									{link.label}
								</ChakraLink>
							))}
						</Flex>

						{/* Right side buttons */}
						<Flex align="center" gap={3}>
							{/* Dashboard button */}
							<Button
								onClick={handleDashboardClick}
								size="sm"
								leftIcon={<FaChartLine />}
								className="glass"
								color="white"
								borderRadius="full"
								px={4}
								_hover={{
									bg: "rgba(0, 255, 255, 0.1)",
									borderColor: "rgba(0, 255, 255, 0.3)",
								}}
								display={{ base: "none", md: "flex" }}
							>
								Dashboard
							</Button>

							{/* Login button */}
							{!isLoggedIn && (
								<Button
									onClick={() => setOpenLoginModal(true)}
									size="sm"
									leftIcon={<FaUser />}
									bg="linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"
									color="#0a0a0f"
									borderRadius="full"
									px={4}
									fontWeight="600"
									_hover={{
										transform: "translateY(-1px)",
										boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
									}}
									display={{ base: "none", md: "flex" }}
								>
									Login
								</Button>
							)}

							{/* Wallet button */}
							<Box display={{ base: "none", md: "block" }}>
								<WalletMultiButton
									style={{
										background: "linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)",
										borderRadius: "9999px",
										padding: "8px 16px",
										fontWeight: "600",
										fontSize: "14px",
										height: "auto",
										border: "none",
										boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
									}}
								/>
							</Box>

							{/* Mobile menu button */}
							<Button
								onClick={() => setIsOpenNavbar(true)}
								display={{ base: "flex", lg: "none" }}
								className="glass"
								color="white"
								borderRadius="xl"
								p={2}
								_hover={{
									bg: "rgba(0, 255, 255, 0.1)",
								}}
							>
								<Icon as={HiMenuAlt3} boxSize={6} />
							</Button>
						</Flex>
					</Flex>
				</Container>

				{/* Animated bottom border on scroll */}
				{scrolled && (
					<Box
						position="absolute"
						bottom={0}
						left={0}
						right={0}
						h="1px"
						overflow="hidden"
					>
						<Box
							h="full"
							bg="linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent)"
						/>
					</Box>
				)}
			</Box>

			{/* Spacer to prevent content from hiding behind fixed navbar */}
			<Box h={{ base: "70px", md: "80px" }} />
		</>
	);
};

export default Navbar;
