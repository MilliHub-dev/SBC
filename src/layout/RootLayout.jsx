import Navbar from "../components/Navbar/Navbar";
import { Box, Container } from "@chakra-ui/react";
import MobileNav from "../components/MobileNav/MobileNav";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
	const [openNavbar, setIsOpenNavbar] = useState(false);
	return (
		<Container
			fluid
			h={"100%"}
			display={"flex"}
			flexDirection={"column"}
			alignItems={"center"}
			overflowX={"hidden"}
		>
			<MobileNav openNavbar={openNavbar} setIsOpenNavbar={setIsOpenNavbar} />
			<Navbar setIsOpenNavbar={setIsOpenNavbar} />

			<Outlet />
		</Container>
	);
};

export default RootLayout;
