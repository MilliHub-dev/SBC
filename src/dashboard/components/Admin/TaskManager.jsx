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
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Badge,
  Icon,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Heading,
  SimpleGrid
} from "@chakra-ui/react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaTwitter,
  FaUserPlus,
  FaThumbsUp,
  FaComment,
  FaTasks
} from "react-icons/fa";
import { toaster } from "../../../components/ui/toaster";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedToday: 0,
    totalRewardsDistributed: 0
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'social',
    category: 'twitter',
    reward: 7,
    isActive: true,
    maxCompletions: 1000,
    externalLink: '',
    verificationMethod: 'manual',
    instructions: '',
    validationRules: ''
  });

  // Mock task data
  useEffect(() => {
    const mockTasks = [
      {
        id: 1,
        title: 'Follow @SabiRide on Twitter',
        description: 'Follow our official Twitter account',
        type: 'social',
        category: 'twitter',
        reward: 7,
        isActive: true,
        completions: 245,
        maxCompletions: 1000,
        createdAt: '2024-01-15',
        externalLink: 'https://twitter.com/sabiride',
        verificationMethod: 'api',
        icon: FaTwitter
      },
      {
        id: 2,
        title: 'Refer a Friend',
        description: 'Invite someone to join Sabi Ride',
        type: 'referral',
        category: 'referral',
        reward: 7,
        isActive: true,
        completions: 89,
        maxCompletions: 500,
        createdAt: '2024-01-10',
        verificationMethod: 'manual',
        icon: FaUserPlus
      },
      {
        id: 3,
        title: 'Like Latest Post',
        description: 'Like our latest social media post',
        type: 'social',
        category: 'engagement',
        reward: 7,
        isActive: false,
        completions: 156,
        maxCompletions: 200,
        createdAt: '2024-01-08',
        verificationMethod: 'manual',
        icon: FaThumbsUp
      }
    ];

    setTasks(mockTasks);
    setTaskStats({
      totalTasks: mockTasks.length,
      activeTasks: mockTasks.filter(t => t.isActive).length,
      completedToday: 47,
      totalRewardsDistributed: mockTasks.reduce((sum, task) => sum + (task.completions * task.reward), 0)
    });
  }, []);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (selectedTask) {
        // Update existing task
        setTasks(prev => prev.map(task => 
          task.id === selectedTask.id 
            ? { ...task, ...taskForm, updatedAt: new Date().toISOString().split('T')[0] }
            : task
        ));
                 toaster.create({
           title: 'Task Updated',
           description: 'Task has been updated successfully',
           status: 'success',
           duration: 3000,
         });
      } else {
        // Create new task
        const newTask = {
          id: Date.now(),
          ...taskForm,
          completions: 0,
          createdAt: new Date().toISOString().split('T')[0],
          icon: getTaskIcon(taskForm.category)
        };
        
        setTasks(prev => [...prev, newTask]);
                 toaster.create({
           title: 'Task Created',
           description: 'New task has been created successfully',
           status: 'success',
           duration: 3000,
         });
      }

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to save task. Please try again.',
         status: 'error',
         duration: 3000,
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      setTasks(prev => prev.filter(task => task.id !== selectedTask.id));
             toaster.create({
         title: 'Task Deleted',
         description: 'Task has been deleted successfully',
         status: 'info',
         duration: 3000,
       });
      onDeleteClose();
      setSelectedTask(null);
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to delete task. Please try again.',
         status: 'error',
         duration: 3000,
       });
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, isActive: !task.isActive }
          : task
      ));
      
             toaster.create({
         title: 'Task Status Updated',
         description: 'Task status has been changed',
         status: 'success',
         duration: 2000,
       });
    } catch (error) {
             toaster.create({
         title: 'Error',
         description: 'Failed to update task status',
         status: 'error',
         duration: 3000,
       });
    }
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      type: 'social',
      category: 'twitter',
      reward: 7,
      isActive: true,
      maxCompletions: 1000,
      externalLink: '',
      verificationMethod: 'manual',
      instructions: '',
      validationRules: ''
    });
    setSelectedTask(null);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      type: task.type,
      category: task.category,
      reward: task.reward,
      isActive: task.isActive,
      maxCompletions: task.maxCompletions,
      externalLink: task.externalLink || '',
      verificationMethod: task.verificationMethod,
      instructions: task.instructions || '',
      validationRules: task.validationRules || ''
    });
    onOpen();
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    onDeleteOpen();
  };

  const getTaskIcon = (category) => {
    const icons = {
      twitter: FaTwitter,
      referral: FaUserPlus,
      engagement: FaThumbsUp,
      comment: FaComment
    };
    return icons[category] || FaTasks;
  };

  const getStatusColor = (isActive) => isActive ? 'green' : 'red';
  const getStatusText = (isActive) => isActive ? 'Active' : 'Inactive';

  return (
    <VStack spacing={6} align="stretch">
      {/* Task Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Box>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">Total Tasks</Text>
              <Text fontSize="2xl" fontWeight="bold">{taskStats.totalTasks}</Text>
              <Text fontSize="xs" color="gray.400">All time</Text>
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Box>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">Active Tasks</Text>
              <Text fontSize="2xl" fontWeight="bold">{taskStats.activeTasks}</Text>
              <Text fontSize="xs" color="gray.400">Currently available</Text>
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Box>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">Completed Today</Text>
              <Text fontSize="2xl" fontWeight="bold">{taskStats.completedToday}</Text>
              <Text fontSize="xs" color="gray.400">Task completions</Text>
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Box>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">Rewards Distributed</Text>
              <Text fontSize="2xl" fontWeight="bold">{taskStats.totalRewardsDistributed}</Text>
              <Text fontSize="xs" color="gray.400">Total SABI</Text>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Header with Add Button */}
      <HStack justify="space-between">
        <Heading size="md">Task Management</Heading>
        <Button
          leftIcon={<FaPlus />}
          bg="#0088CD"
          color="white"
          onClick={() => {
            resetForm();
            onOpen();
          }}
          _hover={{ bg: "#0077B6" }}
        >
          Add New Task
        </Button>
      </HStack>

      {/* Tasks Table */}
      <Card>
        <CardBody>
            <Table variant="simple">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Category</th>
                  <th>Reward</th>
                  <th>Completions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <HStack>
                        <Icon as={task.icon} color="blue.500" />
                        <Box>
                          <Text fontWeight="bold">{task.title}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {task.description}
                          </Text>
                        </Box>
                      </HStack>
                    </td>
                    <td>
                      <Badge colorScheme="blue">
                        {task.category}
                      </Badge>
                    </td>
                    <td>{task.reward} SABI</td>
                    <td>
                      {task.completions} / {task.maxCompletions}
                    </td>
                    <td>
                      <HStack>
                        <Badge colorScheme={getStatusColor(task.isActive)}>
                          {getStatusText(task.isActive)}
                        </Badge>
                        <Switch
                          isChecked={task.isActive}
                          onChange={() => toggleTaskStatus(task.id)}
                          size="sm"
                        />
                                              </HStack>
                    </td>
                    <td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<FaEye />}
                          variant="outline"
                          onClick={() => {
                            // TODO: Implement view task details
                                                         toaster.create({
                               title: 'Task Details',
                               description: `Viewing details for: ${task.title}`,
                               status: 'info',
                               duration: 2000,
                             });
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<FaEdit />}
                          colorScheme="blue"
                          onClick={() => openEditModal(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<FaTrash />}
                          colorScheme="red"
                          onClick={() => openDeleteModal(task)}
                        >
                          Delete
                        </Button>
                                              </HStack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedTask ? 'Edit Task' : 'Add New Task'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleTaskSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Task Title</FormLabel>
                  <Input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </FormControl>

                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Task Type</FormLabel>
                    <Select
                      value={taskForm.type}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="social">Social Media</option>
                      <option value="referral">Referral</option>
                      <option value="engagement">Engagement</option>
                      <option value="education">Educational</option>
                      <option value="survey">Survey</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={taskForm.category}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="twitter">Twitter</option>
                      <option value="referral">Referral</option>
                      <option value="engagement">Engagement</option>
                      <option value="comment">Comment</option>
                      <option value="follow">Follow</option>
                      <option value="share">Share</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Reward (SABI)</FormLabel>
                    <NumberInput
                      value={taskForm.reward}
                      onChange={(valueString) => setTaskForm(prev => ({ 
                        ...prev, 
                        reward: parseInt(valueString) || 0 
                      }))}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Max Completions</FormLabel>
                    <NumberInput
                      value={taskForm.maxCompletions}
                      onChange={(valueString) => setTaskForm(prev => ({ 
                        ...prev, 
                        maxCompletions: parseInt(valueString) || 0 
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

                <FormControl>
                  <FormLabel>External Link</FormLabel>
                  <Input
                    value={taskForm.externalLink}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, externalLink: e.target.value }))}
                    placeholder="https://twitter.com/sabiride"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Verification Method</FormLabel>
                  <Select
                    value={taskForm.verificationMethod}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, verificationMethod: e.target.value }))}
                  >
                    <option value="manual">Manual Review</option>
                    <option value="api">API Verification</option>
                    <option value="automatic">Automatic</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Instructions for Users</FormLabel>
                  <Textarea
                    value={taskForm.instructions}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Detailed instructions for completing the task"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Active Status</FormLabel>
                  <Switch
                    isChecked={taskForm.isActive}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                </FormControl>

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
                    {selectedTask ? 'Update Task' : 'Create Task'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Task
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{selectedTask?.title}"? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteTask} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default TaskManager;