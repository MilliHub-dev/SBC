import React from "react";
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Badge, Button, Card, Image, Link } from "@chakra-ui/react";

const Section = ({ id, title, children }) => (
  <Box id={id} mb={12}>
    <Heading size="lg" color="white" mb={3} fontFamily="'Space Grotesk', sans-serif">
      {title}
    </Heading>
    <Box className="glass" p={6} borderRadius="xl">{children}</Box>
  </Box>
);

const Stat = ({ label, value }) => (
  <Box className="glass" px={4} py={3} borderRadius="xl" textAlign="center">
    <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="wider">
      {label}
    </Text>
    <Text fontSize="lg" fontWeight="bold" color="cyan.400" fontFamily="'Space Grotesk', sans-serif">
      {value}
    </Text>
  </Box>
);

const Resources = () => {
  return (
    <Container maxW="1200px" py={10}>
      <Box mb={10}>
        <Heading size="xl" color="white" fontFamily="'Space Grotesk', sans-serif">
          Resources
        </Heading>
        <Text color="whiteAlpha.700" mt={2}>
          Documentation, whitepaper, tokenomics and roadmap in one place.
        </Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={8}>
        <GridItem>
          <Section id="documentation" title="Documentation">
            <Text color="whiteAlpha.800" mb={4}>
              Learn how Sabi Cash works, wallet setup, conversions, mining, and admin features. This guide helps developers and users interact safely on Solana.
            </Text>
            <Flex gap={3} wrap="wrap">
              <Button as={Link} href="#" className="glass" borderRadius="xl">
                Getting Started
              </Button>
              <Button as={Link} href="#" className="glass" borderRadius="xl">
                API Reference
              </Button>
              <Button as={Link} href="#" className="glass" borderRadius="xl">
                Integration Guide
              </Button>
            </Flex>
          </Section>

          <Section id="whitepaper" title="Whitepaper">
            <Text color="whiteAlpha.800" mb={4}>
              The Sabi Cash whitepaper outlines the mobility rewards vision, protocol design, token utility, and governance approach.
            </Text>
            <Card.Root className="glass" borderRadius="xl">
              <Card.Body>
                <Flex align="center" gap={4}>
                  <Image src="/Sabi-Cash.png" alt="Sabi Cash" h="60px" w="auto" />
                  <Box>
                    <Text fontWeight="bold">Sabi Cash Whitepaper</Text>
                    <Text color="whiteAlpha.700" fontSize="sm">PDF available on request; web version coming soon.</Text>
                  </Box>
                </Flex>
              </Card.Body>
              <Card.Footer>
                <Button className="glass" borderRadius="xl">View Summary</Button>
                <Button className="glass" borderRadius="xl" ml={3}>Download (Soon)</Button>
              </Card.Footer>
            </Card.Root>
          </Section>

          <Section id="tokenomics" title="Tokenomics">
            <Text color="whiteAlpha.800" mb={6}>
              Token supply, decimals, and distribution plan for Sabi Cash on Solana.
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
              <Stat label="Ticker" value="SBC" />
              <Stat label="Supply" value="500,000,000,000" />
              <Stat label="Decimals" value="6" />
            </Grid>
            <Box className="glass" p={5} borderRadius="xl">
              <Text color="whiteAlpha.800" mb={2}>
                Distribution (illustrative):
              </Text>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                <Box className="glass" p={4} borderRadius="xl">
                  <Text fontWeight="bold">Community Rewards</Text>
                  <Text color="whiteAlpha.700" fontSize="sm">Ongoing mining and task rewards</Text>
                </Box>
                <Box className="glass" p={4} borderRadius="xl">
                  <Text fontWeight="bold">Ecosystem Growth</Text>
                  <Text color="whiteAlpha.700" fontSize="sm">Partnerships and integrations</Text>
                </Box>
                <Box className="glass" p={4} borderRadius="xl">
                  <Text fontWeight="bold">Treasury</Text>
                  <Text color="whiteAlpha.700" fontSize="sm">Liquidity and reserves</Text>
                </Box>
                <Box className="glass" p={4} borderRadius="xl">
                  <Text fontWeight="bold">Team & Operations</Text>
                  <Text color="whiteAlpha.700" fontSize="sm">Vested allocation</Text>
                </Box>
              </Grid>
            </Box>
          </Section>

          <Section id="roadmap" title="Roadmap">
            <Text color="whiteAlpha.800" mb={6}>
              Key milestones and token distribution timeline.
            </Text>
            <Grid templateColumns={{ base: "1fr" }} gap={4}>
              <Box className="glass" p={4} borderRadius="xl">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Token Distribution Start</Text>
                    <Text color="whiteAlpha.700" fontSize="sm">Commences January next year</Text>
                  </Box>
                  <Badge colorPalette="cyan">Scheduled</Badge>
                </Flex>
              </Box>
              <Box className="glass" p={4} borderRadius="xl">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Wallet Integrations</Text>
                    <Text color="whiteAlpha.700" fontSize="sm">Broader wallet support and listings</Text>
                  </Box>
                  <Badge colorPalette="purple">Planned</Badge>
                </Flex>
              </Box>
              <Box className="glass" p={4} borderRadius="xl">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">DEX Listings</Text>
                    <Text color="whiteAlpha.700" fontSize="sm">Liquidity initiatives and routing</Text>
                  </Box>
                  <Badge colorPalette="pink">Planned</Badge>
                </Flex>
              </Box>
            </Grid>
          </Section>
        </GridItem>

        <GridItem>
          <Box className="glass" p={6} borderRadius="xl">
            <Heading size="md" color="white" mb={4} fontFamily="'Space Grotesk', sans-serif">
              Quick Links
            </Heading>
            <Flex direction="column" gap={3}>
              <Button as={Link} href="/resources#documentation" className="glass" borderRadius="xl">
                Documentation
              </Button>
              <Button as={Link} href="/resources#whitepaper" className="glass" borderRadius="xl">
                Whitepaper
              </Button>
              <Button as={Link} href="/resources#tokenomics" className="glass" borderRadius="xl">
                Tokenomics
              </Button>
              <Button as={Link} href="/resources#roadmap" className="glass" borderRadius="xl">
                Roadmap
              </Button>
            </Flex>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Resources;
