import React from "react";
import {
	Box,
	Button,
	Container,
	Icon,
	Image,
	Link as ChakraLink,
	Text,
} from "@chakra-ui/react";
import { Link } from "react-router";
import { LuMoon, LuSun } from "react-icons/lu";
import { CiMenuKebab } from "react-icons/ci";
// import { useColorMode, useColorModeValue } from "../ui/color-mode";

const Navbar = ({ setIsOpenNavbar }) => {
	// const { colorMode, toggleColorMode } = useColorMode();
	return (
		<Box
			as={"nav"}
			display={"flex"}
			alignItems={"center"}
			justifyContent={{ base: "center", md: "center" }}
			gap={10}
			// background={"red"}
			padding={"3rem 1rem"}
			//   height={"100px"}
			fontSize={{ md: 18, base: 16 }}
		>
			<Box mt={2}>
				<Link href="#">
					<Image
						src="./Sabi-Cash.png"
						alt="sabi cash"
						h={"40px"}
						w={"200px"}
					/>
				</Link>
			</Box>
			<Box
				display={{ base: "none", md: "flex" }}
				gap={3}
				alignItems={"center"}
				bg={"gray.800"}
				padding={".3rem 1rem"}
				rounded={"sm"}
			>
				<Link href="#">Comparison</Link>
				<Link href="#">FAQ</Link>
				<Link href="#">About</Link>
				<Link href="#">Socials</Link>
			</Box>
			<Box display={"flex"} alignItems={"center"} gap={8}>
				<ChakraLink
					as={Link}
					bg={{ base: "#0088CD", md: "transparent" }}
					rounded={"sm"}
					padding={".3rem 1rem"}
					to="/dashboard/start-mining"
				>
					Dashboard
				</ChakraLink>
				<Box
					display={{ base: "none", md: "flex" }}
					alignItems={"center"}
					gap={3}
				>
					<ChakraLink
						href="#"
						bg={"#0088CD"}
						rounded={"sm"}
						padding={".3rem 1rem"}
					>
						Docs
					</ChakraLink>
					<ChakraLink
						href="#"
						bg={"#0088CD"}
						rounded={"sm"}
						padding={".3rem 1rem"}
					>
						Help
					</ChakraLink>
				</Box>
				{/* <Button
          padding={".3rem 1rem"}
          onClick={toggleColorMode}
          bg={useColorModeValue("gray.300", "gray.700")}
          variant={"ghost"}
        >
          {colorMode === "light" ? <LuMoon /> : <LuSun size={20} />}
        </Button> */}
			</Box>
			<Button
				onClick={() => setIsOpenNavbar(true)}
				bg={"blackAlpha.700"}
				color={"#fff"}
				display={{ base: "flex", md: "none" }}
			>
				<Icon size={"lg"}>
					<CiMenuKebab />
				</Icon>
			</Button>
		</Box>
	);
};

export default Navbar;
