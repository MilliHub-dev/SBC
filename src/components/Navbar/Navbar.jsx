import React from "react";
import {
	Box,
	Button,
	Icon,
	Image,
	Link as ChakraLink,
	Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { CiMenuKebab } from "react-icons/ci";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaCircleUser } from "react-icons/fa6";

const Navbar = ({ setIsOpenNavbar }) => {
	return (
		<Box
			as={"nav"}
			display={"flex"}
			alignItems={"center"}
			justifyContent={{ base: `space-between`, md: `space-around` }}
			padding={"3rem 0rem"}
			fontSize={{ md: 18, base: 16 }}
		>
			<Box mt={0}>
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
				mt={2}
				display={{ base: "none", md: "flex" }}
				gap={6}
				alignItems={"center"}
				justifyContent={`space-between`}
				rounded={"sm"}
			>
				<ChakraLink
					href="#"
					outline={`none`}
					color={`#fff`}
					textDecoration={`none`}
					_hover={{ color: `#0088c6` }}
				>
					Comparison
				</ChakraLink>
				<ChakraLink
					href="#faq"
					outline={`none`}
					color={`#fff`}
					textDecoration={`none`}
					_hover={{ color: `#0088c6` }}
				>
					FAQ
				</ChakraLink>
				<ChakraLink
					href="#about"
					outline={`none`}
					color={`#fff`}
					textDecoration={`none`}
					_hover={{ color: `#0088c6` }}
				>
					About
				</ChakraLink>
				<ChakraLink
					href="#"
					outline={`none`}
					color={`#fff`}
					textDecoration={`none`}
					_hover={{ color: `#0088c6` }}
				>
					Socials
				</ChakraLink>
			</Box>
			<Box display={"flex"} alignItems={"center"} gap={3}>
				<ChakraLink
					as={Link}
					bg={{ base: "#0088CD" }}
					rounded={"lg"}
					color={`#fff`}
					padding={".46rem 1.2rem"}
					fontSize={18}
					to="/dashboard/start-mining"
					fontWeight={`600`}
				>
					<FaCircleUser />
					<Text display={{ base: `none`, md: `block` }}>Dashboard</Text>
				</ChakraLink>
				<Box display={{ base: `none`, md: `block` }} fontWeight={200}>
					<ConnectButton />
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
		</Box>
	);
};

export default Navbar;
