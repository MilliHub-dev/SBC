import Navbar from "../components/Navbar/Navbar";
import MobileNav from "../components/MobileNav/MobileNav";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Container } from "@chakra-ui/react";
import { Box } from "lucide-react";

const RootLayout = () => {
	const [openNavbar, setIsOpenNavbar] = useState(false);
	return (
		<Container
			bg={`blackAlpha.700`}
			fluid
			h={"100%"}
			display={"flex"}
			flexDirection={"column"}
			// alignItems={"center"}
			overflowX={"hidden"}
		>
			<MobileNav openNavbar={openNavbar} setIsOpenNavbar={setIsOpenNavbar} />
			<Navbar setIsOpenNavbar={setIsOpenNavbar} />

			<Outlet />
		</Container>
	);
};

export default RootLayout;
