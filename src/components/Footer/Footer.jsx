import { Box, Container, Link, Text } from "@chakra-ui/react";
import React from "react";

const Footer = () => {
	return (
		<Container
			display={"flex"}
			justifyContent={"center"}
			alignItems={"center"}
			mt={20}
			mb={5}
		>
			<Box
				w={{ base: "full", md: "80%" }}
				display={"flex"}
				justifyContent={"space-around"}
			>
				<Text as={"p"}>
					{" "}
					&copy; {new Date().getFullYear()} Sabi Ride, All rights reserved
				</Text>
				<Box display={"flex"} gap={5}>
					<Link href="#" textDecoration={"underline"} color={`white`}>
						Privacy policy
					</Link>
					<Link href="#" textDecoration={"underline"} color={`white`}>
						Terms & Conditions
					</Link>
				</Box>
			</Box>
		</Container>
	);
};

export default Footer;
