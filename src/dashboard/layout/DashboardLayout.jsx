import React from "react";
import DashboardNav from "../components/DashboardNav/DashboardNav";
import DashboardSideNav from "../components/DashboardSideNav/DashboardSideNav";
import { Box, Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import "../../index.css";
import { useState } from "react";

const DashboardLayout = () => {
	const [sidebarWidth, setSidebarWidth] = useState(80);
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleSidebar = () => {
		if (isExpanded) {
			setSidebarWidth(80);
			setIsExpanded(false);
		} else {
			setSidebarWidth(280);
			setIsExpanded(true);
		}
	};

	return (
		<Container bg={"#000"} height={"100%"} fluid>
			{/* Backdrop Feature */}
			<Box
				position="fixed"
				display={isExpanded ? "block" : "none"}
				top="0"
				left={0}
				right={0}
				bottom={0}
				bg="blackAlpha.300"
				zIndex={998}
				onClick={toggleSidebar}
			/>

			{/* Dashboard Top Navigation */}
			<DashboardNav
				onToggleSidebar={toggleSidebar}
				setSidebarWidth={setSidebarWidth}
				sidebarWidth={sidebarWidth}
			/>

			{/* Dashboard Sidebar Navigation */}
			<DashboardSideNav
				onToggleSidebar={toggleSidebar}
				sidebarWidth={sidebarWidth}
				isExpanded={isExpanded}
			/>

			{/* Dashboard Main Content */}
			<Box
				ml={{ base: 0, md: "80px" }}
				mt={"60px"}
				display={"flex"}
				justifyContent={"center"}
				transition={"margin-left .3s ease"}
				minH={"calc(100vh)"}
				height={"100%"}
			>
				<Container
					// fluid
					// w={{ base: "100%", md: "85%" }}
					bg={"#000"}
					height={"100%"}
					py={16}
				>
					<Outlet />
				</Container>
			</Box>
		</Container>
	);
};

export default DashboardLayout;
