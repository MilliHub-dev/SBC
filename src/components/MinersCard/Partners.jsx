import { Box, Text, Flex } from "@chakra-ui/react";
import React from "react";

const Partners = () => {
	const partners = [
		{ name: "SabiRide", color: "#00FFFF" },
		{ name: "Sabi Drivers", color: "#A855F7" },
		{ name: "Millihub", color: "#10B981" },
		{ name: "Aeko", color: "#EC4899" },
	];

	return (
		<Box mt={20}>
			<Text as={"h3"} fontSize={"24px"} fontWeight={"400"} color={"whiteAlpha.600"} mb={6}>
				Our Partners:
			</Text>
			<Flex flexWrap={"wrap"} gap={{ base: 6, md: 10 }} align="center">
				{partners.map((partner, index) => (
					<Text
						key={index}
						fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
						fontWeight={"bold"}
						color={partner.color}
						fontFamily="'Space Grotesk', sans-serif"
						textShadow={`0 0 20px ${partner.color}40`}
						transition="all 0.3s ease"
						_hover={{
							textShadow: `0 0 30px ${partner.color}80`,
							transform: "scale(1.05)",
						}}
						cursor="default"
					>
						{partner.name}
					</Text>
				))}
			</Flex>
		</Box>
	);
};

export default Partners;
