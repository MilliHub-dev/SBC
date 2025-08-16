import { Accordion, Box, Container, Span, Text } from "@chakra-ui/react";
import React from "react";
import CustomCard from "../CustomCard/CustomCard";
import { FaDiscord } from "react-icons/fa6";

const FAQ = () => {
	return (
		<Container display={"flex"} justifyContent={"center"} mt={20} fluid>
			<Box w={{ base: "full", md: "80%" }}>
				<Text
					as="h3"
					fontSize={"25px"}
					color={"#fff"}
					fontWeight={"400"}
					mb={"16px"}
				>
					Frequently Asked Questions?
				</Text>
				<Accordion.Root
					collapsible
					defaultValue={["b"]}
					bg={"blackAlpha.600"}
				>
					{items.map((item, index) => (
						<Accordion.Item
							key={index}
							value={item.value}
							padding={".73rem 1rem"}
							border={0}
							fontSize={"18px"}
							mb={2}
							bg={"blackAlpha.600"}
							cursor={"pointer"}
						>
							<Accordion.ItemTrigger>
								<Span flex="1">{item.title}</Span>
								<Accordion.ItemIndicator />
							</Accordion.ItemTrigger>
							<Accordion.ItemContent
								fontSize={"16px"}
								color={"gray.400"}
							>
								<Accordion.ItemBody>{item.text}</Accordion.ItemBody>
							</Accordion.ItemContent>
						</Accordion.Item>
					))}
				</Accordion.Root>
				<Box marginBlock={8}>
					<Text
						as="h3"
						fontSize={"20px"}
						color={"#fff"}
						fontWeight={"400"}
						mb={"16px"}
					>
						Still have a question?
					</Text>

					<CustomCard
						icon={<FaDiscord />}
						buttonTitle={"Join Discord"}
						cardQuestion={"Ask on our Discord Channel"}
					/>
				</Box>
			</Box>
		</Container>
	);
};

const items = [
	{
		value: "a",
		title: "What is Sabi Cash",
		text: "          Sabi Cash is the official cryptocurrency for the Sabi-Ride ecosystem. You can earn it through ride-to-earn rewards, referrals, and completing in-app tasks, and spend it to pay for rides or participate in staking and airdrops.",
	},
	{
		value: "b",
		title: "How can I earn Sabi Cash?",
		text: "          You can earn Sabi Cash by Taking trips on Sabi-Ride (earn based on distance), Referring new drivers or passengers, Completing promotional tasks like following our social media or downloading the app",
	},
	{
		value: "c",
		title: "How do I use my Sabi Cash?",
		text: "          You can use your Sabi Cash to pay for rides on Sabi-Ride, stake it in our dApp to earn rewards, participate in token presales, or swap it for other cryptocurrencies via our integrated exchange.",
	},
];

export default FAQ;
