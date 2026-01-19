import React, { useState } from "react";
import {
	Box,
	Button,
	Icon,
	Image,
	Link as ChakraLink,
	Text,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { CiMenuKebab } from "react-icons/ci";
import { ConnectWallet } from "@thirdweb-dev/react";
import { FaCircleUser } from "react-icons/fa6";
import LoginModal from "../Login/LoginModal";
import { useWeb3 } from "../../hooks/useWeb3";

const Navbar = ({ setIsOpenNavbar }) => {
	const [openLoginModal, setOpenLoginModal] = useState(false);
	const { isLoggedIn } = useWeb3();
	const navigate = useNavigate();

	const handleDashboardClick = () => {
		if (isLoggedIn) {
			navigate("/dashboard");
		} else {
			setOpenLoginModal(true);
		}
	};

	return (
		<>
			<LoginModal
				openLoginModal={openLoginModal}
				setOpenLoginModal={setOpenLoginModal}
			/>
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
					bg={{ base: "#0088CD" }}
					rounded={"lg"}
					color={`#fff`}
					padding={".46rem 1.2rem"}
					fontSize={18}
					onClick={handleDashboardClick}
					cursor="pointer"
					fontWeight={`600`}
					_hover={{ textDecoration: 'none', bg: "#0077B6" }}
				>
					<FaCircleUser />
					<Text display={{ base: `none`, md: `block` }}>Dashboard</Text>
				</ChakraLink>
				{!isLoggedIn && (
					<Button
						onClick={() => setOpenLoginModal(true)}
						bg={"#0088CD"}
						color={"#fff"}
						rounded={"lg"}
						padding={".46rem 1.2rem"}
						fontSize={18}
						fontWeight={`600`}
						_hover={{ bg: "#0077B6" }}
						display={{ base: "none", md: "flex" }}
						gap={2}
					>
						<FaCircleUser />
						Login
					</Button>
				)}
				<Box display={{ base: `none`, md: `block` }} fontWeight={200}>
					<ConnectWallet theme="dark" btnTitle="Connect Wallet" />
				</Box>
				<Button
					onClick={() => setIsOpenNavbar(true)}
					bg={"blackAlpha.700"}
					color={"#fff"}
					display={{ base: "flex", md: "none" }}
				>
					<Icon as={CiMenuKebab} boxSize={5} />
				</Button>
			</Box>
		</Box>
		</>
	);
};

export default Navbar;
