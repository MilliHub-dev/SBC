import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  SimpleGrid,
  Alert,
  Tabs,
  Badge,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  Spinner
} from "@chakra-ui/react";
import { FaUsers, FaTasks, FaCoins, FaChartLine, FaCog, FaDatabase } from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";
import TaskManager from "../../components/Admin/TaskManager";
import UserManager from "../../components/Admin/UserManager";
import ContractManager from "../../components/Admin/ContractManager";
import AnalyticsDashboard from "../../components/Admin/AnalyticsDashboard";
import MiningPlanManager from "../../components/Admin/MiningPlanManager";

const AdminPanel = () => {
  const { isConnected, address, isLoggedIn } = useWeb3();
  const [activeTab, setActiveTab] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTokens: 0,
    activeTasks: 0,
    pendingRewards: 0,
    totalStaked: 0,
    monthlyGrowth: 0
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected || !address) return;
      
      // TODO: Implement actual admin check
      // For now, we'll use a mock check
      const adminAddresses = [
        // Add admin wallet addresses here
        "0x...", // Replace with actual admin addresses
      ];
      
      const isAdmin = adminAddresses.includes(address.toLowerCase()) || 
                     localStorage.getItem('isAdmin') === 'true'; // For demo purposes
      
      setIsAuthorized(isAdmin);
      
              if (!isAdmin) {
         toaster.create({
            title: 'Access Denied',
            description: 'You do not have administrator privileges',
            status: 'error',
            duration: 5000,
          });
        }
    };

    checkAdminStatus();
  }, [isConnected, address]);

  // Fetch admin statistics
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!isAuthorized) return;
      
      try {
        // TODO: Replace with actual API calls
        setAdminStats({
          totalUsers: 1250,
          totalTokens: 500000,
          activeTasks: 12,
          pendingRewards: 15000,
          totalStaked: 250000,
          monthlyGrowth: 15.8
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchAdminStats();
  }, [isAuthorized]);

  // Admin tabs configuration
  const adminTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaChartLine,
      component: <AnalyticsDashboard stats={adminStats} />
    },
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: FaTasks,
      component: <TaskManager />
    },
    {
      id: 'users',
      label: 'User Manager',
      icon: FaUsers,
      component: <UserManager />
    },
    {
      id: 'mining',
      label: 'Mining Plans',
      icon: FaCoins,
      component: <MiningPlanManager />
    },
    {
      id: 'contract',
      label: 'Contract Admin',
      icon: FaCog,
      component: <ContractManager />
    }
  ];

  if (!isConnected) {
    return (
      <Container maxW="md" py={8}>
        <Alert status="warning">
          Please connect your wallet to access the admin panel
        </Alert>
      </Container>
    );
  }

  if (!isAuthorized) {
    return (
      <Container maxW="md" py={8}>
        <Alert status="error">
          <Box>
            <Text fontWeight="bold">Access Denied</Text>
            <Text>You do not have administrator privileges for this panel.</Text>
            <Text fontSize="sm" mt={2} color="gray.600">
              Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </Text>
            <Button
              mt={3}
              size="sm"
              colorScheme="blue"
              onClick={() => {
                localStorage.setItem('isAdmin', 'true');
                setIsAuthorized(true);
              }}
            >
              Enable Demo Mode
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="8xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" mb={2}>
                <Icon as={FaDatabase} mr={3} color="red.500" />
                Admin Panel
              </Heading>
              <Text color="gray.600">
                Manage Sabi Cash ecosystem and user rewards
              </Text>
            </Box>
            <Badge colorScheme="red" fontSize="md" p={2}>
              Administrator
            </Badge>
          </HStack>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Users</StatLabel>
                <StatNumber>{adminStats.totalUsers.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {adminStats.monthlyGrowth}% this month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total SABI</StatLabel>
                <StatNumber>{adminStats.totalTokens.toLocaleString()}</StatNumber>
                <StatHelpText>In circulation</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Tasks</StatLabel>
                <StatNumber>{adminStats.activeTasks}</StatNumber>
                <StatHelpText>Currently available</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending Rewards</StatLabel>
                <StatNumber>{adminStats.pendingRewards.toLocaleString()}</StatNumber>
                <StatHelpText>SABI to be claimed</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Staked</StatLabel>
                <StatNumber>{adminStats.totalStaked.toLocaleString()}</StatNumber>
                <StatHelpText>SABI in mining plans</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Growth Rate</StatLabel>
                <StatNumber>{adminStats.monthlyGrowth}%</StatNumber>
                <StatHelpText>Monthly increase</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Admin Navigation */}
        <Card>
          <CardBody>

            <TabsRoot value={activeTab.toString()} onValueChange={(details) => setActiveTab(parseInt(details.value))}>
              <TabsList>
                {adminTabs.map((tab, index) => (
                  <TabsTrigger key={tab.id} value={index.toString()}>
                    <HStack>
                      <Icon as={tab.icon} />
                      <Text>{tab.label}</Text>
                    </HStack>
                  </TabsTrigger>
                ))}
              </TabsList>

              {adminTabs.map((tab, index) => (
                <TabsContent key={tab.id} value={index.toString()}>
                  <Box mt={6}>
                    {tab.component}
                  </Box>
                </TabsContent>
              ))}
            </TabsRoot>

          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={() => setActiveTab(1)} // Switch to Task Manager
              >
                Add New Task
              </Button>
              
              <Button
                leftIcon={<FaUsers />}
                colorScheme="green"
                onClick={() => setActiveTab(2)} // Switch to User Manager
              >
                Manage Users
              </Button>
              
              <Button
                leftIcon={<FaCog />}
                colorScheme="orange"
                onClick={() => setActiveTab(4)} // Switch to Contract Manager
              >
                Contract Settings
              </Button>
              
              <Button
                leftIcon={<FaChartLine />}
                colorScheme="purple"
                onClick={() => setActiveTab(0)} // Switch to Analytics
              >
                View Analytics
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* System Status */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>System Status</Heading>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text>Smart Contract Status</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>API Backend Status</Text>
                <Badge colorScheme="green">Online</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Polygon zkEVM Network</Text>
                <Badge colorScheme="green">Connected</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Task Verification Service</Text>
                <Badge colorScheme="yellow">Maintenance</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default AdminPanel;