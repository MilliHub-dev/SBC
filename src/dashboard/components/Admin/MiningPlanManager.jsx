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
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Icon,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatValueText,
  StatHelpText,
  Progress,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  TableScrollArea,
  Textarea,
  Select
} from "@chakra-ui/react";
import {
  FaCoins,
  FaEdit,
  FaTrash,
  FaPlay,
  FaPause,
  FaPlus,
  FaUsers,
  FaChartLine,
  FaClock
} from "react-icons/fa";
import { toaster } from "../../../components/ui/toaster";

const MiningPlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [planStats, setPlanStats] = useState({});

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  // Plan form state
  const [planForm, setPlanForm] = useState({
    name: '',
    type: 'MINING',
    deposit: 0,
    dailyReward: 0,
    duration: 1,
    autoTrigger: false,
    isActive: true,
    description: '',
    maxParticipants: 10000,
    minStakeAmount: 0,
    lockPeriod: 0
  });

  useEffect(() => {
    // Initialize with mining plans data
    const mockPlans = [
      {
        id: 1,
        name: 'Free Mining',
        type: 'MINING',
        deposit: 0,
        dailyReward: 0.9,
        duration: 1,
        autoTrigger: false,
        isActive: true,
        description: 'Daily free mining rewards for all users',
        maxParticipants: 100000,
        currentParticipants: 1250,
        minStakeAmount: 0,
        lockPeriod: 0,
        totalRewardsDistributed: 15675,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Basic Staking',
        type: 'STAKING',
        deposit: 100,
        dailyReward: 15,
        duration: 30,
        autoTrigger: false,
        isActive: true,
        description: '30-day staking plan with 15% daily returns',
        maxParticipants: 5000,
        currentParticipants: 247,
        minStakeAmount: 100,
        lockPeriod: 30,
        totalRewardsDistributed: 8950,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-10'
      },
      {
        id: 3,
        name: 'Premium Staking',
        type: 'STAKING',
        deposit: 1000,
        dailyReward: 170,
        duration: 30,
        autoTrigger: true,
        isActive: true,
        description: 'Premium 30-day auto-compounding staking',
        maxParticipants: 1000,
        currentParticipants: 89,
        minStakeAmount: 1000,
        lockPeriod: 30,
        totalRewardsDistributed: 12780,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-12'
      },
      {
        id: 4,
        name: 'VIP Staking',
        type: 'STAKING',
        deposit: 5000,
        dailyReward: 900,
        duration: 60,
        autoTrigger: true,
        isActive: false,
        description: 'Exclusive VIP 60-day staking program',
        maxParticipants: 100,
        currentParticipants: 12,
        minStakeAmount: 5000,
        lockPeriod: 60,
        totalRewardsDistributed: 4560,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-18'
      }
    ];

    setPlans(mockPlans);

    // Calculate stats
    const stats = {
      totalPlans: mockPlans.length,
      activePlans: mockPlans.filter(p => p.isActive).length,
      totalParticipants: mockPlans.reduce((sum, p) => sum + p.currentParticipants, 0),
      totalRewardsDistributed: mockPlans.reduce((sum, p) => sum + p.totalRewardsDistributed, 0)
    };
    setPlanStats(stats);
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newPlan = {
        id: Date.now(),
        ...planForm,
        currentParticipants: 0,
        totalRewardsDistributed: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      setPlans(prev => [...prev, newPlan]);
      
             toaster.create({
         title: 'Plan Created',
         description: `${planForm.name} has been created successfully`,
         status: 'success',
         duration: 3000,
       });

      resetForm();
      onCreateClose();
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to create plan. Please try again.',
         status: 'error',
         duration: 3000,
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      setPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id 
          ? { 
              ...plan, 
              ...planForm, 
              updatedAt: new Date().toISOString().split('T')[0] 
            }
          : plan
      ));

             toaster.create({
         title: 'Plan Updated',
         description: `${planForm.name} has been updated successfully`,
         status: 'success',
         duration: 3000,
       });

      onClose();
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to update plan. Please try again.',
         status: 'error',
         duration: 3000,
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlan = async (planId) => {
    try {
      setPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              isActive: !plan.isActive,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : plan
      ));

      const plan = plans.find(p => p.id === planId);
             toaster.create({
         title: 'Plan Status Updated',
         description: `${plan.name} has been ${plan.isActive ? 'deactivated' : 'activated'}`,
         status: 'info',
         duration: 3000,
       });
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to update plan status',
         status: 'error',
         duration: 3000,
       });
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      setPlans(prev => prev.filter(plan => plan.id !== planId));
             toaster.create({
         title: 'Plan Deleted',
         description: 'Mining plan has been deleted successfully',
         status: 'info',
         duration: 3000,
       });
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to delete plan',
         status: 'error',
         duration: 3000,
       });
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      type: plan.type,
      deposit: plan.deposit,
      dailyReward: plan.dailyReward,
      duration: plan.duration,
      autoTrigger: plan.autoTrigger,
      isActive: plan.isActive,
      description: plan.description,
      maxParticipants: plan.maxParticipants,
      minStakeAmount: plan.minStakeAmount,
      lockPeriod: plan.lockPeriod
    });
    onOpen();
  };

  const resetForm = () => {
    setPlanForm({
      name: '',
      type: 'MINING',
      deposit: 0,
      dailyReward: 0,
      duration: 1,
      autoTrigger: false,
      isActive: true,
      description: '',
      maxParticipants: 10000,
      minStakeAmount: 0,
      lockPeriod: 0
    });
    setSelectedPlan(null);
  };

  const getStatusColor = (isActive) => isActive ? 'green' : 'red';
  const getTypeColor = (type) => type === 'MINING' ? 'blue' : 'purple';

  const calculateAPY = (dailyReward, deposit) => {
    if (deposit === 0) return 0;
    return ((dailyReward / deposit) * 365 * 100).toFixed(2);
  };

  const calculateROI = (dailyReward, duration, deposit) => {
    if (deposit === 0) return 0;
    return (((dailyReward * duration) / deposit) * 100).toFixed(2);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Mining Plan Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Plans</StatLabel>
              <StatValueText>{planStats.totalPlans}</StatValueText>
              <StatHelpText>All mining plans</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Plans</StatLabel>
              <StatValueText>{planStats.activePlans}</StatValueText>
              <StatHelpText>Currently running</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Participants</StatLabel>
              <StatValueText>{planStats.totalParticipants}</StatValueText>
              <StatHelpText>Across all plans</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Rewards Distributed</StatLabel>
              <StatValueText>{planStats.totalRewardsDistributed}</StatValueText>
              <StatHelpText>Total SABI</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Header with Create Button */}
      <HStack justify="space-between">
        <Heading size="md">Mining Plan Management</Heading>
        <Button
          leftIcon={<FaPlus />}
          bg="#0088CD"
          color="white"
          onClick={() => {
            resetForm();
            onCreateOpen();
          }}
          _hover={{ bg: "#0077B6" }}
        >
          Create New Plan
        </Button>
      </HStack>

      {/* Plans Table */}
      <Card>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Plan Details</Th>
                  <Th>Type</Th>
                  <Th>Deposit/Reward</Th>
                  <Th>Duration</Th>
                  <Th>Participants</Th>
                  <Th>APY/ROI</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {plans.map((plan) => (
                  <Tr key={plan.id}>
                    <Td>
                      <Box>
                        <Text fontWeight="bold">{plan.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {plan.description}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Badge colorScheme={getTypeColor(plan.type)}>
                        {plan.type}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack spacing={1} align="start">
                        <Text fontSize="sm">
                          Deposit: {plan.deposit} SABI
                        </Text>
                        <Text fontSize="sm">
                          Daily: {plan.dailyReward} SABI
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack spacing={1} align="start">
                        <Text fontSize="sm">{plan.duration} days</Text>
                        {plan.autoTrigger && (
                          <Badge size="sm" colorScheme="green">Auto</Badge>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack spacing={1} align="start">
                        <Text fontSize="sm">
                          {plan.currentParticipants} / {plan.maxParticipants}
                        </Text>
                        <Progress
                          value={(plan.currentParticipants / plan.maxParticipants) * 100}
                          size="sm"
                          colorScheme="blue"
                          w="80px"
                        />
                      </VStack>
                    </Td>
                    <Td>
                      <VStack spacing={1} align="start">
                        <Text fontSize="sm">
                          APY: {calculateAPY(plan.dailyReward, plan.deposit)}%
                        </Text>
                        <Text fontSize="sm">
                          ROI: {calculateROI(plan.dailyReward, plan.duration, plan.deposit)}%
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Badge colorScheme={getStatusColor(plan.isActive)}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          isChecked={plan.isActive}
                          onChange={() => handleTogglePlan(plan.id)}
                          size="sm"
                        />
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<FaEdit />}
                          colorScheme="blue"
                          onClick={() => openEditModal(plan)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<FaTrash />}
                          colorScheme="red"
                          onClick={() => handleDeletePlan(plan.id)}
                          isDisabled={plan.currentParticipants > 0}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Create Plan Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Mining Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleCreatePlan}>
              <VStack spacing={4}>
                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Plan Name</FormLabel>
                    <Input
                      value={planForm.name}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter plan name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Plan Type</FormLabel>
                    <Select
                      value={planForm.type}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="MINING">Mining</option>
                      <option value="STAKING">Staking</option>
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter plan description"
                    rows={3}
                  />
                </FormControl>

                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Deposit Amount (SABI)</FormLabel>
                    <NumberInput
                      value={planForm.deposit}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        deposit: parseInt(valueString) || 0 
                      }))}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Daily Reward (SABI)</FormLabel>
                    <NumberInput
                      value={planForm.dailyReward}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        dailyReward: parseFloat(valueString) || 0 
                      }))}
                      min={0}
                      step={0.1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Duration (Days)</FormLabel>
                    <NumberInput
                      value={planForm.duration}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        duration: parseInt(valueString) || 1 
                      }))}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Max Participants</FormLabel>
                    <NumberInput
                      value={planForm.maxParticipants}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        maxParticipants: parseInt(valueString) || 1000 
                      }))}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4}>
                  <FormControl>
                    <FormLabel>Auto Trigger</FormLabel>
                    <Switch
                      isChecked={planForm.autoTrigger}
                      onChange={(e) => setPlanForm(prev => ({ 
                        ...prev, 
                        autoTrigger: e.target.checked 
                      }))}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Active Status</FormLabel>
                    <Switch
                      isChecked={planForm.isActive}
                      onChange={(e) => setPlanForm(prev => ({ 
                        ...prev, 
                        isActive: e.target.checked 
                      }))}
                    />
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4} pt={4}>
                  <Button variant="outline" onClick={onCreateClose} flex={1}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="#0088CD"
                    color="white"
                    isLoading={isLoading}
                    flex={1}
                    _hover={{ bg: "#0077B6" }}
                  >
                    Create Plan
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Mining Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleUpdatePlan}>
              <VStack spacing={4}>
                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Plan Name</FormLabel>
                    <Input
                      value={planForm.name}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter plan name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Plan Type</FormLabel>
                    <Select
                      value={planForm.type}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="MINING">Mining</option>
                      <option value="STAKING">Staking</option>
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter plan description"
                    rows={3}
                  />
                </FormControl>

                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Deposit Amount (SABI)</FormLabel>
                    <NumberInput
                      value={planForm.deposit}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        deposit: parseInt(valueString) || 0 
                      }))}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Daily Reward (SABI)</FormLabel>
                    <NumberInput
                      value={planForm.dailyReward}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        dailyReward: parseFloat(valueString) || 0 
                      }))}
                      min={0}
                      step={0.1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Duration (Days)</FormLabel>
                    <NumberInput
                      value={planForm.duration}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        duration: parseInt(valueString) || 1 
                      }))}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Max Participants</FormLabel>
                    <NumberInput
                      value={planForm.maxParticipants}
                      onChange={(valueString) => setPlanForm(prev => ({ 
                        ...prev, 
                        maxParticipants: parseInt(valueString) || 1000 
                      }))}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4}>
                  <FormControl>
                    <FormLabel>Auto Trigger</FormLabel>
                    <Switch
                      isChecked={planForm.autoTrigger}
                      onChange={(e) => setPlanForm(prev => ({ 
                        ...prev, 
                        autoTrigger: e.target.checked 
                      }))}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Active Status</FormLabel>
                    <Switch
                      isChecked={planForm.isActive}
                      onChange={(e) => setPlanForm(prev => ({ 
                        ...prev, 
                        isActive: e.target.checked 
                      }))}
                    />
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4} pt={4}>
                  <Button variant="outline" onClick={onClose} flex={1}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="#0088CD"
                    color="white"
                    isLoading={isLoading}
                    flex={1}
                    _hover={{ bg: "#0077B6" }}
                  >
                    Update Plan
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default MiningPlanManager;