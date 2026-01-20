import { Accordion, Box, Container, Span, Text, Flex, Icon, Button } from "@chakra-ui/react";
import React from "react";
import { FaDiscord, FaPlus, FaMinus, FaQuestionCircle } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

const FAQ = () => {
	return (
		<Box id="faq" className="gradient-mesh" py={20} position="relative">
			{/* Background decoration */}
			<Box
				position="absolute"
				top="10%"
				right="5%"
				w="200px"
				h="200px"
				bg="radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)"
				filter="blur(40px)"
				pointerEvents="none"
			/>

			<Container maxW="1000px">
				{/* Section header */}
				<Flex direction="column" align="center" textAlign="center" mb={12}>
					<Flex
						align="center"
						gap={2}
						className="glass"
						px={4}
						py={2}
						borderRadius="full"
						mb={4}
					>
						<Icon as={FaQuestionCircle} color="cyan.400" boxSize={4} />
						<Text fontSize="sm" color="cyan.400" fontWeight="medium">
							FAQ
						</Text>
					</Flex>
					<Text
						as="h2"
						fontSize={{ base: "2xl", md: "4xl" }}
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={4}
					>
						Frequently Asked{" "}
						<Text as="span" className="text-gradient-cyber">
							Questions
						</Text>
					</Text>
					<Text color="whiteAlpha.700" maxW="600px">
						Everything you need to know about SabiCash, earning rewards, and our blockchain ecosystem.
					</Text>
				</Flex>

				{/* FAQ Items */}
				<Accordion.Root collapsible defaultValue={["a"]}>
					{faqItems.map((item, index) => (
						<Box
							key={index}
							className="blockchain-card"
							mb={4}
							overflow="hidden"
						>
							<Accordion.Item value={item.value} border={0}>
								<Accordion.ItemTrigger
									px={6}
									py={5}
									_hover={{ bg: "rgba(0, 255, 255, 0.05)" }}
									transition="all 0.3s ease"
								>
									<Flex align="center" gap={4} flex="1">
										<Box
											w="40px"
											h="40px"
											borderRadius="xl"
											bg="rgba(0, 255, 255, 0.1)"
											display="flex"
											alignItems="center"
											justifyContent="center"
											flexShrink={0}
										>
											<Icon as={item.icon} color="cyan.400" boxSize={5} />
										</Box>
										<Text
											fontSize={{ base: "md", md: "lg" }}
											fontWeight="600"
											textAlign="left"
										>
											{item.title}
										</Text>
									</Flex>
									<Accordion.ItemIndicator>
										<Icon as={FaPlus} color="cyan.400" boxSize={4} />
									</Accordion.ItemIndicator>
								</Accordion.ItemTrigger>
								<Accordion.ItemContent>
									<Accordion.ItemBody
										px={6}
										pb={5}
										pt={0}
									>
										<Box
											borderLeft="2px solid rgba(0, 255, 255, 0.2)"
											ml={{ base: 0, md: 5 }}
											pl={{ base: 4, md: 8 }}
										>
											<Text color="whiteAlpha.700" lineHeight="1.8">
												{item.text}
											</Text>
											{item.features && (
												<Flex gap={2} mt={4} flexWrap="wrap">
													{item.features.map((feature, i) => (
														<Box
															key={i}
															className="glass"
															px={3}
															py={1}
															borderRadius="full"
															fontSize="sm"
															color="cyan.400"
														>
															{feature}
														</Box>
													))}
												</Flex>
											)}
										</Box>
									</Accordion.ItemBody>
								</Accordion.ItemContent>
							</Accordion.Item>
						</Box>
					))}
				</Accordion.Root>

				{/* CTA Card */}
				<Box
					className="blockchain-card"
					p={8}
					mt={12}
					textAlign="center"
					position="relative"
					overflow="hidden"
				>
					{/* Animated background */}
					<Box
						position="absolute"
						top="50%"
						left="50%"
						transform="translate(-50%, -50%)"
						w="300px"
						h="300px"
						bg="radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)"
						filter="blur(40px)"
						pointerEvents="none"
					/>

					<Flex direction="column" align="center" position="relative" zIndex={1}>
						<Box
							w="60px"
							h="60px"
							borderRadius="2xl"
							bg="linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)"
							display="flex"
							alignItems="center"
							justifyContent="center"
							mb={4}
							className="pulse-glow"
						>
							<Icon as={FaDiscord} color="white" boxSize={7} />
						</Box>
						<Text
							fontSize="xl"
							fontWeight="bold"
							fontFamily="'Space Grotesk', sans-serif"
							mb={2}
						>
							Still Have Questions?
						</Text>
						<Text color="whiteAlpha.600" mb={6} maxW="400px">
							Join our Discord community and get answers from our team and fellow community members.
						</Text>
						<Button
							as="a"
							href="https://discord.gg/ZvpTZXBC"
							target="_blank"
							rel="noopener noreferrer"
							leftIcon={<FaDiscord />}
							bg="linear-gradient(135deg, #5865F2 0%, #7289DA 100%)"
							color="white"
							size="lg"
							borderRadius="xl"
							px={8}
							_hover={{
								transform: "translateY(-2px)",
								boxShadow: "0 0 30px rgba(88, 101, 242, 0.4)",
							}}
							transition="all 0.3s ease"
						>
							Join Discord
						</Button>
					</Flex>
				</Box>
			</Container>
		</Box>
	);
};

