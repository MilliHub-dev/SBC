import {
  Box,
  Container,
  Grid,
  Image,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import React from "react";

const teamData = [
  {
    name: "Dr Mili",
    img: "./demoMember.png",
    title: "CEO",
  },
  {
    name: "Rose",
    img: "./demoMember.png",
    title: "HR",
  },
  {
    name: "Ridwan",
    img: "./demoMember.png",
    title: "Frontend Developer",
  },
  {
    name: "Ridwan",
    img: "./demoMember.png",
    title: "Frontend Developer",
  },
];

const Team = () => {
  return (
    <Container
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      mt={20}
    >
      <Box w={{ base: "full", md: "80%" }}>
        <Text fontSize={"25px"} color={"#fff"} fontWeight={"400"} mb={"16px"}>
          Team
        </Text>
        <Grid
          w={"full"}
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
          gap={"4"}
          // display={"flex"}
          // flexWrap={"wrap"}
          // alignItems={"center"}
          // justifyContent={"space-between"}
        >
          {teamData.map((teamMember, index) => {
            return (
              <Box
                key={index}
                display={"flex"}
                flexDirection={"column"}
                gap={2}
                maxW={"300px"}
                // maxH={"200px"}
              >
                <Box bg={"gray"} rounded={"sm"}>
                  <Image
                    src={teamMember.img}
                    alt={teamMember.name}
                    h={"full"}
                    w={"full"}
                    objectFit={"contain"}
                    rounded={"md"}
                  />
                </Box>
                <Box padding={".7rem .1rem"}>
                  <Text as={"h3"} fontSize={"20px"} fontWeight={"500"}>
                    {teamMember.name}
                  </Text>
                  <Text as={"p"} color={"gray.500"} fontSize={"17x"}>
                    {teamMember.title}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};

export default Team;
