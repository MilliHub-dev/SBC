import { Box, Container, Image, Text } from "@chakra-ui/react";
import React from "react";
import Partners from "./Partners";
import SabiEstimate from "./SabiEstimate";

const MinersCard = () => {
  return (
    <Container w={{ md: "80%", base: "100%" }}>
      <Box
        display={"flex"}
        justifyContent={"space-around"}
        alignItems={"center"}
        mt={20}
        bg={"gray.800"}
        rounded={"lg"}
        padding={"1.5rem 2rem"}
        textAlign={"center"}
      >
        <Box>
          <Text
            as={"h3"}
            fontSize={{ base: "30px", md: "40px" }}
            fontWeight={"600"}
          >
            45.34%
          </Text>
          <Text
            as={"span"}
            fontSize={{ base: "16px", md: "20px" }}
            color={"gray.500"}
            fontWeight={"500"}
          >
            APR
          </Text>
        </Box>
        <Box>
          <Text
            as={"h3"}
            fontSize={{ base: "30px", md: "40px" }}
            fontWeight={"600"}
          >
            48.34%
          </Text>
          <Text
            as={"span"}
            fontSize={{ base: "16px", md: "20px" }}
            color={"gray.500"}
            fontWeight={"500"}
          >
            TVL
          </Text>
        </Box>
        <Box>
          <Text
            as={"h3"}
            fontSize={{ base: "30px", md: "40px" }}
            fontWeight={"600"}
          >
            45
          </Text>
          <Text
            as={"span"}
            fontSize={{ base: "16px", md: "20px" }}
            color={"gray.500"}
            fontWeight={"500"}
            textTransform={"capitalize"}
          >
            Active Miners
          </Text>
        </Box>
      </Box>
      <Partners />
      <SabiEstimate />
    </Container>
  );
};

export default MinersCard;
