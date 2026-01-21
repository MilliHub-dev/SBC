import { Container } from "@chakra-ui/react";
import React from "react";
import Navbar from "./components/Navbar/Navbar";
import HeroSection from "./components/Hero/HeroSection";
import FAQ from "./components/FAQ/FAQ";
import AboutSabiRide from "./components/About/AboutSabiRide";
import Footer from "./components/Footer/Footer";

const App = () => {
	return (
		<Container fluid p={0}>
			<HeroSection />
			<FAQ />
			<AboutSabiRide />
			<Footer />
		</Container>
	);
};

export default App;

// import React from "react";

// const App = () => {
// 	return (
// 		<div className="min-h-screen bg-gray-900 text-white p-8">
// 			<h1 className="text-4xl font-bold mb-4">SabiCash App</h1>
// 			<p className="text-lg">App is loading successfully!</p>
// 			<div className="mt-8 p-4 bg-gray-800 rounded">
// 				<p>If you see this, the app is working. We can now add components back one by one.</p>
// 			</div>
// 		</div>
// 	);
// };

// export default App;
