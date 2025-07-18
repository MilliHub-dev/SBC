import {
  Box,
  BreadcrumbLink,
  Button,
  Container,
  Icon,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { FaWallet } from "react-icons/fa6";
import { IoMenuSharp } from "react-icons/io5";

const DashboardNav = ({ onToggleSidebar }) => {
  return (
    <Container
      fluid
      position={"fixed"}
      top={0}
      left={0}
      right={0}
      h={"70px"}
      bg={"#000"}
      borderBottom={"1px solid"}
      borderColor={"gray.800"}
      pl={{ base: 0, md: "50px" }}
      zIndex={997}
      shadow={"sm"}
    >
      <Box
        display={"flex"}
        h={"full"}
        justifyContent={"space-between"}
        alignItems={"center"}
        paddingInline={{ base: "1rem", md: "2rem" }}
      >
        <Box h={"full"} display={"flex"} alignItems={"center"}>
          <Image
            src={"../Sabi-Cash-logo-icon-dollar.png"}
            alt="sabi cash logo"
            mt={1}
            h={"inherit"}
            display={{ base: "block", md: "none" }}
            objectFit={"contain"}
          />
          <Image
            src={"../Sabi-Cash.png"}
            alt="sabi cash logo"
            w={"150px"}
            display={{ base: "none", md: "block" }}
            objectFit={"contain"}
          />
        </Box>
        <Box display={"flex"} gap={"3"} fontSize={14}>
          {/* <Button
            bg={"#0088CD"}
            rounded={"sm"}
            padding={".3rem 1rem"}
            color={"#fff"}
          >
            <Icon>
              <FaWallet />
            </Icon>
            Price History
          </Button> */}
          <Button
            bg={"gray.900"}
            rounded={"sm"}
            padding={".3rem 1rem"}
            color={"#fff"}
          >
            <Icon size={"sm"}>
              <FaWallet />
            </Icon>
            Connect Wallet
          </Button>
          <Link
            as={"button"}
            href="#"
            bg={"gray.900"}
            color={"#fff"}
            padding={"10px 12px"}
            display={{ base: "block", md: "none" }}
            outline={"none"}
            transition={"background .1s ease-in"}
            _hover={{ bg: "gray.800" }}
            onClick={onToggleSidebar}
          >
            <Icon size={"md"}>
              <IoMenuSharp />
            </Icon>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardNav;
