import {
	Box,
	Button,
	Icon,
	Input,
	Text,
	Collapsible,
	IconButton,
	Image,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaArrowDown, FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";

const BuyTokens = () => {
	const [isCollapsibleOpen, setIsCollapasibleOpen] = useState(null);
	return (
		<Box
			display={"flex"}
			alignItems={"center"}
			justifyContent={"center"}
			w={"full"}
		>
			<Box
				w={{ base: "80%", md: "40%" }}
				bg={"gray.900"}
				padding={"2rem 1.8rem"}
				rounded={"lg"}
				display={"flex"}
				flexDir={"column"}
				gap={5}
			>
				<Box
					display={"flex"}
					justifyContent={"space-between"}
					alignItems={"center"}
				>
					<Box>
						<Text as={"h2"} fontSize={20} fontWeight={"bold"}>
							Buy Crypto
						</Text>
						<Text mt={3} fontSize={18}>
							Buy crypto in just a few clicks
						</Text>
					</Box>
					<Button bg={"transparent"} border={"none"} color={"#0088CD"}>
						<Icon height={"70px"} width={"35px"}>
							<IoMdRefresh />
						</Icon>
					</Button>
				</Box>

				{/* Crypto Inputs */}
				<Box>
					<Box
						display={"flex"}
						justifyContent={"space-between"}
						alignItems={"center"}
						bg={"gray.800"}
						padding={".35rem .2rem"}
						rounded={"lg"}
					>
						<Input
							type="text"
							placeholder="000"
							w={"1/2"}
							outline={"none"}
							focusRing={"none"}
							border={0}
							paddingInline={"1rem"}
						/>
						<Box w={"1px"} height={"30px"} bg={"gray.700"}></Box>
						<Button w={"1/2"} bg={"transparent"}>
							<Box
								height={"full"}
								display={"flex"}
								alignItems={"center"}
							>
								<Image
									src={"../Sabi-Cash-logo-icon-dollar.png"}
									w={10}
									height={"full"}
								/>
								<Text fontWeight={""}>Sabi Cash</Text>
							</Box>
							<FaChevronDown style={{ width: "20px", height: "10px" }} />
						</Button>
					</Box>
					<Box
						justifySelf={"center"}
						bg={"gray.800"}
						padding={".34rem"}
						rounded={"full"}
						// marginBlock={1}
					>
						<Icon size={"md"}>
							<FaArrowDown />
						</Icon>
					</Box>
					<Box
						display={"flex"}
						justifyContent={"space-between"}
						alignItems={"center"}
						bg={"gray.800"}
						padding={".35rem .2rem"}
						rounded={"lg"}
					>
						<Input
							type="text"
							placeholder="000"
							w={"1/2"}
							outline={"none"}
							focusRing={"none"}
							border={0}
							paddingInline={"1rem"}
						/>
						<Box w={"1px"} height={"30px"} bg={"gray.700"}></Box>
						<Button w={"1/2"} bg={"transparent"}>
							<Box
								height={"full"}
								display={"flex"}
								alignItems={"center"}
							>
								<Image
									src={"../Sabi-Cash-logo-icon-dollar.png"}
									w={10}
									height={"full"}
								/>
								<Text fontWeight={""}>Sabi Cash</Text>
							</Box>
							<FaChevronDown style={{ width: "20px", height: "10px" }} />
						</Button>
					</Box>
				</Box>

				{/* Choosen Crypto */}
				<Box
					alignSelf={"center"}
					display={"flex"}
					alignItems={"center"}
					justifyContent={"center"}
					bg={"gray.700"}
					rounded={"full"}
					padding={".2rem 2rem"}
				>
					<IconButton bg={"transparent"} p={0}>
						e
					</IconButton>
					<Text>Sabi Cash</Text>
				</Box>

				{/* Fees Details  */}

				<Collapsible.Root
					unmountOnExit
					onOpenChange={(e) => setIsCollapasibleOpen(e.open)}
				>
					<Collapsible.Trigger
						paddingY="3"
						paddingX={3}
						mb={2}
						display={"flex"}
						alignItems={"center"}
						justifyContent={"space-between"}
						w={"full"}
						rounded={"lg"}
						border={"1px dotted"}
						borderColor={"gray.700"}
					>
						<Text>Est total fees: $5.55</Text>
						<Text
							display={"flex"}
							alignItems={"center"}
							gap={2}
							color={"#0088CD"}
							fontWeight={"bold"}
							fontSize={15}
						>
							<Text>
								{isCollapsibleOpen ? "Hide Details" : "Show Details"}
							</Text>
							{isCollapsibleOpen ? (
								<FaChevronDown
									style={{ width: "20px", height: "14px" }}
								/>
							) : (
								<FaChevronUp
									style={{ width: "20px", height: "14px" }}
								/>
							)}
						</Text>
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Box
							padding="4"
							border={"1px dotted"}
							borderColor={"gray.700"}
							rounded={"lg"}
						>
							<Box
								display={"flex"}
								justifyContent={"space-between"}
								alignItems={"center"}
								mb={1}
							>
								<Text color={"gray.700"}>Provider Fees</Text>
								<Text fontWeight={"bold"}>${4.99}</Text>
							</Box>
							<Box
								display={"flex"}
								justifyContent={"space-between"}
								alignItems={"center"}
							>
								<Text color={"gray.700"}>Sabi Cash Fees</Text>
								<Text fontWeight={"bold"}>${1.99}</Text>
							</Box>
						</Box>
					</Collapsible.Content>
				</Collapsible.Root>

				{/* Connect Wallet Button=  */}
				<Box>
					<Button
						bg={"#0088CD"}
						w={"full"}
						rounded={"lg"}
						fontWeight={"bold"}
						padding={"22px 12px"}
					>
						Connect Wallet
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default BuyTokens;
