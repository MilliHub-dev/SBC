import MiningPackage from "../../../dashboard/components/MiningPackage/MiningPackage";
import { whatWeMine } from "../../../assets/images/imagesData";
import { Box, Button, Icon, Image, Text, Alert, Flex } from "@chakra-ui/react";
import React, { useState } from "react";
import { useWeb3 } from "../../../hooks/useWeb3";
import { FaExclamationTriangle } from "react-icons/fa";

const StartMining = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("polygon");
  const { isConnected, address } = useWeb3();

  // Different mining packages with varying specifications
  const miningPackages = [
    {
      name: "Baby Chip",
      price: 25,
      apr: 24.16,
      duration: 3,
      hashpower: "0.9969 TH/s",
      electricityCost: "$0.0698/kwh",
      totalElectricityCost: "$2.82",
      energyDiscount: "0.33%",
      estimatedValue: 26.51,
      retainedAmount: 21.81,
      minedAmount: 4.70,
      btcPrice: 105506.00
    },
    {
      name: "Standard Chip",
      price: 50,
      apr: 26.34,
      duration: 3,
      hashpower: "2.1547 TH/s",
      electricityCost: "$0.0685/kwh",
      totalElectricityCost: "$5.89",
      energyDiscount: "0.65%",
      estimatedValue: 55.42,
      retainedAmount: 45.67,
      minedAmount: 9.75,
      btcPrice: 105506.00
    },
    {
      name: "Pro Chip",
      price: 100,
      apr: 28.92,
      duration: 3,
      hashpower: "4.7829 TH/s",
      electricityCost: "$0.0672/kwh",
      totalElectricityCost: "$11.23",
      energyDiscount: "1.25%",
      estimatedValue: 118.94,
      retainedAmount: 98.45,
      minedAmount: 20.49,
      btcPrice: 105506.00
    }
  ];

  return (
    <Box>
      {!isConnected && (
        <Alert status="warning" mb={6} rounded="md">
          <Icon color="orange.500" mr={2}>
            <FaExclamationTriangle />
          </Icon>
          <Text>Please connect your wallet to start mining and make purchases.</Text>
        </Alert>
      )}

      <Box
        bg={"gray.900"}
        rounded={"md"}
        padding={"2.3rem"}
        display={"flex"}
        flexDirection={"column"}
        gap={3}
        mb={6}
      >
        <Text as={"p"} fontSize={18} color={"gray.400"}>
          Step 1
        </Text>
        <Text as={"h2"} fontSize={20} fontWeight={"bold"}>
          Choose Currency to Mine
        </Text>

        <Box display={"flex"} alignItems={"center"} gap={2} flexWrap={"wrap"}>
          {whatWeMine.map((item) => {
            const isSelected = selectedCurrency === item.crypto;
            return (
              <Button
                key={item.crypto}
                fontSize={14}
                padding={"10px 15px"}
                rounded={"md"}
                bg={isSelected ? "#0088CD" : "transparent"}
                border={"1px solid"}
                borderColor={isSelected ? "#0088CD" : "gray.700"}
                color={isSelected ? "#fff" : "#fff"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                h={"full"}
                gap={2}
                onClick={() => setSelectedCurrency(item.crypto)}
                _hover={{
                  bg: isSelected ? "#0077B3" : "gray.800",
                  borderColor: "#0088CD"
                }}
                transition={"all 0.2s"}
              >
                <Icon size={"md"}>
                  <Image
                    height={"20px"}
                    width={"20px"}
                    src={item.img}
                    alt={item.crypto}
                    objectFit={"contain"}
                  />
                </Icon>
                {item.name}
              </Button>
            );
          })}
        </Box>

        {selectedCurrency && (
          <Box mt={3} p={3} bg={"gray.800"} rounded={"md"}>
            <Text fontSize={"sm"} color={"gray.400"}>
              Selected currency: <Text as="span" fontWeight="bold" color="#0088CD">{selectedCurrency}</Text>
            </Text>
            <Text fontSize={"xs"} color={"gray.500"} mt={1}>
              Mining rewards will be distributed in the selected cryptocurrency
            </Text>
          </Box>
        )}
      </Box>

      <Box display={"flex"} flexDirection={"column"} gap={3} padding={"2.3rem"} pt={0}>
        <Text as={"p"} color={"gray.400"}>Step 2</Text>
        <Text as={"h2"} fontSize={20} fontWeight={"bold"}>
          Select Mining Package
        </Text>
        <Text fontSize={"sm"} color={"gray.500"}>
          Choose from our range of mining packages with different hash rates and returns
        </Text>
      </Box>

      <Box
        display={"grid"}
        gridTemplateColumns={"repeat(auto-fit, minmax(300px, 1fr))"}
        gap={5}
        px={8}
      >
        {miningPackages.map((packageData, index) => (
          <MiningPackage key={index} packageData={packageData} />
        ))}
      </Box>

      {isConnected && (
        <Box mt={8} p={6} bg={"gray.900"} rounded={"md"} mx={8}>
          <Flex alignItems={"center"} gap={3} mb={4}>
            <Icon color={"green.400"}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </Icon>
            <Text fontWeight={"bold"} color={"green.400"}>Wallet Connected</Text>
          </Flex>
          <Text fontSize={"sm"} color={"gray.400"}>
            Address: {address}
          </Text>
          <Text fontSize={"sm"} color={"gray.500"} mt={2}>
            You can now purchase mining packages and start earning rewards!
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default StartMining;
