import React from "react";
import { Box, Container, Heading, Text, Button, Flex } from "@chakra-ui/react";
import { Link as RouterLink, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const statusText = typeof error?.statusText === "string" ? error.statusText : "Unexpected Error";
  const message = typeof error?.message === "string" ? error.message : "";

  return (
    <Container maxW="800px" py={16}>
      <Box className="glass" p={8} borderRadius="xl" textAlign="center">
        <Heading size="lg" color="white" mb={2} fontFamily="'Space Grotesk', sans-serif">
          {statusText}
        </Heading>
        {message && (
          <Text color="whiteAlpha.700" mb={4}>
            {message}
          </Text>
        )}
        <Flex justify="center" gap={3} mt={4}>
          <Button as={RouterLink} to="/" className="glass" borderRadius="xl">
            Go Home
          </Button>
          <Button as={RouterLink} to="/resources" className="glass" borderRadius="xl">
            View Resources
          </Button>
        </Flex>
      </Box>
    </Container>
  );
};

export default ErrorPage;
