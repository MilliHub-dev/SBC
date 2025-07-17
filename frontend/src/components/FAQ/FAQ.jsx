import { Accordion, Box, Container, Span, Text } from "@chakra-ui/react";
import React from "react";
import CustomCard from "../CustomCard/CustomCard";
import { FaDiscord } from "react-icons/fa6";

const FAQ = () => {
  return (
    <Container display={"flex"} justifyContent={"center"} mt={20}>
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
        <Accordion.Root collapsible defaultValue={["b"]}>
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
              <Accordion.ItemContent fontSize={"16px"} color={"gray.400"}>
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
    text: "          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nemo at, earum necessitatibus distinctio voluptatibus voluptates.",
  },
  {
    value: "b",
    title: "What is Sabi Cash",
    text: "          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nemo at, earum necessitatibus distinctio voluptatibus voluptates.",
  },
  {
    value: "c",
    title: "What is Sabi Cash",
    text: "          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nemo at, earum necessitatibus distinctio voluptatibus voluptates.",
  },
];

export default FAQ;
