import Navbar from "../components/Navbar/Navbar";
import MobileNav from "../components/MobileNav/MobileNav";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
	const [openNavbar, setIsOpenNavbar] = useState(false);
	return (
		<div className="min-h-screen flex flex-col items-center overflow-x-hidden">
			<MobileNav openNavbar={openNavbar} setIsOpenNavbar={setIsOpenNavbar} />
			<Navbar setIsOpenNavbar={setIsOpenNavbar} />

			<Outlet />
		</div>
	);
};

export default RootLayout;
