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
  Alert
} from '@chakra-ui/react';
import { useWeb3 } from '../../hooks/useWeb3';
import { toaster } from '../ui/toaster';

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login to SabiRide</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {error && (
                <Alert status="error">
                  {error}
                </Alert>
              )}
              
              <Field.Root>
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

              <Field.Root>
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
              >
                Login
              </Button>
            </VStack>
          </form>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default LoginModal;