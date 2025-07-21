import React, { useState } from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  DialogTitle,
  Button,
  Input,
  Field,
  VStack,
  Text,
  Alert,
  Box,
  Flex,
  Icon
} from '@chakra-ui/react';
import { useWeb3 } from '../../hooks/useWeb3';
import { toaster } from '../ui/toaster';
import { FaInfoCircle } from 'react-icons/fa';

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginToSabiRide, isConnected } = useWeb3();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@sabicash.com',
      password: 'demo123'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!isConnected) {
        setError('Please connect your wallet first');
        return;
      }

      // Call the web3 login function
      await loginToSabiRide(formData.email, formData.password);
      
      toaster.create({
        title: 'Login successful',
        description: 'Welcome to SabiCash! You can now start mining.',
        status: 'success',
        duration: 3000,
      });
      
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
      toaster.create({
        title: 'Login failed',
        description: err.message || 'An error occurred during login',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <DialogContent maxW="md">
        <DialogHeader>
          <DialogTitle>Login to SabiCash</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack spacing={4}>
            {/* Demo credentials info */}
            <Box w="full" p={3} bg="blue.50" border="1px solid" borderColor="blue.200" rounded="md">
              <Flex alignItems="center" gap={2} mb={2}>
                <Icon color="blue.500">
                  <FaInfoCircle />
                </Icon>
                <Text fontSize="sm" fontWeight="bold" color="blue.700">
                  Demo Mode Available
                </Text>
              </Flex>
              <Text fontSize="xs" color="blue.600" mb={2}>
                Use these credentials to test the application:
              </Text>
              <Box fontSize="xs" color="blue.600">
                <Text><strong>Email:</strong> demo@sabicash.com</Text>
                <Text><strong>Password:</strong> demo123</Text>
              </Box>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                mt={2}
                onClick={handleDemoLogin}
              >
                Use Demo Credentials
              </Button>
            </Box>

            {error && (
              <Alert status="error" rounded="md">
                {error}
              </Alert>
            )}

            {!isConnected && (
              <Alert status="warning" rounded="md">
                Please connect your wallet before logging in
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4} w="full">
                <Field.Root w="full">
                  <Field.Label>Email</Field.Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </Field.Root>

                <Field.Root w="full">
                  <Field.Label>Password</Field.Label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                </Field.Root>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                  width="full"
                  isDisabled={!isConnected}
                >
                  Login
                </Button>

                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Don't have an account? Contact support to create one.
                </Text>
              </VStack>
            </form>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default LoginModal;