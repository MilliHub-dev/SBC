import { Box, Text } from "@chakra-ui/react";
import React from "react";

const SabiEstimate = () => {
  return (
    <Box
      display={"flex"}
      mt={20}
      justifyContent={"space-between"}
      alignItems={"start"}
      textAlign={"center"}
    >
      <Box>
        <Text
          as={"h3"}
          fontSize={{ base: "30px", md: "35px" }}
          fontWeight={"600"}
        >
          1.28M
        </Text>
        <Text
          as="span"
          color={"gray.500"}
          fontSize={{ base: "16px", md: "18px" }}
        >
          Sabi Cash Mined
        </Text>
      </Box>
      <Box>
        <Text
          as={"h3"}
          fontSize={{ base: "30px", md: "35px" }}
          fontWeight={"600"}
        >
          +300
        </Text>
        <Text
          as="span"
          color={"gray.500"}
          fontSize={{ base: "16px", md: "18px" }}
        >
          Served customers
        </Text>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"start"}
      >
        <Text
          as={"h3"}
          fontSize={{ base: "30px", md: "35px" }}
          fontWeight={"600"}
        >
          +200
        </Text>
        <Text
          as="span"
          color={"gray.500"}
          fontSize={{ base: "16px", md: "18px" }}
        >
          Sabi Cash Mined
        </Text>
      </Box>
      <Box>
        <Text
          as={"h3"}
          fontSize={{ base: "30px", md: "35px" }}
          fontWeight={"600"}
        >
          $100{" "}
        </Text>
        <Text
          as="span"
          color={"gray.500"}
          fontSize={{ base: "16px", md: "18px" }}
        >
          Previous TVL
        </Text>
      </Box>
    </Box>
  );
};

export default SabiEstimate;
