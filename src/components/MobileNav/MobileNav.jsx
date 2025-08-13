import { Box, Button, Container, Icon, Image, Link } from "@chakra-ui/react";
import React from "react";
import { CgClose } from "react-icons/cg";

const MobileNav = ({ openNavbar, setIsOpenNavbar }) => {
	return (
		<Container
			fluid
			position={"fixed"}
			transform={`translateX(${openNavbar ? 0 : "100%"})`}
			//   translateX={openNavbar ? "0" : "100%"}
			transition={"all .2s ease-in"}
			alignSelf={`center`}
			w={"full"}
			height={"100vh"}
			bg={"black"}
			padding={".9rem 1.5rem"}
			zIndex={"9999"}
		>
			<Box
				as={"nav"}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"space-between"}
			>
				<Box mt={2}>
					<Link href="#">
						<Image
							src="./Sabi-Cash.png"
							h={`50px`}
							alt="sabi ride"
							w={"200px"}
						/>
					</Link>
				</Box>
				<Button
					bg={"transparent"}
					color={"#fff"}
					onClick={() => setIsOpenNavbar(false)}
				>
					<Icon>
						<CgClose />
					</Icon>
				</Button>
			</Box>
			<Box>
				<Box
					display={"flex"}
					flexDirection={"column"}
					gap={5}
					mt={10}
					fontSize={"18px"}
				>
					<Link
						href="#"
						outline={"none"}
						padding={".6rem 0"}
						border={"none"}
						borderBottom={"3px solid gray"}
						borderWidth={"2px"}
						color={`white`}
						_hover={{ color: `#0088c6` }}
					>
						Comparison
					</Link>
					<Link
						href="#"
						outline={"none"}
						padding={".6rem 0"}
						border={"none"}
						borderBottom={"3px solid gray"}
						borderWidth={"2px"}
						color={`white`}
						_hover={{ color: `#0088c6` }}
					>
						FAQ
					</Link>
					<Link
						href="#"
						outline={"none"}
						padding={".6rem 0"}
						border={"none"}
						borderBottom={"3px solid gray"}
						borderWidth={"2px"}
						color={`white`}
						_hover={{ color: `#0088c6` }}
					>
						About
					</Link>
					<Link
						href="#"
						outline={"none"}
						padding={".6rem 0"}
						border={"none"}
						borderBottom={"3px solid gray"}
						borderWidth={"2px"}
						color={`white`}
						_hover={{ color: `#0088c6` }}
					>
						Team
					</Link>
					<Link
						href="#"
						outline={"none"}
						padding={".6rem 0"}
						border={"none"}
						borderBottom={"3px solid gray"}
						borderWidth={"2px"}
						color={`white`}
						_hover={{ color: `#0088c6` }}
					>
						Socials
					</Link>
				</Box>

				{/* <Box
					mt={20}
					display={"flex"}
					fontSize={"18px"}
					flexDirection={"column"}
					w={"full"}
					gap={3}
				>
					<Link
						w={"full"}
						outline={"none"}
						display={"flex"}
						justifyContent={"center"}
						href="#"
						bg={"#0088CD"}
						rounded={"sm"}
						padding={".7rem 1rem"}
					>
						Docs
					</Link>
					<Link
						w={"full"}
						outline={"none"}
						display={"flex"}
						justifyContent={"center"}
						href="#"
						bg={"#0088CD"}
						rounded={"sm"}
						padding={".7em 1rem"}
					>
						Help
					</Link>
				</Box> */}
			</Box>
		</Container>
	);
};

export default MobileNav;
