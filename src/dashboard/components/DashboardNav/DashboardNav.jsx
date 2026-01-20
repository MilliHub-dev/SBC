import {
	Box,
	Button,
	Container,
	Icon,
	Image,
	Link,
	Text,
	Flex,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaWallet, FaUser, FaRightFromBracket, FaCoins } from "react-icons/fa6";
import { IoMenuSharp } from "react-icons/io5";
import { HiOutlineSparkles } from "react-icons/hi2";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWeb3 } from "../../../hooks/useWeb3";
import LoginModal from "../../../components/Login/LoginModal";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const BalanceCard = ({ label, value, color = "cyan" }) => (
	<Box
		className="glass"
		px={4}
		py={2}
		borderRadius="xl"
		textAlign="center"
		minW="80px"
	>
		<Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="wide">
			{label}
		</Text>
		<Text
			fontSize="sm"
			fontWeight="bold"
			color={`${color}.400`}
			fontFamily="'Space Grotesk', sans-serif"
		>
			{value}
		</Text>
	</Box>
);

const DashboardNav = ({ onToggleSidebar }) => {
	const navigate = useNavigate();

	const {
		isConnected,
		isLoggedIn,
		userPoints,
		sabiBalance,
		solBalance,
		logout,
	} = useWeb3();
	const [openLoginModal, setOpenLoginModal] = useState(false);

	const handleLogout = async () => {
		await logout();
		navigate('/');
	};

	return (
		<>
			<LoginModal
				openLoginModal={openLoginModal}
				setOpenLoginModal={setOpenLoginModal}
			/>
			<Box
				position="fixed"
				top={0}
				left={0}
				right={0}
				h="70px"
				bg="rgba(10, 10, 15, 0.9)"
				backdropFilter="blur(20px)"
				borderBottom="1px solid rgba(0, 255, 255, 0.1)"
				pl={{ base: 0, md: "80px" }}
				zIndex={997}
			>
				{/* Animated bottom border */}
				<Box
					position="absolute"
					bottom={0}
					left={0}
					right={0}
					h="1px"
					bg="linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), rgba(168, 85, 247, 0.3), transparent)"
				/>

				<Flex
					h="full"
					justify="space-between"
					align="center"
					px={{ base: 4, md: 6 }}
				>
					{/* Logo */}
					<RouterLink to="/">
						<Flex align="center" gap={2}>
							<Box
								w="36px"
								h="36px"
								borderRadius="xl"
								bg="linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"
								display="flex"
								alignItems="center"
								justifyContent="center"
								className="pulse-glow"
							>
								<Icon as={HiOutlineSparkles} color="#0a0a0f" boxSize={4} />
							</Box>
							<Text
								fontSize="lg"
								fontWeight="bold"
								fontFamily="'Space Grotesk', sans-serif"
								className="text-gradient-cyber"
								display={{ base: "none", sm: "block" }}
							>
								SabiCash
							</Text>
						</Flex>
					</RouterLink>

					{/* Right side */}
					<Flex gap={3} align="center">
						{/* Balance displays */}
						{isConnected && (
							<Flex
								display={{ base: "none", lg: "flex" }}
								align="center"
								gap={3}
							>
								<BalanceCard label="SOL" value={solBalance} color="purple" />
								<BalanceCard label="SBC" value={sabiBalance} color="cyan" />
								{isLoggedIn && (
									<BalanceCard label="Points" value={userPoints} color="green" />
								)}
							</Flex>
						)}

						{/* Logout button */}
						{isLoggedIn && (
							<Button
								onClick={handleLogout}
								size="sm"
								bg="rgba(239, 68, 68, 0.1)"
								color="red.400"
								border="1px solid"
								borderColor="red.400"
								borderRadius="xl"
								px={4}
								leftIcon={<FaRightFromBracket />}
								_hover={{
									bg: "rgba(239, 68, 68, 0.2)",
									boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
								}}
								transition="all 0.3s ease"
								display={{ base: "none", md: "flex" }}
							>
								Logout
							</Button>
						)}

						{/* Login button */}
						{!isLoggedIn && (
							<Button
								onClick={() => setOpenLoginModal(true)}
								size="sm"
								bg="linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"
								color="#0a0a0f"
								borderRadius="xl"
								px={4}
								fontWeight="600"
								leftIcon={<FaUser />}
								_hover={{
									transform: "translateY(-1px)",
									boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
								}}
								transition="all 0.3s ease"
							>
								<Text display={{ base: "none", md: "block" }}>Login</Text>
							</Button>
						)}

						{/* Wallet button */}
						<WalletMultiButton
							style={{
								background: "rgba(15, 23, 42, 0.6)",
								backdropFilter: "blur(12px)",
								border: "1px solid rgba(255, 255, 255, 0.1)",
								borderRadius: "12px",
								padding: "8px 16px",
								fontWeight: "600",
								fontSize: "14px",
								height: "auto",
								color: "white",
								transition: "all 0.3s ease",
							}}
						/>

						{/* Mobile menu button */}
						<Button
							onClick={onToggleSidebar}
							display={{ base: "flex", md: "none" }}
							className="glass"
							color="white"
							borderRadius="xl"
							p={2}
							minW="auto"
							_hover={{
								bg: "rgba(0, 255, 255, 0.1)",
							}}
						>
							<Icon as={IoMenuSharp} boxSize={6} />
						</Button>
					</Flex>
				</Flex>
			</Box>
		</>
	);
};

export default DashboardNav;
