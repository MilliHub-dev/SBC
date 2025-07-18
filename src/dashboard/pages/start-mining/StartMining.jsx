import MiningPackage from "../../../dashboard/components/MiningPackage/MiningPackage";
import { whatWeMine } from "../../../assets/images/imagesData";
import { Box, Button, Icon, Image, Text } from "@chakra-ui/react";
import React from "react";

const StartMining = () => {
  return (
    <Box>
      <Box
        bg={"gray.900"}
        rounded={"md"}
        padding={"2.3rem"}
        display={"flex"}
        flexDirection={"column"}
        gap={3}
      >
        <Text as={"p"} fontSize={18}>
          Step 1
        </Text>
        <Text as={"h2"} fontSize={20} fontWeight={"bold"}>
          Choose Currency to Mine
        </Text>

        <Box display={"flex"} alignItems={"center"} gap={2} flexWrap={"wrap"}>
          {whatWeMine.map((item) => {
            return (
              <Button
                key={item.crypto}
                fontSize={14}
                padding={"10px 15px"}
                rounded={"md"}
                bg={"transparent"}
                border={"1px solid"}
                borderColor={"gray.700"}
                color={"#fff"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                h={"full"}
              >
                <Icon size={"md"}>
                  <Image
                    height={"inherit"}
                    src={item.img}
                    alt={item.crypto}
                    objectFit={"contain"}
                  ></Image>
                </Icon>
                {item.name}
              </Button>
            );
          })}
        </Box>
      </Box>
      <Box display={"flex"} flexDirection={"column"} gap={3} padding={"2.3rem"}>
        <Text as={"p"}>Step 2</Text>
        <Text as={"h2"} fontSize={20} fontWeight={"bold"}>
          Select Mining Package
        </Text>
      </Box>

      <Box
        display={"grid"}
        gridTemplateColumns={"repeat(auto-fit, minmax(300px, 1fr))"}
        gap={5}
      >
        <MiningPackage />
        <MiningPackage />
        <MiningPackage />
      </Box>
    </Box>
  );
};

export default StartMining;
