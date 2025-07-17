import { Box, Button, Container, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { FaDiscord } from "react-icons/fa";

const CustomCard = ({ buttonTitle, icon, cardQuestion, cardText }) => {
	return (
		<Container
			display={"flex"}
			alignItems={"center"}
			justifyContent={"center"}
		>
			<Box
				w={{ base: "100%", md: "100%" }}
				bg={"blackAlpha.500"}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"space-between"}
				gap={5}
				padding={"1.2rem 1.7rem"}
				rounded={"md"}
			>
				<Box display={"flex"} alignItems={"center"} gap={5}>
					<Icon
						size={"sm"}
						rounded={"md"}
						bg={"gray.900"}
						height={"50px"}
						w={{ base: "30px", md: "50px" }}
						padding={"0 .8em"}
					>
						{icon}
					</Icon>
					<Box display={"flex"} flexDirection={"column"} gap={1}>
						<Text
							as={"p"}
							fontSize={{ base: "15px", md: "20px" }}
							fontWeight={"600"}
						>
							{cardQuestion}
						</Text>
						<Text
							as={"span"}
							fontSize={{ base: "13px", md: "16px" }}
							color={"gray.600"}
						>
							{cardText}
						</Text>
					</Box>
				</Box>
				<Button
					rounded={"md"}
					bg={"#fff"}
					fontSize={{ base: "12px", md: "15px" }}
					color={"#000"}
					fontWeight={"500"}
					padding={".5rem .8em"}
				>
					{buttonTitle}
				</Button>
			</Box>
		</Container>
	);
};

export default CustomCard;
