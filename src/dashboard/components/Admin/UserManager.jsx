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
  Select,
  FieldRoot,
  FieldLabel,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  useDisclosure,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  TableScrollArea,
  Badge,
  Icon,
  Switch,
  NumberInputRoot,
  NumberInputInput,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatValueText,
  StatHelpText,
  InputGroup,
  Avatar,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Portal,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaUser,
  FaCoins,
  FaEye,
  FaEdit,
  FaBan,
  FaUserShield,
  FaGift,
  FaChevronDown
} from "react-icons/fa";
import { toaster } from "../../../components/ui/toaster";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPoints: 0,
    totalSabiEarned: 0
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isActionOpen, onOpen: onActionOpen, onClose: onActionClose } = useDisclosure();
  const { isOpen: isRewardOpen, onOpen: onRewardOpen, onClose: onRewardClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Reward form state
  const [rewardForm, setRewardForm] = useState({
    amount: 0,
    reason: '',
    type: 'bonus'
  });

  // Mock user data
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        email: 'john.doe@example.com',
        walletAddress: '0x1234...5678',
        name: 'John Doe',
        status: 'active',
        userType: 'premium',
        points: 1250,
        sabiEarned: 625,
        totalRides: 47,
        referrals: 3,
        tasksCompleted: 8,
        joinedDate: '2024-01-15',
        lastActive: '2024-01-20',
        isBlocked: false,
        avatar: null
      },
      {
        id: 2,
        email: 'jane.smith@example.com',
        walletAddress: '0xabcd...efgh',
        name: 'Jane Smith',
        status: 'active',
        userType: 'regular',
        points: 890,
        sabiEarned: 445,
        totalRides: 23,
        referrals: 1,
        tasksCompleted: 5,
        joinedDate: '2024-01-10',
        lastActive: '2024-01-19',
        isBlocked: false,
        avatar: null
      },
      {
        id: 3,
        email: 'mike.wilson@example.com',
        walletAddress: '0x9876...4321',
        name: 'Mike Wilson',
        status: 'inactive',
        userType: 'regular',
        points: 2100,
        sabiEarned: 1050,
        totalRides: 89,
        referrals: 7,
        tasksCompleted: 12,
        joinedDate: '2024-01-05',
        lastActive: '2024-01-10',
        isBlocked: true,
        avatar: null
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setUserStats({
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      totalPoints: mockUsers.reduce((sum, user) => sum + user.points, 0),
      totalSabiEarned: mockUsers.reduce((sum, user) => sum + user.sabiEarned, 0)
    });
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.userType === filterType);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus, filterType]);

  const handleUserAction = async (action, user) => {
    setSelectedUser(user);
    
    try {
      switch (action) {
        case 'block':
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, isBlocked: !u.isBlocked, status: u.isBlocked ? 'active' : 'inactive' } : u
          ));
                     toaster.create({
             title: `User ${user.isBlocked ? 'Unblocked' : 'Blocked'}`,
             description: `${user.name} has been ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`,
             status: user.isBlocked ? 'success' : 'warning',
             duration: 3000,
           });
          break;
          
        case 'promote':
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, userType: u.userType === 'premium' ? 'regular' : 'premium' } : u
          ));
                     toaster.create({
             title: 'User Updated',
             description: `${user.name} is now a ${user.userType === 'premium' ? 'regular' : 'premium'} user`,
             status: 'success',
             duration: 3000,
           });
          break;
          
        case 'reward':
          onRewardOpen();
          break;
          
        default:
          break;
      }
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to perform action. Please try again.',
         status: 'error',
         duration: 3000,
       });
    }
  };

  const handleRewardUser = async () => {
    if (!selectedUser || !rewardForm.amount || !rewardForm.reason) return;

    try {
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              sabiEarned: u.sabiEarned + rewardForm.amount,
              points: rewardForm.type === 'points' ? u.points + rewardForm.amount : u.points
            } 
          : u
      ));

             toaster.create({
         title: 'Reward Sent',
         description: `${rewardForm.amount} ${rewardForm.type === 'points' ? 'points' : 'SABI'} awarded to ${selectedUser.name}`,
         status: 'success',
         duration: 3000,
       });

      setRewardForm({ amount: 0, reason: '', type: 'bonus' });
      onRewardClose();
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to send reward. Please try again.',
         status: 'error',
         duration: 3000,
       });
    }
  };

  const exportUsers = () => {
    // Convert users data to CSV
    const csvData = [
      ['Name', 'Email', 'Wallet Address', 'Status', 'Type', 'Points', 'SABI Earned', 'Total Rides', 'Joined Date'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.walletAddress,
        user.status,
        user.userType,
        user.points,
        user.sabiEarned,
        user.totalRides,
        user.joinedDate
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sabi_ride_users.csv';
    link.click();
    window.URL.revokeObjectURL(url);

         toaster.create({
       title: 'Export Complete',
       description: 'User data has been exported successfully',
       status: 'success',
       duration: 3000,
     });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      default: return 'gray';
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'premium': return 'purple';
      case 'regular': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* User Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Users</StatLabel>
                              <StatValueText>{userStats.totalUsers}</StatValueText>
              <StatHelpText>All registered users</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Users</StatLabel>
                              <StatValueText>{userStats.activeUsers}</StatValueText>
              <StatHelpText>Currently active</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Points</StatLabel>
                              <StatValueText>{userStats.totalPoints.toLocaleString()}</StatValueText>
              <StatHelpText>All user points</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>SABI Earned</StatLabel>
                              <StatValueText>{userStats.totalSabiEarned.toLocaleString()}</StatValueText>
              <StatHelpText>Total distributed</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Header with Search and Filters */}
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <Heading size="md">User Management</Heading>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="green"
                onClick={exportUsers}
              >
                Export Data
              </Button>
            </HStack>

            <HStack spacing={4} w="full">
              <InputGroup 
                flex={2}
                startElement={<Icon as={FaSearch} color="gray.400" />}
              >
                <Input
                  placeholder="Search by name, email, or wallet address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                maxW="200px"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>

              <Select
                placeholder="Filter by Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                maxW="200px"
              >
                <option value="all">All Types</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
              </Select>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardBody>
                        <TableScrollArea>
            <TableRoot variant="simple">
              <TableHeader>
                <TableRow>
                  <TableColumnHeader>User</TableColumnHeader>
                  <TableColumnHeader>Wallet</TableColumnHeader>
                  <TableColumnHeader>Status</TableColumnHeader>
                  <TableColumnHeader>Type</TableColumnHeader>
                  <TableColumnHeader>Points</TableColumnHeader>
                  <TableColumnHeader>SABI Earned</TableColumnHeader>
                  <TableColumnHeader>Rides</TableColumnHeader>
                  <TableColumnHeader>Actions</TableColumnHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <HStack>
                        <Avatar size="sm" name={user.name} src={user.avatar} />
                        <Box>
                          <Text fontWeight="bold">{user.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {user.email}
                          </Text>
                        </Box>
                      </HStack>
                    </TableCell>
                    <TableCell>
                      <Text fontSize="sm" fontFamily="mono">
                        {user.walletAddress}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Badge colorScheme={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge colorScheme={getUserTypeColor(user.userType)}>
                        {user.userType}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.points.toLocaleString()}</TableCell>
                    <TableCell>{user.sabiEarned.toLocaleString()}</TableCell>
                    <TableCell>{user.totalRides}</TableCell>
                    <TableCell>
                      <MenuRoot>
                        <MenuTrigger asChild>
                          <Button size="sm" rightIcon={<FaChevronDown />}>
                            Actions
                          </Button>
                        </MenuTrigger>
                        <Portal>
                          <MenuContent>
                          <MenuItem 
                            icon={<FaEye />}
                            onClick={() => {
                              setSelectedUser(user);
                              onOpen();
                            }}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem 
                            icon={<FaGift />}
                            onClick={() => handleUserAction('reward', user)}
                          >
                            Send Reward
                          </MenuItem>
                          <MenuItem 
                            icon={<FaUserShield />}
                            onClick={() => handleUserAction('promote', user)}
                          >
                            {user.userType === 'premium' ? 'Demote to Regular' : 'Promote to Premium'}
                          </MenuItem>
                          <MenuItem 
                            icon={<FaBan />}
                            onClick={() => handleUserAction('block', user)}
                            color={user.isBlocked ? 'green.500' : 'red.500'}
                          >
                            {user.isBlocked ? 'Unblock User' : 'Block User'}
                          </MenuItem>
                          </MenuContent>
                        </Portal>
                      </MenuRoot>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
                        </TableScrollArea>
        </CardBody>
      </Card>

      {/* User Details Modal */}
      <DialogRoot open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>User Details</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <Avatar size="lg" name={selectedUser.name} src={selectedUser.avatar} />
                  <Box flex={1}>
                    <Text fontSize="xl" fontWeight="bold">{selectedUser.name}</Text>
                    <Text color="gray.600">{selectedUser.email}</Text>
                    <HStack mt={2}>
                      <Badge colorScheme={getStatusColor(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                      <Badge colorScheme={getUserTypeColor(selectedUser.userType)}>
                        {selectedUser.userType}
                      </Badge>
                    </HStack>
                  </Box>
                </HStack>

                <SimpleGrid columns={2} spacing={4}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Points Balance</StatLabel>
                        <StatValueText>{selectedUser.points.toLocaleString()}</StatValueText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>SABI Earned</StatLabel>
                        <StatValueText>{selectedUser.sabiEarned.toLocaleString()}</StatValueText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Rides</StatLabel>
                        <StatValueText>{selectedUser.totalRides}</StatValueText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Referrals</StatLabel>
                        <StatValueText>{selectedUser.referrals}</StatValueText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Box>
                  <Text fontWeight="bold" mb={2}>Account Information</Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text>Wallet Address:</Text>
                      <Text fontFamily="mono" fontSize="sm">{selectedUser.walletAddress}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Joined Date:</Text>
                      <Text>{selectedUser.joinedDate}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Last Active:</Text>
                      <Text>{selectedUser.lastActive}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Tasks Completed:</Text>
                      <Text>{selectedUser.tasksCompleted}</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>

      {/* Send Reward Modal */}
      <DialogRoot open={isRewardOpen} onOpenChange={({ open }) => !open && onRewardClose()}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>Send Reward to {selectedUser?.name}</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
            <VStack spacing={4}>
              <FieldRoot required>
                <FieldLabel>Reward Type</FieldLabel>
                <Select
                  value={rewardForm.type}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="bonus">SABI Bonus</option>
                  <option value="points">Points</option>
                </Select>
              </FieldRoot>

              <FieldRoot required>
                <FieldLabel>Amount</FieldLabel>
                <NumberInputRoot
                  value={rewardForm.amount}
                  onValueChange={({ value }) => setRewardForm(prev => ({ 
                    ...prev, 
                    amount: parseInt(value) || 0 
                  }))}
                  min={1}
                >
                  <NumberInputInput />
                </NumberInputRoot>
              </FieldRoot>

              <FieldRoot required>
                <FieldLabel>Reason</FieldLabel>
                <Input
                  value={rewardForm.reason}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for reward"
                />
              </FieldRoot>

              <HStack w="full" spacing={4} pt={4}>
                <Button variant="outline" onClick={onRewardClose} flex={1}>
                  Cancel
                </Button>
                <Button
                  bg="#0088CD"
                  color="white"
                  onClick={handleRewardUser}
                  flex={1}
                  _hover={{ bg: "#0077B6" }}
                >
                  Send Reward
                </Button>
              </HStack>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </VStack>
  );
};

export default UserManager;