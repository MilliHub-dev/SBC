import { Container } from "@chakra-ui/react";
import React from "react";
import Navbar from "./components/Navbar/Navbar";
import HeroSection from "./components/Hero/HeroSection";
import FAQ from "./components/FAQ/FAQ";
import Team from "./components/Team/Team";
import AboutSabiRide from "./components/About/AboutSabiRide";
import Footer from "./components/Footer/Footer";

const App = () => {
	return (
		<Container paddingInline={"1.4rem"}>
			<HeroSection />
			<FAQ />
			<Team />
			<AboutSabiRide />
			<Footer />
		</Container>
	);
};

export default App;
