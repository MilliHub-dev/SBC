import React from "react";
import { Box, Container, Heading, Text, Grid, GridItem, Badge, Button, Link, Flex } from "@chakra-ui/react";

const Section = ({ id, title, children }) => (
  <Box id={id} mb={12}>
    <Heading size="lg" color="white" mb={3} fontFamily="'Space Grotesk', sans-serif">
      {title}
    </Heading>
    <Box className="glass" p={6} borderRadius="xl">{children}</Box>
  </Box>
);

const Legal = () => {
  return (
    <Container maxW="1000px" py={10}>
      <Box mb={8}>
        <Heading size="xl" color="white" fontFamily="'Space Grotesk', sans-serif">
          Legal
        </Heading>
        <Text color="whiteAlpha.700" mt={2}>
          Policies and terms governing the Sabi Cash platform.
        </Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={8}>
        <GridItem>
          <Section id="privacy" title="Privacy Policy">
            <Text color="whiteAlpha.800" mb={4}>
              We respect your privacy. Data collected is used to provide and improve services, secure accounts, and comply with regulations. We do not sell personal data. You may request deletion or correction of your information.
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm">
              Key points: account data, analytics, third-party integrations (wallets), security measures, user rights, and contact information.
            </Text>
          </Section>

          <Section id="terms" title="Terms of Service">
            <Text color="whiteAlpha.800" mb={4}>
              By using Sabi Cash, you agree to act lawfully, respect intellectual property, and accept risks associated with blockchain. We provide services “as is,” with no guarantee of uninterrupted availability. Misuse may result in suspension.
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm">
              Includes: eligibility, acceptable use, limitations of liability, dispute resolution, and modifications to terms.
            </Text>
          </Section>

          <Section id="cookies" title="Cookie Policy">
            <Text color="whiteAlpha.800" mb={4}>
              Cookies help personalize your experience and analyze traffic. You can manage preferences via your browser. Essential cookies are required for login and security.
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm">
              Types: essential, analytics, and performance. Opt-out options are available.
            </Text>
          </Section>
        </GridItem>

        <GridItem>
          <Box className="glass" p={6} borderRadius="xl">
            <Heading size="md" color="white" mb={4} fontFamily="'Space Grotesk', sans-serif">
              Quick Links
            </Heading>
            <Flex direction="column" gap={3}>
              <Button as={Link} href="/legal#privacy" className="glass" borderRadius="xl">
                Privacy Policy
              </Button>
              <Button as={Link} href="/legal#terms" className="glass" borderRadius="xl">
                Terms of Service
              </Button>
              <Button as={Link} href="/legal#cookies" className="glass" borderRadius="xl">
                Cookie Policy
              </Button>
            </Flex>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Legal;
