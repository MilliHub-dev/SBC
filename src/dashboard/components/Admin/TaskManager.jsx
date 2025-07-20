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
  Field,
  Dialog,
  Portal,
  useDisclosure,
  Table,
  Badge,
  Icon,
  Switch,
  NumberInput,
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
    <VStack gap={6} align="stretch">
      {/* Task Statistics */}
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
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
          bg="#0088CD"
          color="white"
          onClick={() => {
            resetForm();
            onOpen();
          }}
          _hover={{ bg: "#0077B6" }}
        >
          <FaPlus />
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
                      <Badge colorPalette="blue">
                        {task.category}
                      </Badge>
                    </td>
                    <td>{task.reward} SABI</td>
                    <td>
                      {task.completions} / {task.maxCompletions}
                    </td>
                    <td>
                      <HStack>
                        <Badge colorPalette={getStatusColor(task.isActive)}>
                          {getStatusText(task.isActive)}
                        </Badge>
                        <Switch.Root
                          checked={task.isActive}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                          size="sm"
                        >
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                                              </HStack>
                    </td>
                    <td>
                      <HStack gap={2}>
                        <Button
                          size="sm"
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
                          <FaEye />
                          View
                        </Button>
                        <Button
                          size="sm"
                          colorPalette="blue"
                          onClick={() => openEditModal(task)}
                        >
                          <FaEdit />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorPalette="red"
                          onClick={() => openDeleteModal(task)}
                        >
                          <FaTrash />
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
      <Dialog.Root open={isOpen} onOpenChange={(e) => e.open ? null : onClose()} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                {selectedTask ? 'Edit Task' : 'Add New Task'}
              </Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body pb={6}>
            <form onSubmit={handleTaskSubmit}>
              <VStack gap={4}>
                                  <Field.Root required>
                    <Field.Label>Task Title</Field.Label>
                    <Input
                      value={taskForm.title}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title"
                    />
                  </Field.Root>

                <Field.Root required>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </Field.Root>

                <HStack w="full" gap={4}>
                  <Field.Root required>
                    <Field.Label>Task Type</Field.Label>
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
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Category</Field.Label>
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
                  </Field.Root>
                </HStack>

                <HStack w="full" gap={4}>
                  <Field.Root required>
                    <Field.Label>Reward (SABI)</Field.Label>
                    <NumberInput.Root
                      value={taskForm.reward}
                      onValueChange={(details) => setTaskForm(prev => ({ 
                        ...prev, 
                        reward: parseInt(details.value) || 0 
                      }))}
                      min={1}
                      max={100}
                    >
                      <NumberInput.Input />
                      <NumberInput.Control>
                        <NumberInput.IncrementTrigger />
                        <NumberInput.DecrementTrigger />
                      </NumberInput.Control>
                    </NumberInput.Root>
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Max Completions</Field.Label>
                    <NumberInput.Root
                      value={taskForm.maxCompletions}
                      onValueChange={(details) => setTaskForm(prev => ({ 
                        ...prev, 
                        maxCompletions: parseInt(details.value) || 0 
                      }))}
                      min={1}
                    >
                      <NumberInput.Input />
                      <NumberInput.Control>
                        <NumberInput.IncrementTrigger />
                        <NumberInput.DecrementTrigger />
                      </NumberInput.Control>
                    </NumberInput.Root>
                  </Field.Root>
                </HStack>

                <Field.Root>
                  <Field.Label>External Link</Field.Label>
                  <Input
                    value={taskForm.externalLink}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, externalLink: e.target.value }))}
                    placeholder="https://twitter.com/sabiride"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Verification Method</Field.Label>
                  <Select
                    value={taskForm.verificationMethod}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, verificationMethod: e.target.value }))}
                  >
                    <option value="manual">Manual Review</option>
                    <option value="api">API Verification</option>
                    <option value="automatic">Automatic</option>
                  </Select>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Instructions for Users</Field.Label>
                  <Textarea
                    value={taskForm.instructions}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Detailed instructions for completing the task"
                    rows={3}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Active Status</Field.Label>
                  <Switch.Root
                    checked={taskForm.isActive}
                    onCheckedChange={(details) => setTaskForm(prev => ({ ...prev, isActive: details.checked }))}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </Field.Root>

                <HStack w="full" gap={4} pt={4}>
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
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root 
        open={isDeleteOpen} 
        onOpenChange={(e) => e.open ? null : onDeleteClose()}
        role="alertdialog"
        initialFocusEl={() => cancelRef.current}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header fontSize="lg" fontWeight="bold">
                Delete Task
              </Dialog.Header>

              <Dialog.Body>
                Are you sure you want to delete "{selectedTask?.title}"? 
                This action cannot be undone.
              </Dialog.Body>

              <Dialog.Footer>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button colorPalette="red" onClick={handleDeleteTask} ml={3}>
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
};

export default TaskManager;