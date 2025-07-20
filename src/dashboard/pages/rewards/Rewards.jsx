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
  Badge,
  Alert,
  SimpleGrid,
  Icon,
  Spinner,
  Divider
} from "@chakra-ui/react";
import { 
  FaTwitter, 
  FaUserPlus, 
  FaThumbsUp, 
  FaComment, 
  FaCheck,
  FaExternalLinkAlt 
} from "react-icons/fa";
import { useWeb3 } from "../../../hooks/useWeb3";
import { toaster } from "../../../components/ui/toaster";

const Rewards = () => {
  const { isConnected, address } = useWeb3();
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [comment, setComment] = useState('');
  
  const [activeTask, setActiveTask] = useState(null);

  // Mock task data
  const tasks = [
    {
      id: 'referral',
      title: 'Refer a Friend',
      description: 'Invite someone to join Sabi Ride platform',
      reward: 7,
      icon: FaUserPlus,
      color: 'green',
      action: 'Submit Referral Code',
      instructions: 'Enter the referral code or email of the person you referred.',
    },
    {
      id: 'follow_twitter',
      title: 'Follow on X (Twitter)',
      description: 'Follow @SabiRide on Twitter/X',
      reward: 7,
      icon: FaTwitter,
      color: 'blue',
      action: 'Verify Follow',
      instructions: 'Enter your Twitter handle to verify you are following @SabiRide.',
      externalLink: 'https://twitter.com/sabiride', // Replace with actual handle
    },
    {
      id: 'like_post',
      title: 'Like a Post',
      description: 'Like our latest post on social media',
      reward: 7,
      icon: FaThumbsUp,
      color: 'purple',
      action: 'Submit Post URL',
      instructions: 'Share the URL of the post you liked.',
    },
    {
      id: 'comment_post',
      title: 'Comment on Post',
      description: 'Leave a meaningful comment on our social media post',
      reward: 7,
      icon: FaComment,
      color: 'orange',
      action: 'Submit Comment',
      instructions: 'Share the URL of the post and your comment.',
    },
  ];

  const handleTaskClick = (task) => {
    if (completedTasks.has(task.id)) return;
    
    setActiveTask(task);
    // Removed onOpen() and onClose() as they are not directly available in this component
    // The modal logic is now handled by the toaster
  };

  const handleTaskSubmit = async () => {
    if (!activeTask) return;

    setIsSubmitting(true);
    try {
      // Simulate API call to verify task completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual verification logic for each task type
      const isVerified = true; // Mock verification
      
      if (isVerified) {
        setCompletedTasks(prev => new Set([...prev, activeTask.id]));
        
        // TODO: Call smart contract to mint reward tokens
        // await mintRewardTokens(address, activeTask.reward);
        
                  toaster.create({
            title: 'Task Completed!',
            description: `You earned ${activeTask.reward} Sabi Cash for completing "${activeTask.title}"`,
            status: 'success',
            duration: 5000,
          });
        
        // Removed onClose()
        // Reset form data
        setReferralCode('');
        setTwitterHandle('');
        setPostUrl('');
        setComment('');
              } else {
         toaster.create({
            title: 'Verification Failed',
            description: 'Unable to verify task completion. Please try again.',
            status: 'error',
            duration: 3000,
          });
        }
      } catch (error) {
       toaster.create({
          title: 'Error',
          description: 'Failed to submit task. Please try again.',
          status: 'error',
          duration: 3000,
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalEarned = () => {
    return Array.from(completedTasks).reduce((total, taskId) => {
      const task = tasks.find(t => t.id === taskId);
      return total + (task ? task.reward : 0);
    }, 0);
  };

  const renderTaskForm = () => {
    if (!activeTask) return null;

    switch (activeTask.id) {
      case 'referral':
        return (
          <VStack spacing={4}>
            <Box w="full">
              <Text fontSize="sm" color="gray.600">
                Enter the referral code or email of the person you referred.
              </Text>
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code or email of person you referred"
              />
            </Box>
          </VStack>
        );
      
      case 'follow_twitter':
        return (
          <VStack spacing={4}>
            <Box w="full">
              <Text fontSize="sm" color="gray.600">
                Enter your Twitter handle to verify you are following @SabiRide.
              </Text>
              <Input
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@yourusername"
              />
            </Box>
            {activeTask.externalLink && (
              <Link 
                href={activeTask.externalLink} 
                isExternal 
                color="blue.500"
                display="flex"
                alignItems="center"
                gap={2}
              >
                Follow @SabiRide <FaExternalLinkAlt />
              </Link>
            )}
          </VStack>
        );
      
      case 'like_post':
        return (
          <VStack spacing={4}>
            <Box w="full">
              <Text fontSize="sm" color="gray.600">
                Share the URL of the post you liked.
              </Text>
              <Input
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://twitter.com/sabiride/status/..."
              />
            </Box>
          </VStack>
        );
      
      case 'comment_post':
        return (
          <VStack spacing={4}>
            <Box w="full">
              <Text fontSize="sm" color="gray.600">
                Share the URL of the post and your comment.
              </Text>
              <Input
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://twitter.com/sabiride/status/..."
              />
            </Box>
            <Box w="full">
              <Text fontSize="sm" color="gray.600">
                What did you comment on the post?
              </Text>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you comment on the post?"
                rows={3}
              />
            </Box>
          </VStack>
        );
      
      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <Container maxW="md" py={8}>
        <Alert status="warning">
          Please connect your wallet to access rewards and tasks
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Removed Modal component */}

      <Container maxW="4xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>Rewards & Tasks</Heading>
            <Text color="gray.600">
              Complete tasks to earn Sabi Cash rewards
            </Text>
          </Box>

          {/* Earnings Summary */}
          <Card bg="green.50" borderColor="green.200">
            <CardBody>
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Tasks Completed:</Text>
                  <Badge colorScheme="green" fontSize="md" p={2}>
                    {completedTasks.size} / {tasks.length}
                  </Badge>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Total Earned:</Text>
                  <Badge colorScheme="green" fontSize="lg" p={2}>
                    {getTotalEarned()} SABI
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Available Tasks */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {tasks.map((task) => {
              const isCompleted = completedTasks.has(task.id);
              
              return (
                <Card 
                  key={task.id}
                  border="2px solid"
                  borderColor={isCompleted ? "green.500" : "gray.200"}
                  opacity={isCompleted ? 0.7 : 1}
                  cursor={isCompleted ? "default" : "pointer"}
                  _hover={!isCompleted ? { 
                    borderColor: `${task.color}.300`, 
                    transform: "translateY(-2px)" 
                  } : {}}
                  transition="all 0.2s"
                  onClick={() => handleTaskClick(task)}
                >
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon 
                          as={isCompleted ? FaCheck : task.icon} 
                          color={isCompleted ? "green.500" : `${task.color}.500`}
                          boxSize={6}
                        />
                        <Box flex={1}>
                          <Heading size="sm" mb={1}>{task.title}</Heading>
                          <Text fontSize="sm" color="gray.600">
                            {task.description}
                          </Text>
                        </Box>
                        <Badge 
                          colorScheme={isCompleted ? "green" : task.color}
                          fontSize="sm"
                          p={2}
                        >
                          {isCompleted ? "✓ Done" : `+${task.reward} SABI`}
                        </Badge>
                      </HStack>
                      
                      {!isCompleted && (
                        <Button
                          bg={`${task.color}.500`}
                          color="white"
                          size="sm"
                          _hover={{ bg: `${task.color}.600` }}
                        >
                          {task.action}
                        </Button>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* Information */}
          <Card bg="blue.50" borderColor="blue.200">
            <CardBody>
              <VStack spacing={3} align="start">
                <Text fontWeight="bold" color="blue.800">Task Rewards Information:</Text>
                <Text fontSize="sm" color="blue.700">
                  • Each completed task rewards you with 7 Sabi Cash
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • Tasks are verified automatically when possible
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • Some tasks may require manual verification (24-48 hour review)
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • Rewards are sent directly to your connected wallet
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • More tasks will be added regularly for additional earning opportunities
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </>
  );
};

export default Rewards;
