import React, { useState, useEffect } from "react";
import {
	Button,
	Card,
	VStack,
	HStack,
	Text,
	Badge,
	Switch,
	Heading,
	SimpleGrid,
	Stat,
	Progress,
} from "@chakra-ui/react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toaster } from "../../../../components/ui/toaster";
import PlanForm from "./PlanForm";

const MiningPlanManager = () => {
	const [plans, setPlans] = useState([]);
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [planStats, setPlanStats] = useState({});
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showEditForm, setShowEditForm] = useState(false);

	// Plan form state
	const [planForm, setPlanForm] = useState({
		name: "",
		type: "MINING",
		deposit: 0,
		dailyReward: 0,
		duration: 1,
		autoTrigger: false,
		isActive: true,
		description: "",
		maxParticipants: 10000,
		minStakeAmount: 0,
		lockPeriod: 0,
	});

	useEffect(() => {
		// Initialize with mining plans data
		const mockPlans = [
			{
				id: 1,
				name: "Free Mining",
				type: "MINING",
				deposit: 0,
				dailyReward: 0.9,
				duration: 1,
				autoTrigger: false,
				isActive: true,
				description: "Daily free mining rewards for all users",
				maxParticipants: 100000,
				currentParticipants: 1250,
				minStakeAmount: 0,
				lockPeriod: 0,
				totalRewardsDistributed: 15675,
				createdAt: "2024-01-01",
				updatedAt: "2024-01-15",
			},
			{
				id: 2,
				name: "Basic Staking",
				type: "STAKING",
				deposit: 100,
				dailyReward: 15,
				duration: 30,
				autoTrigger: false,
				isActive: true,
				description: "30-day staking plan with 15% daily returns",
				maxParticipants: 5000,
				currentParticipants: 247,
				minStakeAmount: 100,
				lockPeriod: 30,
				totalRewardsDistributed: 8950,
				createdAt: "2024-01-01",
				updatedAt: "2024-01-10",
			},
			{
				id: 3,
				name: "Premium Staking",
				type: "STAKING",
				deposit: 1000,
				dailyReward: 170,
				duration: 30,
				autoTrigger: true,
				isActive: true,
				description: "Premium 30-day auto-compounding staking",
				maxParticipants: 1000,
				currentParticipants: 89,
				minStakeAmount: 1000,
				lockPeriod: 30,
				totalRewardsDistributed: 12780,
				createdAt: "2024-01-01",
				updatedAt: "2024-01-12",
			},
		];

		setPlans(mockPlans);

		// Calculate stats
		const stats = {
			totalPlans: mockPlans.length,
			activePlans: mockPlans.filter((p) => p.isActive).length,
			totalParticipants: mockPlans.reduce(
				(sum, p) => sum + p.currentParticipants,
				0
			),
			totalRewardsDistributed: mockPlans.reduce(
				(sum, p) => sum + p.totalRewardsDistributed,
				0
			),
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
				createdAt: new Date().toISOString().split("T")[0],
				updatedAt: new Date().toISOString().split("T")[0],
			};

			setPlans((prev) => [...prev, newPlan]);

			toaster.create({
				title: "Plan Created",
				description: `${planForm.name} has been created successfully`,
				type: "success",
				duration: 3000,
			});

			resetForm();
			setShowCreateForm(false);
		} catch {
			toaster.create({
				title: "Error",
				description: "Failed to create plan. Please try again.",
				type: "error",
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
			setPlans((prev) =>
				prev.map((plan) =>
					plan.id === selectedPlan.id
						? {
								...plan,
								...planForm,
								updatedAt: new Date().toISOString().split("T")[0],
						  }
						: plan
				)
			);

			toaster.create({
				title: "Plan Updated",
				description: `${planForm.name} has been updated successfully`,
				type: "success",
				duration: 3000,
			});

			setShowEditForm(false);
		} catch {
			toaster.create({
				title: "Error",
				description: "Failed to update plan. Please try again.",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleTogglePlan = async (planId) => {
		try {
			setPlans((prev) =>
				prev.map((plan) =>
					plan.id === planId
						? {
								...plan,
								isActive: !plan.isActive,
								updatedAt: new Date().toISOString().split("T")[0],
						  }
						: plan
				)
			);

			const plan = plans.find((p) => p.id === planId);
			toaster.create({
				title: "Plan Status Updated",
				description: `${plan.name} has been ${
					plan.isActive ? "deactivated" : "activated"
				}`,
				type: "info",
				duration: 3000,
			});
		} catch (error) {
			console.error("Toggle plan error:", error);
			toaster.create({
				title: "Error",
				description: "Failed to update plan status",
				type: "error",
				duration: 3000,
			});
		}
	};

	const handleDeletePlan = async (planId) => {
		try {
			setPlans((prev) => prev.filter((plan) => plan.id !== planId));
			toaster.create({
				title: "Plan Deleted",
				description: "Mining plan has been deleted successfully",
				type: "info",
				duration: 3000,
			});
		} catch {
			toaster.create({
				title: "Error",
				description: "Failed to delete plan",
				type: "error",
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
			lockPeriod: plan.lockPeriod,
		});
		setShowEditForm(true);
	};

	const resetForm = () => {
		setPlanForm({
			name: "",
			type: "MINING",
			deposit: 0,
			dailyReward: 0,
			duration: 1,
			autoTrigger: false,
			isActive: true,
			description: "",
			maxParticipants: 10000,
			minStakeAmount: 0,
			lockPeriod: 0,
		});
		setSelectedPlan(null);
	};

	const getStatusColor = (isActive) => (isActive ? "green" : "red");
	const getTypeColor = (type) => (type === "MINING" ? "blue" : "purple");

	const calculateAPY = (dailyReward, deposit) => {
		if (deposit === 0) return 0;
		return ((dailyReward / deposit) * 365 * 100).toFixed(2);
	};

	const calculateROI = (dailyReward, duration, deposit) => {
		if (deposit === 0) return 0;
		return (((dailyReward * duration) / deposit) * 100).toFixed(2);
	};

	if (showCreateForm) {
		return (
			<PlanForm
				planForm={planForm}
				setPlanForm={setPlanForm}
				isLoading={isLoading}
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
				planForm={planForm}
				setPlanForm={setPlanForm}
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
		<VStack gap={6} align="stretch">
			{/* Mining Plan Statistics */}
			<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Total Plans</Stat.Label>
							<Stat.ValueText>{planStats.totalPlans}</Stat.ValueText>
							<Stat.HelpText>All mining plans</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Active Plans</Stat.Label>
							<Stat.ValueText>{planStats.activePlans}</Stat.ValueText>
							<Stat.HelpText>Currently running</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Total Participants</Stat.Label>
							<Stat.ValueText>
								{planStats.totalParticipants}
							</Stat.ValueText>
							<Stat.HelpText>Across all plans</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Rewards Distributed</Stat.Label>
							<Stat.ValueText>
								{planStats.totalRewardsDistributed}
							</Stat.ValueText>
							<Stat.HelpText>Total SABI</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>

			{/* Header with Create Button */}
			<HStack justify="space-between" my={3}>
				<Heading size="md" color="white">
					Mining Plan Management
				</Heading>
				<Button
					bg="#0088CD"
					color="white"
					onClick={() => {
						resetForm();
						setShowCreateForm(true);
					}}
					_hover={{ bg: "#0077B6" }}
				>
					<FaPlus />{" "}
					<Text display={{ base: `none`, md: `block` }}>
						Create New Plan
					</Text>
				</Button>
			</HStack>

			{/* Plans List */}
			<VStack gap={4}>
				{plans.map((plan) => (
					<Card.Root key={plan.id} w="full">
						<Card.Body>
							<VStack gap={4}>
								<HStack justify="space-between" w="full" mb={4}>
									<VStack align="start" gap={1}>
										<HStack flexWrap={`wrap`}>
											<Text fontWeight="700" fontSize="lg">
												{plan.name}
											</Text>
											<Badge colorPalette={getTypeColor(plan.type)}>
												{plan.type}
											</Badge>
											<Badge
												colorPalette={getStatusColor(plan.isActive)}
											>
												{plan.isActive ? "Active" : "Inactive"}
											</Badge>
										</HStack>
										<Text fontSize="sm" color="gray.500">
											{plan.description}
										</Text>
									</VStack>
									<HStack gap={2} flexWrap={`wrap`}>
										<Switch.Root
											checked={plan.isActive}
											onChange={() => handleTogglePlan(plan.id)}
											size="sm"
										>
											<Switch.HiddenInput />
											<Switch.Control />
										</Switch.Root>
										<Button
											size="sm"
											bg="#0077B6"
											onClick={() => openEditForm(plan)}
										>
											<FaEdit /> Edit
										</Button>
										<Button
											size="sm"
											bg="#b62a2aff"
											onClick={() => handleDeletePlan(plan.id)}
											isDisabled={plan.currentParticipants > 0}
										>
											<FaTrash /> Delete
										</Button>
									</HStack>
								</HStack>

								<SimpleGrid
									columns={{ base: 2, md: 4 }}
									gap={3}
									w="full"
								>
									<VStack
										align="start"
										gap={1}
										border={`1px solid`}
										p={2}
										borderColor={`gray.200`}
										rounded={`sm`}
									>
										<Text
											fontSize={{ base: `xs`, md: `md` }}
											fontWeight="bold"
										>
											DEPOSIT/REWARD
										</Text>
										<Text fontSize="xs" color={`gray.600`}>
											Deposit: {plan.deposit} SABI
										</Text>
										<Text fontSize="xs" color={`gray.600`}>
											Daily: {plan.dailyReward} SABI
										</Text>
									</VStack>

									<VStack
										align="start"
										gap={1}
										border={`1px solid`}
										p={2}
										borderColor={`gray.200`}
										rounded={`sm`}
									>
										<Text
											fontSize={{ base: `xs`, md: `md` }}
											fontWeight="bold"
										>
											DURATION
										</Text>
										<Text fontSize="xs" color={`gray.600`}>
											{plan.duration} days
										</Text>
										{plan.autoTrigger && (
											<Badge size="sm" colorPalette="green">
												Auto
											</Badge>
										)}
									</VStack>

									<VStack
										align="start"
										gap={1}
										border={`1px solid`}
										p={2}
										borderColor={`gray.200`}
										rounded={`sm`}
									>
										<Text
											fontSize={{ base: `xs`, md: `md` }}
											fontWeight="bold"
										>
											PARTICIPANTS
										</Text>
										<Text fontSize="xs" color={`gray.600`}>
											{plan.currentParticipants} /{" "}
											{plan.maxParticipants}
										</Text>
										<Progress.Root
											value={
												(plan.currentParticipants /
													plan.maxParticipants) *
												100
											}
											size="sm"
											colorPalette="blue"
											w="120px"
										>
											<Progress.Track>
												<Progress.Range />
											</Progress.Track>
										</Progress.Root>
									</VStack>

									<VStack
										align="start"
										gap={1}
										border={`1px solid`}
										p={2}
										borderColor={`gray.200`}
										rounded={`sm`}
									>
										<Text
											fontSize={{ base: `xs`, md: `md` }}
											fontWeight="bold"
										>
											APY/ROI
										</Text>
										<Text fontSize="xs" color={`gray.600`}>
											APY:{" "}
											{calculateAPY(plan.dailyReward, plan.deposit)}%
										</Text>
										<Text fontSize="xs" color={`gray.600`}>
											ROI:{" "}
											{calculateROI(
												plan.dailyReward,
												plan.duration,
												plan.deposit
											)}
											%
										</Text>
									</VStack>
								</SimpleGrid>
							</VStack>
						</Card.Body>
					</Card.Root>
				))}
			</VStack>
		</VStack>
	);
};

export default MiningPlanManager;
