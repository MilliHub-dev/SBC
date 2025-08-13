import { Box, Heading, Icon, Text } from "@chakra-ui/react";
import React from "react";

const SimpleHeading = ({ icon, headingTitle, headingDesc }) => {
	const IconComponent = icon;
	return (
		<Box textAlign="center" mb={4}>
			<Heading
				as={"h1"}
				display={"flex"}
				justifyContent={"center"}
				fontSize={"28px"}
				fontWeight={600}
				gap={3}
				mb={4}
			>
				{icon && (
					<Icon color={"#0088CD"}>
						<IconComponent />
					</Icon>
				)}
				{headingTitle}
			</Heading>
			<Text color="gray.500" fontSize={16}>
				{headingDesc}
			</Text>
		</Box>
	);
};

export default SimpleHeading;
