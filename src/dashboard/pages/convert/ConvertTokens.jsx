import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  Field,
  Alert,
  Card,
  CardBody,
  VStack,
  HStack,
  Divider,
  Badge,
  Spinner,
  useDisclosure
} from "@chakra-ui/react";
import { useWeb3 } from "../../../hooks/useWeb3";
import LoginModal from "../../../components/Login/LoginModal";
import { toaster } from "../../../components/ui/toaster";

const ConvertTokens = () => {
  const {
    isConnected,
    isLoggedIn,
    userPoints,
    canConvertPoints,
    convertPointsToSabi,
    getConvertibleSabi,
    POINT_TO_SABI_RATE,
    MIN_POINT_CONVERSION
  } = useWeb3();

  const [pointsToConvert, setPointsToConvert] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConvertPoints = async () => {
    if (!pointsToConvert || pointsToConvert < MIN_POINT_CONVERSION) {
      toaster.create({
        title: 'Invalid Amount',
        description: `Minimum ${MIN_POINT_CONVERSION} points required for conversion`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (pointsToConvert > userPoints) {
      toaster.create({
        title: 'Insufficient Points',
        description: 'You don\'t have enough points for this conversion',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsConverting(true);
    try {
      await convertPointsToSabi(parseInt(pointsToConvert));
      toaster.create({
        title: 'Conversion Successful',
        description: `Successfully converted ${pointsToConvert} points to ${pointsToConvert * POINT_TO_SABI_RATE} Sabi Cash`,
        status: 'success',
        duration: 5000,
      });
      setPointsToConvert('');
    } catch (error) {
      toaster.create({
        title: 'Conversion Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertAll = () => {
    setPointsToConvert(userPoints.toString());
  };

  if (!isConnected) {
    return (
      <Container maxW="md" py={8}>
        <Alert status="warning">
          Please connect your wallet to convert points
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <LoginModal isOpen={isOpen} onClose={onClose} />
      <Container maxW="2xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>Convert Points to Sabi Cash</Heading>
            <Text color="gray.600">
              Convert your Sabi Ride points to Sabi Cash tokens (1 point = {POINT_TO_SABI_RATE} Sabi Cash)
            </Text>
          </Box>

          {!isLoggedIn && (
            <Alert status="info">
              <Box>
                <Text fontWeight="bold">Login Required</Text>
                <Text>Please login to your Sabi Ride account to access your points</Text>
                <Button 
                  mt={2} 
                  size="sm" 
                  bg="#0088CD" 
                  color="white"
                  onClick={onOpen}
                >
                  Login to Sabi Ride
                </Button>
              </Box>
            </Alert>
          )}

          {isLoggedIn && (
            <>
              <Card>
                <CardBody>
                  <VStack spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold">Available Points:</Text>
                      <Badge colorScheme="blue" fontSize="lg" p={2}>
                        {userPoints} points
                      </Badge>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold">Convertible Sabi Cash:</Text>
                      <Badge colorScheme="green" fontSize="lg" p={2}>
                        {getConvertibleSabi()} SABI
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack spacing={4}>
                    <Field>
                      <Field.Label>Points to Convert</Field.Label>
                      <Input
                        type="number"
                        placeholder={`Minimum ${MIN_POINT_CONVERSION} points`}
                        value={pointsToConvert}
                        onChange={(e) => setPointsToConvert(e.target.value)}
                        min={MIN_POINT_CONVERSION}
                        max={userPoints}
                      />
                      <Field.HelperText>
                        {pointsToConvert && `= ${pointsToConvert * POINT_TO_SABI_RATE} Sabi Cash`}
                      </Field.HelperText>
                    </Field>

                    <HStack spacing={4} w="full">
                      <Button
                        variant="outline"
                        onClick={handleConvertAll}
                        isDisabled={userPoints < MIN_POINT_CONVERSION}
                        flex={1}
                      >
                        Convert All Points
                      </Button>
                      <Button
                        bg="#0088CD"
                        color="white"
                        onClick={handleConvertPoints}
                        isLoading={isConverting}
                        loadingText="Converting..."
                        isDisabled={!canConvertPoints() || !pointsToConvert}
                        flex={1}
                        _hover={{ bg: "#0077B6" }}
                      >
                        Convert Points
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="blue.50" borderColor="blue.200">
                <CardBody>
                  <VStack spacing={3} align="start">
                    <Text fontWeight="bold" color="blue.800">Conversion Rules:</Text>
                    <Text fontSize="sm" color="blue.700">
                      • 1 point = {POINT_TO_SABI_RATE} Sabi Cash
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      • Minimum conversion: {MIN_POINT_CONVERSION} points
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      • You can convert all points at once or in batches
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      • Points will be cleared from your Sabi Ride account after conversion
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </>
          )}
        </VStack>
      </Container>
    </>
  );
};

export default ConvertTokens;
