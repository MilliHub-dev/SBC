import React from "react";
import { cryptoImgData } from "../../assets/images/imagesData";
import MinersCard from "../MinersCard/MinersCard";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWeb3 } from "../../hooks/useWeb3";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const HeroSection = () => {
	const { isConnected, address } = useWeb3();
	const navigate = useNavigate();

	const handleDashboardClick = () => {
		navigate('/dashboard');
	};

	return (
		<div className="container mx-auto px-4 mt-5">
			<div className="flex flex-col justify-center items-center gap-10">
				<div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-4">
					<h1 className="text-3xl md:text-4xl font-bold">
						Welcome to Sabi Cash
					</h1>
					<h1 className="text-3xl md:text-4xl font-bold">
						The Future of Mobility and Rewards.
					</h1>
					<h1 className="text-4xl md:text-5xl font-bold text-brand">
						Ride Earn Repeat
					</h1>
					<p className="text-base md:text-xl font-medium mb-4 text-muted-foreground">
						Sabi Cash is the official crypto token powering the Sabi Ride
						ecosystem. Whether you're a passenger or a driver, you earn
						rewards for every ride and activity. Get rewarded for moving
						the world.
					</p>
				</div>
				
				<div className="flex justify-center items-center flex-wrap gap-3">
					{cryptoImgData.map((images, index) => {
						return (
							<img
								className="h-12 md:h-16 object-contain"
								key={index}
								src={images.img}
								alt={images.title}
							/>
						);
					})}
				</div>
				
				<div className="px-6 flex items-center font-medium gap-4 md:gap-10 flex-col md:flex-row">

					{!isConnected ? (
						<>
							<ConnectButton />
							<Button
								className="py-6 px-6"
								variant="secondary"
							>
								Join Community
							</Button>
						</>
					) : (
						<>

							<div className="flex items-center gap-4 flex-col md:flex-row">
								<span className="text-sm text-muted-foreground">
									Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
								</span>
								<Button
									className="py-6 px-6"
									variant="brand"
									onClick={handleDashboardClick}
								>
									Go to Dashboard
								</Button>
								<ConnectButton />
							</div>
						</>
					)}
				</div>

				<MinersCard />
			</div>
		</div>
	);
};

export default HeroSection;