const faqItems = [
	{
		value: "a",
		icon: HiOutlineSparkles,
		title: "What is SabiCash ($SBC)?",
		text: "SabiCash is the native utility token of the Sabi Ride ecosystem, built on the Solana blockchain. It powers a ride-to-earn model where passengers and drivers earn rewards for every completed trip. $SBC can be used for payments, staking, governance, and accessing exclusive platform features.",
		features: ["Ride-to-Earn", "Solana Powered", "Utility Token"],
	},
	{
		value: "b",
		icon: HiOutlineSparkles,
		title: "How can I earn SabiCash tokens?",
		text: "There are multiple ways to earn $SBC: Complete rides as a passenger or driver to earn trip rewards based on distance. Refer new users to the platform and earn referral bonuses. Complete promotional tasks like social media engagement. Stake your existing tokens to earn passive yields up to 45% APY.",
		features: ["Trip Rewards", "Referrals", "Staking", "Tasks"],
	},
	{
		value: "c",
		icon: HiOutlineSparkles,
		title: "What can I do with my SabiCash?",
		text: "Your $SBC tokens unlock multiple utilities: Pay for rides at discounted rates within the Sabi Ride app. Stake tokens in our DeFi pools to earn passive income with competitive APY rates. Participate in governance decisions. Access exclusive airdrops and token presales. Swap for other cryptocurrencies on DEXs.",
		features: ["Payments", "Staking", "Governance", "Swaps"],
	},
	{
		value: "d",
		icon: HiOutlineSparkles,
		title: "Is SabiCash secure?",
		text: "Absolutely. SabiCash is built on Solana, one of the fastest and most secure blockchain networks. Our smart contracts are audited by leading security firms. We use industry-standard security practices including multi-sig wallets, regular audits, and secure key management. Your assets are always under your control.",
		features: ["Audited", "Solana Security", "Multi-sig"],
	},
	{
		value: "e",
		icon: HiOutlineSparkles,
		title: "How do I connect my wallet?",
		text: "You can connect popular Solana wallets like Phantom or Solflare. Simply click the 'Connect Wallet' button in the navigation bar, select your preferred wallet, and approve the connection. Once connected, you can view your balances, stake tokens, and participate in all platform features.",
		features: ["Phantom", "Solflare", "One-Click Connect"],
	},
	{
		value: "f",
		icon: HiOutlineSparkles,
		title: "What are the staking options?",
		text: "We offer flexible staking plans to suit different needs: Free Plan with no minimum deposit for beginners. Standard Plan with 100 SBC minimum and 26% APY. Premium Plan with 1000 SBC minimum and 35% APY with auto-compounding. Rewards are distributed daily and can be claimed or reinvested.",
		features: ["Free Tier", "Up to 35% APY", "Daily Rewards"],
	},
];

export default FAQ;
