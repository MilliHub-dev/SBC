import { Box, Icon, Image, Link as ChakraLink, Text, Flex } from "@chakra-ui/react";
import React from "react";
import { IoMenuSharp } from "react-icons/io5";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FaBook, FaQuestionCircle } from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";
import { RiQuestionLine } from "react-icons/ri";
import navigationItems from "./NavigationItems";
import NavItem from "./NavItem";
import { useWallet } from "@solana/wallet-adapter-react";
import { ADMIN_WALLET_ADDRESSES } from "../../../config/web3Config";

const DashboardSideNav = ({ sidebarWidth, isExpanded, onToggleSidebar }) => {
	const location = useLocation();
	const { publicKey } = useWallet();
	const address = publicKey ? publicKey.toString() : null;

	const filteredNavItems = navigationItems.filter(item => {
		if (item.name === "admin") {
			return address && ADMIN_WALLET_ADDRESSES.includes(address);
		}
		return true;
	});

	return (
		<Box
			position="fixed"
			left={0}
			top={0}
			bottom={0}
			bg="rgba(10, 10, 15, 0.95)"
			backdropFilter="blur(20px)"
			w={`${sidebarWidth}px`}
			transform={{
				base: `translateX(${isExpanded ? "0" : "-200px"})`,
				md: "translateX(0)",
			}}
			borderRight="1px solid rgba(0, 255, 255, 0.1)"
			transition="all 0.3s ease"
			zIndex={1000}
			overflowY="auto"
			overflowX="hidden"
		>
			{/* Right edge glow */}
			<Box
				position="absolute"
				top={0}
				right={0}
				bottom={0}
				w="1px"
				bg="linear-gradient(180deg, transparent, rgba(0, 255, 255, 0.3), rgba(168, 85, 247, 0.3), transparent)"
			/>

			<Flex
				h="full"
				direction="column"
				justify="space-between"
			>
				<Box>
					{/* Header */}
					<Flex
						h="70px"
						justify={isExpanded ? "space-between" : "center"}
						align="center"
						borderBottom="1px solid rgba(255, 255, 255, 0.05)"
						px={isExpanded ? 4 : 2}
					>
						{isExpanded ? (
							<Image
								src="/Sabi-Cash.png"
								alt="SabiCash Logo"
								h="56px"
								w="auto"
								objectFit="contain"
							/>
						) : (
							<Image
								src="/Sabi-Cash-logo-icon-dollar.png"
								alt="SabiCash Logo"
								h="48px"
								w="48px"
								objectFit="contain"
								borderRadius="lg"
							/>
						)}
						<Box
							as="button"
							onClick={onToggleSidebar}
							className="glass"
							p={2}
							borderRadius="lg"
							color="white"
							display={{ base: "none", md: "flex" }}
							alignItems="center"
							justifyContent="center"
							transition="all 0.3s ease"
							_hover={{
								bg: "rgba(0, 255, 255, 0.1)",
							}}
						>
							<Icon as={IoMenuSharp} boxSize={5} />
						</Box>
					</Flex>

					{/* Navigation Items */}
					<Box
						py={4}
						px={isExpanded ? 4 : 3}
					>
						<Flex direction="column" gap={2}>
							{filteredNavItems.map((item, index) => {
								const isActive = item.exact
									? location.pathname === item.path
									: location.pathname.startsWith(item.path);

								return (
									<NavItem
										key={index}
										isExpanded={isExpanded}
										isActive={isActive}
										item={item}
									/>
								);
							})}
						</Flex>
					</Box>

					{/* Divider */}
					<Box
						mx={isExpanded ? 4 : 3}
						h="1px"
						bg="linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent)"
					/>

					{/* Docs Link */}
					<Box px={isExpanded ? 4 : 3} py={4}>
						<ChakraLink
							href="#"
							display="flex"
							alignItems="center"
							justifyContent={isExpanded ? "flex-start" : "center"}
							gap={3}
							px={3}
							py={3}
							borderRadius="xl"
							className="glass"
							color="whiteAlpha.700"
							fontSize="sm"
							fontWeight="500"
							transition="all 0.3s ease"
							title={!isExpanded ? "Documentation" : undefined}
							_hover={{
								bg: "rgba(0, 255, 255, 0.1)",
								color: "cyan.400",
								textDecoration: "none",
							}}
						>
							<Icon as={FaBook} boxSize={4} />
							{isExpanded && <Text>Documentation</Text>}
						</ChakraLink>
					</Box>
				</Box>

				{/* Footer */}
				<Box pb={6} px={isExpanded ? 4 : 3}>
					<ChakraLink
						href="#"
						display="flex"
						alignItems="center"
						justifyContent={isExpanded ? "flex-start" : "center"}
						gap={3}
						px={3}
						py={3}
						borderRadius="xl"
						color="whiteAlpha.600"
						fontSize="sm"
						transition="all 0.3s ease"
						title={!isExpanded ? "Help & Support" : undefined}
						_hover={{
							bg: "rgba(0, 255, 255, 0.05)",
							color: "cyan.400",
							textDecoration: "none",
						}}
					>
						<Icon as={FaQuestionCircle} boxSize={4} />
						{isExpanded && <Text fontWeight="500">Help & Support</Text>}
					</ChakraLink>

					{/* Network status */}
					{isExpanded && (
						<Box
							mt={4}
							px={3}
							py={3}
							borderRadius="xl"
							className="glass"
						>
							<Flex align="center" gap={2}>
								<Box className="network-online" />
								<Text fontSize="xs" color="whiteAlpha.600">
									Solana Mainnet
								</Text>
							</Flex>
						</Box>
					)}
				</Box>
			</Flex>
		</Box>
	);
};

export default DashboardSideNav;
