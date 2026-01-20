import { Box, Container, Text, Flex, Icon } from "@chakra-ui/react";
import React from "react";
import Partners from "./Partners";
import SabiEstimate from "./SabiEstimate";
import { FaPercentage, FaChartPie, FaUsers, FaCubes } from "react-icons/fa";

const StatItem = ({ value, label, icon, color = "cyan" }) => (
	<Box
		className="stat-card"
		flex="1"
		minW={{ base: "140px", md: "180px" }}
		textAlign="center"
		position="relative"
		overflow="hidden"
	>
		{/* Glow effect */}
		<Box
			position="absolute"
			top="-50%"
			left="50%"
			transform="translateX(-50%)"
			w="100px"
			h="100px"
			bg={`radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, transparent 70%)`}
			filter="blur(20px)"
			pointerEvents="none"
		/>

		<Flex direction="column" align="center" gap={2} position="relative" zIndex={1}>
			<Icon
				as={icon}
				boxSize={{ base: 5, md: 6 }}
				color={`${color}.400`}
				mb={1}
			/>
			<Text
				fontSize={{ base: "1.5rem", md: "2.5rem" }}
				fontWeight="bold"
				className="text-gradient-cyber"
				fontFamily="'Space Grotesk', sans-serif"
			>
				{value}
			</Text>
			<Text
				fontSize={{ base: "xs", md: "sm" }}
				color="whiteAlpha.600"
				fontWeight="medium"
				textTransform="uppercase"
				letterSpacing="wider"
			>
				{label}
			</Text>
		</Flex>
	</Box>
);

const MinersCard = () => {
	const stats = [
		{ value: "45.34%", label: "APR", icon: FaPercentage, color: "cyan" },
		{ value: "$2.1M", label: "TVL", icon: FaChartPie, color: "purple" },
		{ value: "1,245", label: "Active Miners", icon: FaUsers, color: "green" },
		{ value: "50K+", label: "Blocks Mined", icon: FaCubes, color: "pink" },
	];

	return (
		<Container maxW="1200px" p={0}>
			{/* Stats Grid */}
			<Box
				className="blockchain-card"
				p={{ base: 4, md: 6 }}
				position="relative"
				overflow="hidden"
			>
				{/* Animated top border */}
				<Box
					position="absolute"
					top={0}
					left={0}
					right={0}
					h="2px"
					overflow="hidden"
				>
					<Box className="data-line" />
				</Box>

				<Flex
					justify="space-around"
					align="stretch"
					flexWrap="wrap"
					gap={{ base: 3, md: 4 }}
				>
					{stats.map((stat, index) => (
						<StatItem
							key={index}
							value={stat.value}
							label={stat.label}
							icon={stat.icon}
							color={stat.color}
						/>
					))}
				</Flex>

				{/* Animated bottom border */}
				<Box
					position="absolute"
					bottom={0}
					left={0}
					right={0}
					h="2px"
					overflow="hidden"
				>
					<Box className="data-line" style={{ animationDelay: "1.5s" }} />
				</Box>
			</Box>

			<Partners />
			<SabiEstimate />
		</Container>
	);
};

export default MinersCard;
