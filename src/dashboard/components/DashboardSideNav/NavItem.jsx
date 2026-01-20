import React from "react";
import { Box, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NavItem = ({ item, isExpanded, isActive }) => {
	const IconComponent = item.icon;
	return (
		<ChakraLink
			as={Link}
			to={`${item.path}`}
			px={3}
			py={3}
			borderRadius="xl"
			gap={3}
			display="flex"
			alignItems="center"
			justifyContent={isExpanded ? "flex-start" : "center"}
			transition="all 0.3s ease"
			textDecoration="none"
			outline="none"
			position="relative"
			overflow="hidden"
			bg={isActive ? "rgba(0, 255, 255, 0.1)" : "transparent"}
			borderLeft={isActive ? "2px solid" : "2px solid transparent"}
			borderColor={isActive ? "cyan.400" : "transparent"}
			color={isActive ? "cyan.400" : "whiteAlpha.700"}
			title={!isExpanded ? item.name : undefined}
			_hover={{
				bg: "rgba(0, 255, 255, 0.05)",
				color: "cyan.400",
				textDecoration: "none",
			}}
		>
			{/* Active indicator glow */}
			{isActive && (
				<Box
					position="absolute"
					left={0}
					top="50%"
					transform="translateY(-50%)"
					w="3px"
					h="60%"
					bg="cyan.400"
					borderRadius="full"
					boxShadow="0 0 10px rgba(0, 255, 255, 0.5)"
				/>
			)}

			<Box
				minW="24px"
				display="flex"
				justifyContent="center"
				color="inherit"
			>
				<IconComponent size={20} />
			</Box>

			<Text
				whiteSpace="nowrap"
				opacity={isExpanded ? 1 : 0}
				textTransform="capitalize"
				transition="opacity 0.3s ease"
				width={isExpanded ? "auto" : "0"}
				color="inherit"
				fontWeight={isActive ? "600" : "500"}
				fontSize="sm"
			>
				{item.name}
			</Text>
		</ChakraLink>
	);
};

export default NavItem;
