import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Input,
  FieldRoot,
  FieldLabel,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  useDisclosure,
  Badge,
  Icon,
  Switch,
  NumberInputRoot,
  NumberInputInput,
  NumberInputControl,
  NumberInputIncrementTrigger,
  NumberInputDecrementTrigger,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatValueText,
  StatHelpText,
  Textarea,
  Alert,
  AlertIndicator,
  Code
} from "@chakra-ui/react";
import {
  FaCog,
  FaCoins,
  FaExchangeAlt,
  FaShieldAlt,
  FaWallet,
  FaDownload,
  FaUpload,
  FaSync,
  FaPlay,
  FaPause
} from "react-icons/fa";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";

const ContractManager = () => {
  const { isConnected, address } = useWeb3();
  const [contractData, setContractData] = useState({
    address: '0x', // Will be updated when contract is deployed
    owner: '',
    totalSupply: 0,
    ethToSabiRate: 1000,
    usdtToSabiRate: 1,
    isPaused: false,
    maxSupply: 1000000000
  });

  const [miningPlans, setMiningPlans] = useState({
    FREE: { deposit: 0, dailyReward: 0.9, duration: 1, autoTrigger: false },
    BASIC: { deposit: 100, dailyReward: 15, duration: 30, autoTrigger: false },
    PREMIUM: { deposit: 1000, dailyReward: 170, duration: 30, autoTrigger: true }
  });

  const [authorizedMinters, setAuthorizedMinters] = useState([]);
  const [newMinter, setNewMinter] = useState('');
  const [newRates, setNewRates] = useState({ eth: 1000, usdt: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen: isRateOpen, onOpen: onRateOpen, onClose: onRateClose } = useDisclosure();
  const { isOpen: isPlanOpen, onOpen: onPlanOpen, onClose: onPlanClose } = useDisclosure();
  const { isOpen: isMinterOpen, onOpen: onMinterOpen, onClose: onMinterClose } = useDisclosure();

  // Selected plan for editing
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    deposit: 0,
    dailyReward: 0,
    duration: 1,
    autoTrigger: false
  });

  useEffect(() => {
    // Initialize with mock data - in real app, fetch from contract
    setContractData({
      address: '0x1234567890123456789012345678901234567890',
      owner: address || '0x0000000000000000000000000000000000000000',
      totalSupply: 500000,
      ethToSabiRate: 1000,
      usdtToSabiRate: 1,
      isPaused: false,
      maxSupply: 1000000000
    });

    setAuthorizedMinters([
      address || '0x0000000000000000000000000000000000000000',
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
      '0x1111222233334444555566667777888899990000'
    ]);
  }, [address]);

  const handleUpdateRates = async () => {
    setIsLoading(true);
    try {
      // TODO: Call smart contract updateRates function
      // await contract.updateRates(newRates.eth, newRates.usdt);
      
      setContractData(prev => ({
        ...prev,
        ethToSabiRate: newRates.eth,
        usdtToSabiRate: newRates.usdt
      }));

             toaster.create({
          title: 'Rates Updated',
          description: `ETH rate: ${newRates.eth}, USDT rate: ${newRates.usdt}`,
          status: 'success',
          duration: 3000,
        });
      onRateClose();
    } catch (error) {
             toaster.create({
          title: 'Error',
          description: 'Failed to update rates. Please try again.',
          status: 'error',
          duration: 3000,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMiningPlan = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    try {
      // TODO: Call smart contract updateMiningPlan function
      setMiningPlans(prev => ({
        ...prev,
        [selectedPlan]: planForm
      }));

      toaster.create({
        title: 'Mining Plan Updated',
        description: `${selectedPlan} plan has been updated successfully`,
        status: 'success',
        duration: 3000,
      });
      onPlanClose();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Failed to update mining plan. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMinter = async () => {
    if (!newMinter || !newMinter.startsWith('0x') || newMinter.length !== 42) {
      toaster.create({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call smart contract setAuthorizedMinter function
      setAuthorizedMinters(prev => [...prev, newMinter]);
      setNewMinter('');

      toaster.create({
        title: 'Minter Added',
        description: 'Authorized minter added successfully',
        status: 'success',
        duration: 3000,
      });
      onMinterClose();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Failed to add authorized minter. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMinter = async (minterAddress) => {
    try {
      // TODO: Call smart contract setAuthorizedMinter(address, false) function
      setAuthorizedMinters(prev => prev.filter(m => m !== minterAddress));

      toaster.create({
        title: 'Minter Removed',
        description: 'Authorized minter removed successfully',
        status: 'info',
        duration: 3000,
      });
          } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Failed to remove authorized minter. Please try again.',
          status: 'error',
          duration: 3000,
        });
    }
  };

  const handlePauseContract = async () => {
    try {
      // TODO: Call smart contract pause/unpause function
      setContractData(prev => ({
        ...prev,
        isPaused: !prev.isPaused
      }));

      toaster.create({
        title: `Contract ${contractData.isPaused ? 'Unpaused' : 'Paused'}`,
        description: `Smart contract has been ${contractData.isPaused ? 'unpaused' : 'paused'}`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Failed to change contract status. Please try again.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleWithdrawFunds = async (tokenType) => {
    try {
      // TODO: Call smart contract withdraw functions
      toaster.create({
        title: 'Withdrawal Initiated',
        description: `${tokenType} withdrawal has been initiated`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Failed to withdraw funds. Please try again.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openPlanModal = (planName) => {
    setSelectedPlan(planName);
    setPlanForm(miningPlans[planName]);
    onPlanOpen();
  };

  if (!isConnected) {
    return (
      <Alert status="warning">
                    <AlertIndicator />
        Please connect your wallet to access contract management features
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Contract Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Contract Address</StatLabel>
              <StatValueText fontSize="sm">{contractData.address.slice(0, 10)}...</StatValueText>
              <StatHelpText>Polygon zkEVM</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Supply</StatLabel>
              <StatValueText>{contractData.totalSupply.toLocaleString()}</StatValueText>
              <StatHelpText>SABI tokens</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Max Supply</StatLabel>
              <StatValueText>{contractData.maxSupply.toLocaleString()}</StatValueText>
              <StatHelpText>Token limit</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Contract Status</StatLabel>
              <StatValueText>
                <Badge colorScheme={contractData.isPaused ? 'red' : 'green'}>
                  {contractData.isPaused ? 'Paused' : 'Active'}
                </Badge>
              </StatValueText>
              <StatHelpText>Current state</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Actions */}
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <Heading size="md">Quick Actions</Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
              <Button
                leftIcon={<FaExchangeAlt />}
                colorScheme="blue"
                onClick={onRateOpen}
              >
                Update Rates
              </Button>
              
              <Button
                leftIcon={<FaCoins />}
                colorScheme="purple"
                onClick={() => openPlanModal('FREE')}
              >
                Edit Mining Plans
              </Button>
              
              <Button
                leftIcon={<FaShieldAlt />}
                colorScheme="orange"
                onClick={onMinterOpen}
              >
                Manage Minters
              </Button>
              
              <Button
                leftIcon={contractData.isPaused ? <FaPlay /> : <FaPause />}
                colorScheme={contractData.isPaused ? 'green' : 'red'}
                onClick={handlePauseContract}
              >
                {contractData.isPaused ? 'Unpause' : 'Pause'} Contract
              </Button>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Current Conversion Rates</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box p={4} border="1px solid" borderColor="gray.200" rounded="lg">
                <HStack justify="space-between">
                  <Text fontWeight="bold">ETH to SABI:</Text>
                  <Text>1 ETH = {contractData.ethToSabiRate} SABI</Text>
                </HStack>
              </Box>
              <Box p={4} border="1px solid" borderColor="gray.200" rounded="lg">
                <HStack justify="space-between">
                  <Text fontWeight="bold">USDT to SABI:</Text>
                  <Text>1 USDT = {contractData.usdtToSabiRate} SABI</Text>
                </HStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Mining Plans Configuration */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Mining Plans Configuration</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {Object.entries(miningPlans).map(([planName, plan]) => (
                <Card key={planName} border="1px solid" borderColor="gray.200">
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">{planName} Plan</Text>
                        <Button
                          size="sm"
                          leftIcon={<FaCog />}
                          onClick={() => openPlanModal(planName)}
                        >
                          Edit
                        </Button>
                      </HStack>
                      <Text fontSize="sm">Deposit: {plan.deposit} SABI</Text>
                      <Text fontSize="sm">Daily Reward: {plan.dailyReward} SABI</Text>
                      <Text fontSize="sm">Duration: {plan.duration} days</Text>
                      <Text fontSize="sm">Auto Trigger: {plan.autoTrigger ? 'Yes' : 'No'}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Authorized Minters */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md">Authorized Minters</Heading>
              <Button
                leftIcon={<FaWallet />}
                colorScheme="green"
                onClick={onMinterOpen}
              >
                Add Minter
              </Button>
            </HStack>
            <VStack spacing={2} align="stretch">
              {authorizedMinters.map((minter, index) => (
                <HStack key={index} justify="space-between" p={3} border="1px solid" borderColor="gray.200" rounded="md">
                  <Code fontSize="sm">{minter}</Code>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleRemoveMinter(minter)}
                  >
                    Remove
                  </Button>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Fund Management */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Fund Management</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="green"
                onClick={() => handleWithdrawFunds('ETH')}
              >
                Withdraw ETH
              </Button>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="blue"
                onClick={() => handleWithdrawFunds('USDT')}
              >
                Withdraw USDT
              </Button>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Update Rates Modal */}
      <DialogRoot open={isRateOpen} onOpenChange={({ open }) => !open && onRateClose()}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>Update Conversion Rates</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
                          <VStack spacing={4}>
                <FieldRoot>
                  <FieldLabel>ETH to SABI Rate</FieldLabel>
                <NumberInputRoot
                  value={newRates.eth}
                  onValueChange={({ value }) => setNewRates(prev => ({ 
                    ...prev, 
                    eth: parseInt(value) || 0 
                  }))}
                  min={1}
                >
                  <NumberInputInput />
                  <NumberInputControl />
                </NumberInputRoot>
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>USDT to SABI Rate</FieldLabel>
                <NumberInputRoot
                  value={newRates.usdt}
                  onValueChange={({ value }) => setNewRates(prev => ({ 
                    ...prev, 
                    usdt: parseInt(value) || 0 
                  }))}
                  min={1}
                >
                  <NumberInputInput />
                  <NumberInputControl />
                </NumberInputRoot>
              </FieldRoot>

              <HStack w="full" spacing={4} pt={4}>
                <Button variant="outline" onClick={onRateClose} flex={1}>
                  Cancel
                </Button>
                <Button
                  bg="#0088CD"
                  color="white"
                  onClick={handleUpdateRates}
                  isLoading={isLoading}
                  flex={1}
                  _hover={{ bg: "#0077B6" }}
                >
                  Update Rates
                </Button>
              </HStack>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>

      {/* Update Mining Plan Modal */}
      <DialogRoot open={isPlanOpen} onOpenChange={({ open }) => !open && onPlanClose()}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>Edit {selectedPlan} Mining Plan</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
                          <VStack spacing={4}>
                <FieldRoot>
                  <FieldLabel>Deposit Amount (SABI)</FieldLabel>
                <NumberInputRoot
                  value={planForm.deposit}
                  onValueChange={({ value }) => setPlanForm(prev => ({ 
                    ...prev, 
                    deposit: parseInt(value) || 0 
                  }))}
                  min={0}
                >
                  <NumberInputInput />
                  <NumberInputControl />
                </NumberInputRoot>
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>Daily Reward (SABI)</FieldLabel>
                <NumberInputRoot
                  value={planForm.dailyReward}
                  onValueChange={({ value }) => setPlanForm(prev => ({ 
                    ...prev, 
                    dailyReward: parseFloat(value) || 0 
                  }))}
                  min={0}
                  step={0.1}
                >
                  <NumberInputInput />
                  <NumberInputControl />
                </NumberInputRoot>
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>Duration (Days)</FieldLabel>
                <NumberInputRoot
                  value={planForm.duration}
                  onValueChange={({ value }) => setPlanForm(prev => ({ 
                    ...prev, 
                    duration: parseInt(value) || 1 
                  }))}
                  min={1}
                >
                  <NumberInputInput />
                  <NumberInputControl />
                </NumberInputRoot>
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>Auto Trigger</FieldLabel>
                <Switch
                  isChecked={planForm.autoTrigger}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    autoTrigger: e.target.checked 
                  }))}
                />
              </FieldRoot>

              <HStack w="full" spacing={4} pt={4}>
                <Button variant="outline" onClick={onPlanClose} flex={1}>
                  Cancel
                </Button>
                <Button
                  bg="#0088CD"
                  color="white"
                  onClick={handleUpdateMiningPlan}
                  isLoading={isLoading}
                  flex={1}
                  _hover={{ bg: "#0077B6" }}
                >
                  Update Plan
                </Button>
              </HStack>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>

      {/* Add Minter Modal */}
      <DialogRoot open={isMinterOpen} onOpenChange={({ open }) => !open && onMinterClose()}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>Add Authorized Minter</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
            <VStack spacing={4}>
              <FieldRoot>
                <FieldLabel>Wallet Address</FieldLabel>
                <Input
                  value={newMinter}
                  onChange={(e) => setNewMinter(e.target.value)}
                  placeholder="0x..."
                />
              </FieldRoot>

              <HStack w="full" spacing={4} pt={4}>
                <Button variant="outline" onClick={onMinterClose} flex={1}>
                  Cancel
                </Button>
                <Button
                  bg="#0088CD"
                  color="white"
                  onClick={handleAddMinter}
                  isLoading={isLoading}
                  flex={1}
                  _hover={{ bg: "#0077B6" }}
                >
                  Add Minter
                </Button>
              </HStack>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </VStack>
  );
};

export default ContractManager;