// import { sidebarImg } from "../../../assets/images/imagesData";
import { Box, Icon, Image, Link as ChakraLink, Text } from "@chakra-ui/react";
import React from "react";
import { IoMenuSharp } from "react-icons/io5";

import { Link, useLocation } from "react-router-dom";
import { RiQuestionLine } from "react-icons/ri";
import navigationItems from "./NavigationItems";
import NavItem from "./NavItem";
import { useAddress } from "@thirdweb-dev/react";
import { ADMIN_WALLET_ADDRESSES } from "../../../config/web3Config";

const DashboardSideNav = ({ sidebarWidth, isExpanded, onToggleSidebar }) => {
	const location = useLocation();
	const address = useAddress();

	const filteredNavItems = navigationItems.filter(item => {
		if (item.name === "admin") {
			return address && ADMIN_WALLET_ADDRESSES.map(a => a.toLowerCase()).includes(address.toLowerCase());
		}
		return true;
	});

	return (
		<Box
			position={"fixed"}
			left={0}
			top={"0px"}
			bottom={0}
			bg={"#000"}
			w={`${sidebarWidth}px`}
			transform={{
				base: `translateX(${isExpanded ? "initial" : "-200px"})`,
				md: "translateX(0)",
			}}
			borderRight={"1px solid"}
			borderColor={"gray.800"}
			transition={"all .3s ease-in-out"}
			zIndex={1000}
			overflowY={"auto"}
			overflowX={"hidden"}
		>
			<Box
				display={"flex"}
				height={"full"}
				overflow={"none"}
				flexDirection={"column"}
				justifyContent={"space-between"}
			>
				<Box>
					<Box
						height={"70px"}
						display={"flex"}
						justifyContent={`${isExpanded ? "start" : "center"}`}
						alignItems={"center"}
						borderBottom={"1px solid"}
						borderColor={"gray.800"}
						paddingInline={{
							base: `${isExpanded ? "1rem" : ".4rem"}`,
							md: `${isExpanded ? "2rem" : "1rem"}`,
						}}
					>
						<ChakraLink
							as={"button"}
							href="#"
							bg={"gray.900"}
							color={"#fff"}
							display={{
								base: "none",
								md: "block",
							}}
							padding={"10px 12px"}
							outline={"none"}
							transition={"background .1s ease-in"}
							_hover={{
								bg: "gray.800",
							}}
							onClick={onToggleSidebar}
						>
							<Icon as={IoMenuSharp} boxSize={5} />
						</ChakraLink>
						<Image
							src={"../Sabi-Cash.png"}
							alt="sabi cash logo"
							w={"170px"}
							display={{
								base: "block",
								md: "none",
							}}
							objectFit={"contain"}
						/>
					</Box>

					<Box
						display={"flex"}
						flexDirection={"column"}
						justifyContent={"center"}
						paddingInline={{
							base: `${isExpanded ? "2rem" : ".4rem"}`,
							md: `${isExpanded ? "2rem" : "1rem"}`,
						}}
						gap={2}
						py={5}
					>
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
					</Box>
					<Box
						marginInline={{
							base: `${isExpanded ? "2rem" : ".4rem"}`,
							md: `${isExpanded ? "2rem" : "1rem"}`,
						}}
						display={"flex"}
						alignItems={"center"}
						justifyContent={"center"}
						bg={"gray.800"}
						height={"1px"}
					></Box>
					<ChakraLink
						href="#"
						bg={"gray.900"}
						padding={"10px 12px"}
						my={"1rem"}
						marginInline={{
							base: `${isExpanded ? "2rem" : ".4rem"}`,
							md: `${isExpanded ? "2rem" : "1rem"}`,
						}}
						display={"flex"}
						alignItems={"center"}
						justifyContent={"center"}
						textDecoration={"none"}
						fontSize={14}
						color={"#fff"}
						fontWeight={"600"}
					>
						Docs
					</ChakraLink>
				</Box>

				<Box pb={10} alignSelf={"center"}>
					<ChakraLink
						href="#"
						outline={"none"}
						textDecoration={"none"}
						color={"#fff"}
					>
						<Icon as={RiQuestionLine} boxSize={5} />
						<Text
							whiteSpace={"nowrap"}
							opacity={isExpanded ? 1 : 0}
							transition={"opacity .3s ease"}
							width={isExpanded ? "auto" : "0"}
							fontWeight={"600"}
						>
							Help
						</Text>
					</ChakraLink>
				</Box>
			</Box>
		</Box>
	);
};

export default DashboardSideNav;
