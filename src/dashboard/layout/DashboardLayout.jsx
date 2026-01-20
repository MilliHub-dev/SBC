import React from "react";
import DashboardNav from "../components/DashboardNav/DashboardNav";
import DashboardSideNav from "../components/DashboardSideNav/DashboardSideNav";
import { Box, Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import "../../index.css";
import { useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const DashboardLayout = () => {
	useScrollToTop();

	// State to manage sidebar width and expansion
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
		<Box
			bg="#0a0a0f"
			minH="100vh"
			position="relative"
			className="blockchain-grid"
		>
			{/* Background mesh gradient */}
			<Box
				position="fixed"
				top={0}
				left={0}
				right={0}
				bottom={0}
				pointerEvents="none"
				zIndex={0}
			>
				<Box
					position="absolute"
					top="10%"
					left="20%"
					w="400px"
					h="400px"
					bg="radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)"
					filter="blur(80px)"
				/>
				<Box
					position="absolute"
					bottom="20%"
					right="10%"
					w="500px"
					h="500px"
					bg="radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)"
					filter="blur(100px)"
				/>
				<Box
					position="absolute"
					top="50%"
					left="50%"
					transform="translate(-50%, -50%)"
					w="600px"
					h="600px"
					bg="radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)"
					filter="blur(100px)"
				/>
			</Box>

			{/* Backdrop Feature */}
			<Box
				position="fixed"
				display={isExpanded ? "block" : "none"}
				top="0"
				left={0}
				right={0}
				bottom={0}
				bg="rgba(0, 0, 0, 0.6)"
				backdropFilter="blur(4px)"
				zIndex={998}
				onClick={toggleSidebar}
				transition="all 0.3s ease"
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
				mt="70px"
				display="flex"
				justifyContent="center"
				transition="margin-left 0.3s ease"
				minH="calc(100vh - 70px)"
				position="relative"
				zIndex={1}
			>
				<Container
					maxW="1400px"
					py={{ base: 6, md: 10 }}
					px={{ base: 4, md: 6 }}
				>
					<Outlet />
				</Container>
			</Box>

			{/* Bottom data flow line */}
			<Box
				position="fixed"
				bottom={0}
				left={0}
				right={0}
				h="2px"
				overflow="hidden"
				zIndex={1000}
			>
				<Box className="data-line" />
			</Box>
		</Box>
	);
};

export default DashboardLayout;
