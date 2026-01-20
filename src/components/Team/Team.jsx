import {
	Box,
	Container,
	Grid,
	Image,
	Text,
	Flex,
	Icon,
	Link,
} from "@chakra-ui/react";
import React from "react";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

const teamData = [
	{
		name: "Alex Chen",
		title: "CEO & Founder",
		bio: "Blockchain visionary with 10+ years in fintech",
		avatar: "AC",
		color: "cyan",
		socials: {
			twitter: "#",
			linkedin: "#",
		},
	},
	{
		name: "Sarah Williams",
		title: "CTO",
		bio: "Former Solana Labs engineer, smart contract expert",
		avatar: "SW",
		color: "purple",
		socials: {
			twitter: "#",
			github: "#",
		},
	},
	{
		name: "Michael Obi",
		title: "COO",
		bio: "Operations leader from Uber & Bolt",
		avatar: "MO",
		color: "green",
		socials: {
			twitter: "#",
			linkedin: "#",
		},
	},
	{
		name: "Emily Zhang",
		title: "Head of Product",
		bio: "Product strategist, ex-Coinbase",
		avatar: "EZ",
		color: "pink",
		socials: {
			twitter: "#",
			linkedin: "#",
		},
	},
];

const TeamMemberCard = ({ member }) => {
	const colorMap = {
		cyan: { bg: "rgba(0, 255, 255, 0.1)", text: "cyan.400" },
		purple: { bg: "rgba(168, 85, 247, 0.1)", text: "purple.400" },
		green: { bg: "rgba(16, 185, 129, 0.1)", text: "green.400" },
		pink: { bg: "rgba(236, 72, 153, 0.1)", text: "pink.400" },
	};

	const colors = colorMap[member.color] || colorMap.cyan;

	return (
		<Box
			className="blockchain-card"
			p={6}
			textAlign="center"
			position="relative"
			overflow="hidden"
			role="group"
		>
			{/* Hover glow effect */}
			<Box
				position="absolute"
				top="0"
				left="50%"
				transform="translateX(-50%)"
				w="150px"
				h="150px"
				bg={`radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`}
				filter="blur(30px)"
				opacity={0}
				transition="opacity 0.3s ease"
				_groupHover={{ opacity: 1 }}
				pointerEvents="none"
			/>

			<Flex direction="column" align="center" gap={4} position="relative" zIndex={1}>
				{/* Avatar */}
				<Box
					w="80px"
					h="80px"
					borderRadius="2xl"
					bg={`linear-gradient(135deg, ${member.color === 'cyan' ? '#00FFFF' : member.color === 'purple' ? '#A855F7' : member.color === 'green' ? '#10B981' : '#EC4899'} 0%, rgba(0,0,0,0.3) 100%)`}
					display="flex"
					alignItems="center"
					justifyContent="center"
					fontSize="xl"
					fontWeight="bold"
					color="white"
					fontFamily="'Space Grotesk', sans-serif"
					boxShadow={`0 0 30px ${colors.bg}`}
					transition="all 0.3s ease"
					_groupHover={{
						transform: "scale(1.05)",
						boxShadow: `0 0 40px ${colors.bg}`,
					}}
				>
					{member.avatar}
				</Box>

				{/* Info */}
				<Box>
					<Text
						fontWeight="bold"
						fontSize="lg"
						fontFamily="'Space Grotesk', sans-serif"
						mb={1}
					>
						{member.name}
					</Text>
					<Text
						fontSize="sm"
						color={colors.text}
						fontWeight="medium"
						mb={2}
					>
						{member.title}
					</Text>
					<Text
						fontSize="xs"
						color="whiteAlpha.600"
						lineHeight="1.6"
					>
						{member.bio}
					</Text>
				</Box>

				{/* Social links */}
				<Flex gap={2}>
					{member.socials.twitter && (
						<Link
							href={member.socials.twitter}
							target="_blank"
							rel="noopener noreferrer"
							className="glass"
							w="36px"
							h="36px"
							borderRadius="lg"
							display="flex"
							alignItems="center"
							justifyContent="center"
							transition="all 0.3s ease"
							_hover={{
								bg: "rgba(29, 161, 242, 0.2)",
								borderColor: "rgba(29, 161, 242, 0.5)",
							}}
						>
							<Icon as={FaTwitter} color="whiteAlpha.700" boxSize={4} />
						</Link>
					)}
					{member.socials.linkedin && (
						<Link
							href={member.socials.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							className="glass"
							w="36px"
							h="36px"
							borderRadius="lg"
							display="flex"
							alignItems="center"
							justifyContent="center"
							transition="all 0.3s ease"
							_hover={{
								bg: "rgba(10, 102, 194, 0.2)",
								borderColor: "rgba(10, 102, 194, 0.5)",
							}}
						>
							<Icon as={FaLinkedin} color="whiteAlpha.700" boxSize={4} />
						</Link>
					)}
					{member.socials.github && (
						<Link
							href={member.socials.github}
							target="_blank"
							rel="noopener noreferrer"
							className="glass"
							w="36px"
							h="36px"
							borderRadius="lg"
							display="flex"
							alignItems="center"
							justifyContent="center"
							transition="all 0.3s ease"
							_hover={{
								bg: "rgba(255, 255, 255, 0.1)",
								borderColor: "rgba(255, 255, 255, 0.3)",
							}}
						>
							<Icon as={FaGithub} color="whiteAlpha.700" boxSize={4} />
						</Link>
					)}
				</Flex>
			</Flex>
		</Box>
	);
};

const Team = () => {
	return (
		<Box id="team" py={20} className="blockchain-grid" position="relative">
			{/* Background decoration */}
			<Box
				position="absolute"
				top="50%"
				left="50%"
				transform="translate(-50%, -50%)"
				w="600px"
				h="600px"
				bg="radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)"
				filter="blur(60px)"
				pointerEvents="none"
			/>

			<Container maxW="1200px" position="relative" zIndex={1}>
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
						<Icon as={HiOutlineSparkles} color="cyan.400" boxSize={4} />
						<Text fontSize="sm" color="cyan.400" fontWeight="medium">
							OUR TEAM
						</Text>
					</Flex>
					<Text
						as="h2"
						fontSize={{ base: "2xl", md: "4xl" }}
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={4}
					>
						Meet the{" "}
						<Text as="span" className="text-gradient-cyber">
							Visionaries
						</Text>
					</Text>
					<Text color="whiteAlpha.700" maxW="600px">
						A team of blockchain experts, fintech veterans, and transportation innovators
						building the future of mobility rewards.
					</Text>
				</Flex>

				{/* Team grid */}
				<Grid
					templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
					gap={6}
				>
					{teamData.map((member, index) => (
						<TeamMemberCard key={index} member={member} />
					))}
				</Grid>

				{/* Join the team CTA */}
				<Box
					className="blockchain-card"
					p={8}
					mt={12}
					textAlign="center"
				>
					<Text
						fontSize="xl"
						fontWeight="bold"
						fontFamily="'Space Grotesk', sans-serif"
						mb={2}
					>
						Want to Join Us?
					</Text>
					<Text color="whiteAlpha.600" mb={4}>
						We're always looking for talented individuals to join our mission.
					</Text>
					<Box
						as="a"
						href="mailto:careers@sabicash.com"
						display="inline-block"
						px={6}
						py={3}
						borderRadius="xl"
						bg="linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)"
						color="#0a0a0f"
						fontWeight="600"
						fontSize="sm"
						transition="all 0.3s ease"
						_hover={{
							transform: "translateY(-2px)",
							boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
						}}
					>
						View Open Positions
					</Box>
				</Box>
			</Container>
		</Box>
	);
};

export default Team;
