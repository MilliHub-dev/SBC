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
  AlertIcon,
  useToast,
  SimpleGrid,
  Divider,
  Progress,
  Icon
} from "@chakra-ui/react";
import { FaClock, FaCoins, FaGift, FaPlay, FaPause } from "react-icons/fa6";
import { useWeb3 } from "../../../hooks/useWeb3";

const Staking = () => {
  const {
    isConnected,
    sabiBalance,
    stakeSabiCash,
    claimMiningRewards,
    claimStakingRewards,
    MINING_PLANS
  } = useWeb3();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState(null);
  const [nextClaimTime, setNextClaimTime] = useState(null);

  const toast = useToast();

  // Mock staking data - in real app this would come from contract
  const [stakingData, setStakingData] = useState({
    currentPlan: null,
    stakedAmount: 0,
    earnedRewards: 0,
    stakingStartTime: null,
    canClaim: false,
  });

  useEffect(() => {
    // Calculate next claim time for free plan
    if (lastClaimTime) {
      const nextClaim = new Date(lastClaimTime.getTime() + 24 * 60 * 60 * 1000);
      setNextClaimTime(nextClaim);
    }
  }, [lastClaimTime]);

  const handleStake = async (planId) => {
    const plan = Object.values(MINING_PLANS).find(p => p.id === planId);
    
    if (!plan) return;

    if (plan.deposit > parseFloat(sabiBalance)) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ${plan.deposit} Sabi Cash to stake in ${plan.name}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsStaking(true);
    try {
      await stakeSabiCash(plan.deposit, plan.id);
      setStakingData({
        currentPlan: plan,
        stakedAmount: plan.deposit,
        earnedRewards: 0,
        stakingStartTime: new Date(),
        canClaim: plan.id === 0, // Free plan can claim immediately
      });
      
      toast({
        title: 'Staking Successful',
        description: `Successfully staked ${plan.deposit} Sabi Cash in ${plan.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Staking Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsClaiming(true);
    try {
      if (stakingData.currentPlan?.id === 0) {
        // Free plan mining rewards
        await claimMiningRewards();
        setLastClaimTime(new Date());
        setStakingData(prev => ({
          ...prev,
          earnedRewards: prev.earnedRewards + MINING_PLANS.FREE.dailyReward,
          canClaim: false,
        }));
      } else {
        // Paid plan staking rewards
        await claimStakingRewards();
        setStakingData(prev => ({
          ...prev,
          earnedRewards: 0, // Reset after claiming
        }));
      }
      
      toast({
        title: 'Rewards Claimed',
        description: 'Successfully claimed your rewards',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Claim Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const canClaimFree = () => {
    if (!lastClaimTime) return true;
    const now = new Date();
    const timeDiff = now.getTime() - lastClaimTime.getTime();
    return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
  };

  const getTimeUntilNextClaim = () => {
    if (!nextClaimTime) return '';
    const now = new Date();
    const diff = nextClaimTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready to claim!';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (!isConnected) {
    return (
      <Container maxW="md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to access staking features
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>Staking & Mining</Heading>
          <Text color="gray.600">
            Stake your Sabi Cash or start mining to earn daily rewards
          </Text>
        </Box>

        {/* Current Staking Status */}
        {stakingData.currentPlan && (
          <Card bg="blue.50" borderColor="blue.200">
            <CardBody>
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Current Plan:</Text>
                  <Badge colorScheme="blue" fontSize="md" p={2}>
                    {stakingData.currentPlan.name}
                  </Badge>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Staked Amount:</Text>
                  <Text fontWeight="bold">{stakingData.stakedAmount} SABI</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Earned Rewards:</Text>
                  <Text fontWeight="bold" color="green.500">
                    {stakingData.earnedRewards} SABI
                  </Text>
                </HStack>
                
                {stakingData.currentPlan.id === 0 && (
                  <VStack w="full" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm">Next Claim:</Text>
                      <Text fontSize="sm">{getTimeUntilNextClaim()}</Text>
                    </HStack>
                    <Button
                      bg="#0088CD"
                      color="white"
                      onClick={handleClaimRewards}
                      isLoading={isClaiming}
                      isDisabled={!canClaimFree()}
                      size="sm"
                      leftIcon={<FaGift />}
                    >
                      Claim Free Rewards
                    </Button>
                  </VStack>
                )}
                
                {stakingData.currentPlan.id > 0 && (
                  <Button
                    bg="#0088CD"
                    color="white"
                    onClick={handleClaimRewards}
                    isLoading={isClaiming}
                    isDisabled={stakingData.earnedRewards === 0}
                    leftIcon={<FaGift />}
                  >
                    Claim Staking Rewards
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Mining Plans */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {Object.values(MINING_PLANS).map((plan) => (
            <Card 
              key={plan.id} 
              border="2px solid" 
              borderColor={stakingData.currentPlan?.id === plan.id ? "blue.500" : "gray.200"}
              _hover={{ borderColor: "blue.300", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box textAlign="center">
                    <Heading size="md" color="blue.600">{plan.name}</Heading>
                    <Text fontSize="2xl" fontWeight="bold" mt={2}>
                      {plan.deposit === 0 ? 'FREE' : `${plan.deposit} SABI`}
                    </Text>
                  </Box>

                  <Divider />

                  <VStack spacing={3} align="stretch">
                    <HStack>
                      <Icon as={FaCoins} color="green.500" />
                      <Text fontSize="sm">
                        <strong>{plan.dailyReward} SABI</strong> per day
                      </Text>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FaClock} color="blue.500" />
                      <Text fontSize="sm">
                        Duration: <strong>{plan.duration} day{plan.duration > 1 ? 's' : ''}</strong>
                      </Text>
                    </HStack>

                    <HStack>
                      <Icon as={plan.autoTrigger ? FaPlay : FaPause} color={plan.autoTrigger ? "green.500" : "orange.500"} />
                      <Text fontSize="sm">
                        {plan.autoTrigger ? 'Auto claim' : 'Manual claim'}
                      </Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  <VStack spacing={2}>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Total potential: <strong>{plan.dailyReward * plan.duration} SABI</strong>
                    </Text>
                    
                    <Button
                      bg="#0088CD"
                      color="white"
                      size="sm"
                      w="full"
                      onClick={() => handleStake(plan.id)}
                      isLoading={isStaking}
                      isDisabled={
                        stakingData.currentPlan?.id === plan.id ||
                        (plan.deposit > 0 && plan.deposit > parseFloat(sabiBalance))
                      }
                      _hover={{ bg: "#0077B6" }}
                    >
                      {stakingData.currentPlan?.id === plan.id ? 'Active' : 'Start Plan'}
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Account Info */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="bold">Available Sabi Cash:</Text>
                <Badge colorScheme="green" fontSize="lg" p={2}>
                  {sabiBalance} SABI
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Information */}
        <Card bg="yellow.50" borderColor="yellow.200">
          <CardBody>
            <VStack spacing={3} align="start">
              <Text fontWeight="bold" color="yellow.800">Mining & Staking Information:</Text>
              <Text fontSize="sm" color="yellow.700">
                • <strong>Free Plan:</strong> Earn 0.9 Sabi Cash every 24 hours (manual claim required)
              </Text>
              <Text fontSize="sm" color="yellow.700">
                • <strong>Basic Plan:</strong> Deposit 100 Sabi Cash, earn 15 Sabi Cash daily for 30 days
              </Text>
              <Text fontSize="sm" color="yellow.700">
                • <strong>Premium Plan:</strong> Deposit 1000 Sabi Cash, earn 170 Sabi Cash daily for 30 days (auto-claim)
              </Text>
              <Text fontSize="sm" color="yellow.700">
                • You can only be in one plan at a time
              </Text>
              <Text fontSize="sm" color="yellow.700">
                • Contract deployment required before staking can begin
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Staking;
