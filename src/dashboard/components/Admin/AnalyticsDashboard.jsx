import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatValueText,
  StatHelpText,
  StatUpIndicator,
  StatDownIndicator,
  Badge,
  Progress,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  TableScrollArea,
  Select,
  Button
} from "@chakra-ui/react";
import {
  FaUsers,
  FaCoins,
  FaTasks,
  FaChartLine,
  FaDownload,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";

const AnalyticsDashboard = ({ stats }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [recentActivity, setRecentActivity] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [taskPerformance, setTaskPerformance] = useState([]);

  useEffect(() => {
    // Mock data for recent activity
    setRecentActivity([
      {
        id: 1,
        type: 'task_completed',
        user: 'john.doe@example.com',
        description: 'Completed "Follow on Twitter" task',
        reward: 7,
        timestamp: '2 minutes ago'
      },
      {
        id: 2,
        type: 'points_converted',
        user: 'jane.smith@example.com',
        description: 'Converted 1000 points to 500 SABI',
        reward: 500,
        timestamp: '5 minutes ago'
      },
      {
        id: 3,
        type: 'token_purchase',
        user: 'mike.wilson@example.com',
        description: 'Purchased 100 SABI with ETH',
        reward: 100,
        timestamp: '12 minutes ago'
      },
      {
        id: 4,
        type: 'staking_reward',
        user: 'alice.brown@example.com',
        description: 'Claimed staking rewards',
        reward: 15,
        timestamp: '18 minutes ago'
      },
      {
        id: 5,
        type: 'referral',
        user: 'bob.davis@example.com',
        description: 'Successful referral bonus',
        reward: 7,
        timestamp: '25 minutes ago'
      }
    ]);

    // Mock data for top users
    setTopUsers([
      {
        rank: 1,
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        totalEarned: 2450,
        tasksCompleted: 15,
        trend: 'up'
      },
      {
        rank: 2,
        name: 'John Doe',
        email: 'john.doe@example.com',
        totalEarned: 1890,
        tasksCompleted: 12,
        trend: 'up'
      },
      {
        rank: 3,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        totalEarned: 1650,
        tasksCompleted: 10,
        trend: 'down'
      },
      {
        rank: 4,
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        totalEarned: 1420,
        tasksCompleted: 8,
        trend: 'up'
      },
      {
        rank: 5,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        totalEarned: 1200,
        tasksCompleted: 7,
        trend: 'up'
      }
    ]);

    // Mock data for task performance
    setTaskPerformance([
      {
        taskName: 'Follow on Twitter',
        completions: 245,
        successRate: 89.2,
        avgTimeToComplete: '2.3 minutes',
        totalRewards: 1715
      },
      {
        taskName: 'Refer a Friend',
        completions: 89,
        successRate: 76.4,
        avgTimeToComplete: '1.2 days',
        totalRewards: 623
      },
      {
        taskName: 'Like a Post',
        completions: 156,
        successRate: 94.1,
        avgTimeToComplete: '1.8 minutes',
        totalRewards: 1092
      },
      {
        taskName: 'Comment on Post',
        completions: 78,
        successRate: 82.5,
        avgTimeToComplete: '3.1 minutes',
        totalRewards: 546
      }
    ]);
  }, [timeRange]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return '✅';
      case 'points_converted': return '🔄';
      case 'token_purchase': return '💰';
      case 'staking_reward': return '🎁';
      case 'referral': return '👥';
      default: return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'task_completed': return 'green';
      case 'points_converted': return 'blue';
      case 'token_purchase': return 'purple';
      case 'staking_reward': return 'orange';
      case 'referral': return 'pink';
      default: return 'gray';
    }
  };

  const exportData = () => {
    // Mock export functionality
    const data = {
      stats,
      recentActivity,
      topUsers,
      taskPerformance,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sabi_analytics_${new Date().getTime()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header with Controls */}
      <HStack justify="space-between">
        <Box>
          <Heading size="md">Analytics Dashboard</Heading>
          <Text color="gray.600">Real-time insights and performance metrics</Text>
        </Box>
        <HStack spacing={4}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            maxW="150px"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </Select>
          <Button
            leftIcon={<FaDownload />}
            colorScheme="blue"
            onClick={exportData}
          >
            Export Data
          </Button>
        </HStack>
      </HStack>

      {/* Key Performance Indicators */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>User Growth</StatLabel>
              <StatValueText>+{stats.monthlyGrowth}%</StatValueText>
                              <StatHelpText>
                  <StatUpIndicator />
                  vs last month
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Task Completion Rate</StatLabel>
              <StatValueText>87.3%</StatValueText>
                              <StatHelpText>
                  <StatUpIndicator />
                  +2.1% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg. Tokens per User</StatLabel>
              <StatValueText>425</StatValueText>
                              <StatHelpText>
                  <StatUpIndicator />
                  +15.2% growth
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Daily Active Users</StatLabel>
              <StatValueText>2,847</StatValueText>
                              <StatHelpText>
                  <StatDownIndicator />
                  -1.2% vs yesterday
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts and Activity */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Recent Activity */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="sm">Recent Activity</Heading>
              <VStack spacing={3} align="stretch">
                {recentActivity.map((activity) => (
                  <HStack key={activity.id} p={3} border="1px solid" borderColor="gray.200" rounded="md">
                    <Text fontSize="lg">{getActivityIcon(activity.type)}</Text>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="bold">{activity.description}</Text>
                      <Text fontSize="xs" color="gray.600">{activity.user}</Text>
                    </Box>
                    <VStack spacing={1} align="end">
                      <Badge colorScheme={getActivityColor(activity.type)}>
                        +{activity.reward} SABI
                      </Badge>
                      <Text fontSize="xs" color="gray.500">{activity.timestamp}</Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Top Performing Users */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="sm">Top Performing Users</Heading>
              <TableScrollArea>
                <TableRoot size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableColumnHeader>Rank</TableColumnHeader>
                      <TableColumnHeader>User</TableColumnHeader>
                      <TableColumnHeader>Earned</TableColumnHeader>
                      <TableColumnHeader>Tasks</TableColumnHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                                          {topUsers.map((user) => (
                        <TableRow key={user.rank}>
                          <TableCell>
                          <HStack>
                            <Text fontWeight="bold">#{user.rank}</Text>
                            {user.trend === 'up' ? (
                              <FaArrowUp color="green" />
                            ) : (
                              <FaArrowDown color="red" />
                            )}
                          </HStack>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Text fontSize="sm" fontWeight="bold">{user.name}</Text>
                            <Text fontSize="xs" color="gray.600">{user.email}</Text>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Text fontWeight="bold">{user.totalEarned} SABI</Text>
                        </TableCell>
                        <TableCell>{user.tasksCompleted}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </TableScrollArea>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Task Performance Analysis */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="sm">Task Performance Analysis</Heading>
            <TableScrollArea>
              <TableRoot>
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader>Task Name</TableColumnHeader>
                    <TableColumnHeader>Completions</TableColumnHeader>
                    <TableColumnHeader>Success Rate</TableColumnHeader>
                    <TableColumnHeader>Avg. Time</TableColumnHeader>
                    <TableColumnHeader>Total Rewards</TableColumnHeader>
                    <TableColumnHeader>Performance</TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskPerformance.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell fontWeight="bold">{task.taskName}</TableCell>
                      <TableCell>{task.completions}</TableCell>
                      <TableCell>
                        <HStack>
                          <Text>{task.successRate}%</Text>
                          <Progress
                            value={task.successRate}
                            size="sm"
                            colorScheme="green"
                            w="50px"
                          />
                        </HStack>
                      </TableCell>
                      <TableCell>{task.avgTimeToComplete}</TableCell>
                      <TableCell>{task.totalRewards} SABI</TableCell>
                      <TableCell>
                        <Badge
                          colorScheme={
                            task.successRate > 85 ? 'green' :
                            task.successRate > 70 ? 'yellow' : 'red'
                          }
                        >
                          {task.successRate > 85 ? 'Excellent' :
                           task.successRate > 70 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </TableScrollArea>
          </VStack>
        </CardBody>
      </Card>

      {/* System Health */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <VStack spacing={3}>
              <Heading size="sm">Smart Contract Health</Heading>
              <Progress value={98} colorScheme="green" size="lg" w="full" />
              <Text fontSize="sm" color="green.600">98% Uptime</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={3}>
              <Heading size="sm">API Response Time</Heading>
              <Progress value={85} colorScheme="blue" size="lg" w="full" />
              <Text fontSize="sm" color="blue.600">142ms Avg</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={3}>
              <Heading size="sm">Task Verification Rate</Heading>
              <Progress value={92} colorScheme="purple" size="lg" w="full" />
              <Text fontSize="sm" color="purple.600">92% Auto-verified</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default AnalyticsDashboard;