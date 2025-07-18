import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  Text,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import { useWeb3 } from '../../hooks/useWeb3';

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const { loginToSabiRide, isConnected } = useWeb3();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock login for now
      toast({
        title: 'Login Successful',
        description: 'You can now access your Sabi Ride points and features',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setFormData({ email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login to Sabi Ride</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text mb={4} fontSize="sm" color="gray.600">
            Login to access your Sabi Ride points and convert them to Sabi Cash
          </Text>
          


          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your Sabi Ride email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                />
              </FormControl>

              <Button
                type="submit"
                bg="#0088CD"
                color="white"
                width="full"
                isLoading={isLoading}
                loadingText="Logging in..."
                isDisabled={false}
                _hover={{ bg: "#0077B6" }}
              >
                Login
              </Button>
            </VStack>
          </form>

          <Text mt={4} fontSize="xs" color="gray.500" textAlign="center">
            Note: This connects your wallet address to your Sabi Ride account for points conversion
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;