import React from "react";
import Navbar from "./components/Navbar/Navbar";
import HeroSection from "./components/Hero/HeroSection";
import FAQ from "./components/FAQ/FAQ";
import Team from "./components/Team/Team";
import AboutSabiRide from "./components/About/AboutSabiRide";
import Footer from "./components/Footer/Footer";

const App = () => {
	return (
		<div className="max-w-7xl mx-auto px-6">
			<HeroSection />
			<FAQ />
			<Team />
			<AboutSabiRide />
			<Footer />
		</div>
	);
};

export default App;
