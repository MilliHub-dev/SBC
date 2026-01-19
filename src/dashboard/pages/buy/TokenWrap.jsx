import { Avatar, Box, Flex, HStack, Text } from "@chakra-ui/react";
import React from "react";
import solanaLogo from "../../../assets/images/solana.png";

const TokenWrap = ({ balance, name, abv, tokenPrice }) => {
	return (
		<HStack
			justify="space-between"
			w="full"
			bg={"gray.900"}
			height={110}
			padding={"0 20px"}
			rounded={"md"}
		>
			<Box display={"flex"} alignItems={"center"} gap={3}>
				<Avatar.Root>
					<Avatar.Fallback name={name} />
					<Avatar.Image src={solanaLogo} />
				</Avatar.Root>
				<Flex flexDir={"column"} gap={1}>
					<Text fontWeight={600} fontSize={17}>
						{name}
					</Text>
					<Text color={"gray.500"} fontSize={14}>
						{abv}
					</Text>
				</Flex>
			</Box>
			<Flex flexDir={"column"} gap={1}>
				<Text fontWeight={600} fontSize={17}>
					{balance} {abv}
				</Text>
				{tokenPrice && (
					<Text color={"gray.500"} fontSize={14}>
						${tokenPrice}
					</Text>
				)}
			</Flex>
		</HStack>
	);
};

export default TokenWrap;
