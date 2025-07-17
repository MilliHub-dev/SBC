import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { BiInfoCircle } from "react-icons/bi";
import { FaChevronUp } from "react-icons/fa6";

const MiningPackage = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Box
      padding={"1.5rem"}
      display={"flex"}
      flexDirection={"column"}
      gap={"4"}
      bg={"gray.800"}
      rounded={"md"}
    >
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Text fontSize={20}>Baby Chip</Text>
        <Image />
      </Flex>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Text color={"#0088CD"} fontWeight={"bold"} fontSize={30}>
          $25
        </Text>
        <Box color={"gray.500"} fontSize={20}>
          <Button
            bg={"gray.900"}
            padding={"1.5rem 1rem"}
            rounded={0}
            border={"1px solid"}
            borderColor={"gray.800"}
          >
            -
          </Button>
          <Button
            border={"0"}
            bg={"gray.900"}
            padding={"1.5rem 1rem"}
            rounded={0}
          >
            2
          </Button>
          <Button
            bg={"gray.900"}
            padding={"1.5rem 1rem"}
            rounded={0}
            border={"1px solid"}
            borderColor={"gray.800"}
          >
            +
          </Button>
        </Box>
      </Flex>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        bg={"gray.900"}
        padding={".5rem 1rem"}
        rounded={"sm"}
      >
        <Text color={"gray.500"}>APR:</Text>
        <Text color={"#0088CD"} fontSize={25} fontWeight={"bold"}>
          24.16%
        </Text>
      </Flex>
      <Flex
        gap={2}
        bg={"gray.900"}
        padding={".9rem 1rem"}
        rounded={"sm"}
        flexDirection={"column"}
        fontSize={16}
        color={"gray.500"}
      >
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Text>Total Est. Value After 3 Months:</Text>
          <Icon size={"lg"}>
            <BiInfoCircle />
          </Icon>
        </Flex>
        <Text fontWeight={"bold"} fontSize={25} color={"#fff"}>
          $26.51
        </Text>
        <Text>
          (Includes: $21.81 from retained cBTC + $4.70 from mined BTC) (BTC =
          $105,506.00 )
        </Text>
      </Flex>
      <Button
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        padding={"1.5rem 1rem"}
        color={"gray.500"}
        bg={"gray.900"}
        onClick={() => setShowDetails(!showDetails)}
      >
        Package Details
        <Icon size={"sm"}>
          <FaChevronUp width={5} height={5} />
        </Icon>
      </Button>
      <Box
        display={showDetails ? "flex" : "none"}
        flexDirection={"column"}
        gap={2}
        rounded={"sm"}
        bg={"gray.900"}
        padding={"1.1rem 1rem"}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Text>Mining Power:</Text>
          <Text>0.9969 TH/s</Text>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Text>Duration:</Text>
          <Text>3 Months</Text>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Text>Elextricity Cost:</Text>
          <Text>$0.0698/kwh</Text>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Text>Total Electricity Cost:</Text>
          <Text>$2.82</Text>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Text>Energy Discount:</Text>
          <Text>0.33%</Text>
        </Box>
      </Box>
      <Button padding={"1.5rem 1rem"} bg={"#0088CD"} color={"#fff"}>
        Select 25% Package
      </Button>
    </Box>
  );
};

export default MiningPackage;
