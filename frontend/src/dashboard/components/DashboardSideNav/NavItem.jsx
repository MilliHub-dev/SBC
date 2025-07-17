import React from "react";
import { Box, Icon, Image, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Link } from "react-router";

const NavItem = ({ item, isExpanded, isActive }) => {
	const IconComponent = item.icon;
	return (
		<>
			<ChakraLink
				as={Link}
				to={`${item.path}`}
				padding={"11px 12px"}
				rounded={"sm"}
				gap={4}
				display={"flex"}
				alignItems={"center"}
				justifyContent={`${isExpanded ? "start" : "center"}`}
				transition={"background .1s ease-in"}
				textDecoration={"none"}
				outline={"none"}
				bg={isActive ? "gray.800" : ""}
				_hover={{
					bg: "gray.900",
				}}
			>
				<Box
					minW={"25px"}
					display={"flex"}
					justifyContent={"center"}
					ml={isExpanded ? 0 : 4}
				>
					<IconComponent size={21} />
				</Box>

				<Text
					whiteSpace={"nowrap"}
					opacity={isExpanded ? 1 : 0}
					textTransform={"capitalize"}
					transition={"opacity .3s ease"}
					width={isExpanded ? "auto" : "0"}
				>
					{item.name}
				</Text>
			</ChakraLink>
		</>
	);
};

export default NavItem;
