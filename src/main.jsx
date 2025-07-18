import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "./components/ui/provider";
import { Box, Heading, Text, Button } from "@chakra-ui/react";

// Simple test component with Chakra UI components
const SimpleApp = () => {
  return (
    <Box p={8} fontFamily="Arial, sans-serif">
      <Heading color="#0088CD" mb={4}>
        Sabi Ride - Working!
      </Heading>
      <Text mb={4}>
        ✅ React is working
        <br />
        ✅ Chakra UI is working
        <br />
        🎉 Application is successfully running!
      </Text>
      <Button 
        bg="#0088CD" 
        color="white" 
        onClick={() => alert('Everything is working!')}
        _hover={{ bg: "#0077B6" }}
      >
        Test Button
      </Button>
    </Box>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider>
      <SimpleApp />
    </Provider>
  </StrictMode>
);
