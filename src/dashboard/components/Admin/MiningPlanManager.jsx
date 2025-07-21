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
  Field,
  Badge,
  Switch,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatValueText,
  StatHelpText,
  Progress,


  Textarea,
  Select
} from "@chakra-ui/react";
import {
  FaCoins,
  FaEdit,
  FaTrash,
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

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
      setShowCreateForm(false);
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

      setShowEditForm(false);
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

  const openEditForm = (plan) => {
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
    setShowEditForm(true);
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

  const PlanForm = ({ onSubmit, onCancel, isEdit = false }) => (
    <Card>
      <CardBody>
        <form onSubmit={onSubmit}>
          <VStack spacing={4}>
            <Heading size="md" color="white">
              {isEdit ? 'Edit Mining Plan' : 'Create New Mining Plan'}
            </Heading>

            <HStack w="full" spacing={4}>
              <Field.Root required>
                <Field.Label>Plan Name</Field.Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter plan name"
                  bg="gray.800"
                  color="white"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Plan Type</Field.Label>
                <Select
                  value={planForm.type}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, type: e.target.value }))}
                  bg="gray.800"
                  color="white"
                >
                  <option value="MINING" style={{backgroundColor: '#2D3748'}}>Mining</option>
                  <option value="STAKING" style={{backgroundColor: '#2D3748'}}>Staking</option>
                </Select>
              </Field.Root>
            </HStack>

            <Field.Root required>
              <Field.Label>Description</Field.Label>
              <Textarea
                value={planForm.description}
                onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter plan description"
                rows={3}
                bg="gray.800"
                color="white"
              />
            </Field.Root>

            <HStack w="full" spacing={4}>
              <Field.Root required>
                <Field.Label>Deposit Amount (SABI)</Field.Label>
                <Input
                  type="number"
                  value={planForm.deposit}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    deposit: parseInt(e.target.value) || 0 
                  }))}
                  min={0}
                  placeholder="0"
                  bg="gray.800"
                  color="white"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Daily Reward (SABI)</Field.Label>
                <Input
                  type="number"
                  step="0.1"
                  value={planForm.dailyReward}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    dailyReward: parseFloat(e.target.value) || 0 
                  }))}
                  min={0}
                  placeholder="0.0"
                  bg="gray.800"
                  color="white"
                />
              </Field.Root>
            </HStack>

            <HStack w="full" spacing={4}>
              <Field.Root required>
                <Field.Label>Duration (Days)</Field.Label>
                <Input
                  type="number"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value) || 1 
                  }))}
                  min={1}
                  placeholder="1"
                  bg="gray.800"
                  color="white"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Max Participants</Field.Label>
                <Input
                  type="number"
                  value={planForm.maxParticipants}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    maxParticipants: parseInt(e.target.value) || 1000 
                  }))}
                  min={1}
                  placeholder="1000"
                  bg="gray.800"
                  color="white"
                />
              </Field.Root>
            </HStack>

            <HStack w="full" spacing={4}>
              <VStack align="start">
                <Text fontSize="sm" color="gray.300">Auto Trigger</Text>
                <Switch
                  isChecked={planForm.autoTrigger}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    autoTrigger: e.target.checked 
                  }))}
                />
              </VStack>

              <VStack align="start">
                <Text fontSize="sm" color="gray.300">Active Status</Text>
                <Switch
                  isChecked={planForm.isActive}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    isActive: e.target.checked 
                  }))}
                />
              </VStack>
            </HStack>

            <HStack w="full" spacing={4} pt={4}>
              <Button variant="outline" onClick={onCancel} flex={1}>
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
                {isEdit ? 'Update Plan' : 'Create Plan'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );

  if (showCreateForm) {
    return (
      <PlanForm 
        onSubmit={handleCreatePlan} 
        onCancel={() => {
          setShowCreateForm(false);
          resetForm();
        }} 
      />
    );
  }

  if (showEditForm) {
    return (
      <PlanForm 
        onSubmit={handleUpdatePlan} 
        onCancel={() => {
          setShowEditForm(false);
          resetForm();
        }}
        isEdit={true}
      />
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Mining Plan Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card bg="gray.900" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Plans</StatLabel>
              <StatValueText color="white">{planStats.totalPlans}</StatValueText>
              <StatHelpText color="gray.500">All mining plans</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.900" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Active Plans</StatLabel>
              <StatValueText color="white">{planStats.activePlans}</StatValueText>
              <StatHelpText color="gray.500">Currently running</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.900" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Participants</StatLabel>
              <StatValueText color="white">{planStats.totalParticipants}</StatValueText>
              <StatHelpText color="gray.500">Across all plans</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.900" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Rewards Distributed</StatLabel>
              <StatValueText color="white">{planStats.totalRewardsDistributed}</StatValueText>
              <StatHelpText color="gray.500">Total SABI</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Header with Create Button */}
      <HStack justify="space-between">
        <Heading size="md" color="white">Mining Plan Management</Heading>
        <Button
          leftIcon={<FaPlus />}
          bg="#0088CD"
          color="white"
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          _hover={{ bg: "#0077B6" }}
        >
          Create New Plan
        </Button>
      </HStack>

              {/* Plans List */}
        <VStack spacing={4}>
          {plans.map((plan) => (
            <Card key={plan.id} bg="gray.900" borderColor="gray.700" w="full">
              <CardBody>
                <VStack spacing={4}>
                  <HStack justify="space-between" w="full">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Text fontWeight="bold" color="white" fontSize="lg">{plan.name}</Text>
                        <Badge colorScheme={getTypeColor(plan.type)}>
                          {plan.type}
                        </Badge>
                        <Badge colorScheme={getStatusColor(plan.isActive)}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.400">
                        {plan.description}
                      </Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Switch
                        isChecked={plan.isActive}
                        onChange={() => handleTogglePlan(plan.id)}
                        size="sm"
                      />
                      <Button
                        size="sm"
                        leftIcon={<FaEdit />}
                        colorScheme="blue"
                        onClick={() => openEditForm(plan)}
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
                  </HStack>

                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="bold">DEPOSIT/REWARD</Text>
                      <Text fontSize="sm" color="white">
                        Deposit: {plan.deposit} SABI
                      </Text>
                      <Text fontSize="sm" color="white">
                        Daily: {plan.dailyReward} SABI
                      </Text>
                    </VStack>

                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="bold">DURATION</Text>
                      <Text fontSize="sm" color="white">{plan.duration} days</Text>
                      {plan.autoTrigger && (
                        <Badge size="sm" colorScheme="green">Auto</Badge>
                      )}
                    </VStack>

                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="bold">PARTICIPANTS</Text>
                      <Text fontSize="sm" color="white">
                        {plan.currentParticipants} / {plan.maxParticipants}
                      </Text>
                      <Progress
                        value={(plan.currentParticipants / plan.maxParticipants) * 100}
                        size="sm"
                        colorScheme="blue"
                        w="120px"
                      />
                    </VStack>

                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="bold">APY/ROI</Text>
                      <Text fontSize="sm" color="white">
                        APY: {calculateAPY(plan.dailyReward, plan.deposit)}%
                      </Text>
                      <Text fontSize="sm" color="white">
                        ROI: {calculateROI(plan.dailyReward, plan.duration, plan.deposit)}%
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
    </VStack>
  );
};

export default MiningPlanManager;