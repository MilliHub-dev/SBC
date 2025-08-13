import {
	Box,
	Button,
	Container,
	Icon,
	Image,
	Link,
	Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaWallet, FaUser } from "react-icons/fa6";
import { IoMenuSharp } from "react-icons/io5";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWeb3 } from "../../../hooks/useWeb3";
import LoginModal from "../../../components/Login/LoginModal";
import { useNavigate } from "react-router-dom";

const DashboardNav = ({ onToggleSidebar }) => {
	// Navigating to routes
	const navigate = useNavigate();

	const {
		isConnected,
		address,
		isLoggedIn,
		userPoints,
		sabiBalance,
		ethBalance,
	} = useWeb3();
	const [openLoginModal, setOpenLoginModal] = useState(true);

	return (
		<>
			<LoginModal
				openLoginModal={openLoginModal}
				setOpenLoginModal={setOpenLoginModal}
			/>
			<Container
				fluid
				position={"fixed"}
				top={0}
				left={0}
				right={0}
				h={"70px"}
				bg={"#000"}
				borderBottom={"1px solid"}
				borderColor={"gray.800"}
				pl={{ base: 0, md: "50px" }}
				zIndex={997}
				shadow={"sm"}
			>
				<Box
					display={"flex"}
					h={"full"}
					justifyContent={"space-between"}
					alignItems={"center"}
					paddingInline={{ base: "1rem", md: "2rem" }}
				>
					<Box h={"full"} display={"flex"} alignItems={"center"}>
						<Button
							p={0}
							m={0}
							background={`transparent`}
							onClick={() => navigate(`/`)}
						>
							<Image
								src={"../Sabi-Cash-logo-icon-dollar.png"}
								alt="sabi cash logo"
								mt={1}
								h={"inherit"}
								display={{ base: "block", md: "none" }}
								objectFit={"contain"}
							/>
							<Image
								src={"../Sabi-Cash.png"}
								alt="sabi cash logo"
								w={"150px"}
								display={{ base: "none", md: "block" }}
								objectFit={"contain"}
							/>
						</Button>
					</Box>
					<Box
						display={"flex"}
						gap={"3"}
						fontSize={14}
						alignItems="center"
					>
						{isConnected && (
							<Box
								display={{ base: "none", md: "flex" }}
								alignItems="center"
								gap={3}
							>
								<Box textAlign="center">
									<Text fontSize="xs" color="gray.400">
										ETH
									</Text>
									<Text fontSize="sm" fontWeight="bold">
										{ethBalance}
									</Text>
								</Box>
								<Box textAlign="center">
									<Text fontSize="xs" color="gray.400">
										SABI
									</Text>
									<Text fontSize="sm" fontWeight="bold">
										{sabiBalance}
									</Text>
								</Box>
								{isLoggedIn && (
									<Box textAlign="center">
										<Text fontSize="xs" color="gray.400">
											Points
										</Text>
										<Text fontSize="sm" fontWeight="bold">
											{userPoints}
										</Text>
									</Box>
								)}
							</Box>
						)}

						{isConnected && !isLoggedIn && (
							<Button
								bg={"#0088CD"}
								rounded={"sm"}
								padding={".3rem 1rem"}
								color={"#fff"}
								onClick={() => setOpenLoginModal(true)}
								size="sm"
							>
								<Icon mr={2}>
									<FaUser />
								</Icon>
								Login to Sabi Ride
							</Button>
						)}

						<ConnectButton />

						<Link
							as={"button"}
							href="#"
							bg={"gray.900"}
							color={"#fff"}
							padding={"10px 12px"}
							display={{ base: "block", md: "none" }}
							outline={"none"}
							transition={"background .1s ease-in"}
							_hover={{ bg: "gray.800" }}
							onClick={onToggleSidebar}
						>
							<Icon size={"md"}>
								<IoMenuSharp />
							</Icon>
						</Link>
					</Box>
				</Box>
			</Container>
		</>
	);
};

export default DashboardNav;
