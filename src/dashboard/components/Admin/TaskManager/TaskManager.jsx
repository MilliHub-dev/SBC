import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Card,
	VStack,
	HStack,
	Text,
	Dialog,
	Table,
	Badge,
	Icon,
	Switch,
	Heading,
	SimpleGrid,
	Stat,
	Spinner,
	Center,
} from "@chakra-ui/react";
import {
	FaPlus,
	FaEdit,
	FaTrash,
	FaEye,
	FaTwitter,
	FaUserPlus,
	FaThumbsUp,
	FaComment,
	FaTasks,
} from "react-icons/fa";
import { toaster } from "../../../../components/ui/toaster";
import AddEditTaskModal from "./AddEditTaskModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { tasksAPI } from "../../../../config/apiConfig";

const TaskManager = ({ tasks: initialTasks = [], loading = false, onRefresh, stats }) => {
	const [tasks, setTasks] = useState([]);
	const [selectedTask, setSelectedTask] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [taskStats, setTaskStats] = useState({
		totalTasks: 0,
		activeTasks: 0,
		completedToday: 0,
		totalRewardsDistributed: 0,
	});

	const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
	const [openAddEditModal, setOpenAddEditModal] = useState(false);

	const cancelRef = React.useRef();

	// Task form state
	const [taskForm, setTaskForm] = useState({
		title: "",
		description: "",
		type: "social",
		category: "twitter",
		rewardPoints: 0,
		rewardSabiCash: 0,
		isActive: true,
		maxCompletions: 1000,
		externalUrl: "",
		verificationMethod: "manual",
		instructions: "",
		validationRules: "",
	});

	// Update local state when props change
	useEffect(() => {
		if (initialTasks) {
			setTasks(initialTasks);
			
			// Calculate stats from tasks if stats prop is not yet available
			if (!stats) {
				setTaskStats({
					totalTasks: initialTasks.length,
					activeTasks: initialTasks.filter((t) => t.isActive).length,
					completedToday: 0, 
					totalRewardsDistributed: 0,
				});
			}
		}
	}, [initialTasks, stats]);

	// Update stats when stats prop changes
	useEffect(() => {
		if (stats) {
			setTaskStats({
				totalTasks: stats.totalTasks,
				activeTasks: stats.activeTasks,
				completedToday: stats.completedToday,
				totalRewardsDistributed: stats.totalRewardsDistributed,
			});
		}
	}, [stats]);

	const handleTaskSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const taskData = {
				title: taskForm.title,
				description: taskForm.description,
				taskType: taskForm.type,
				category: taskForm.category,
				rewardPoints: Number(taskForm.rewardPoints),
				rewardSabiCash: Number(taskForm.rewardSabiCash),
				maxCompletions: Number(taskForm.maxCompletions),
				verificationMethod: taskForm.verificationMethod,
				externalUrl: taskForm.externalUrl,
				isActive: taskForm.isActive,
				taskData: {
					instructions: taskForm.instructions,
					validationRules: taskForm.validationRules
				}
			};

			if (selectedTask) {
				// Update existing task
				const result = await tasksAPI.updateTask(selectedTask.id, taskData);
				if (result.success) {
					toaster.create({
						title: "Task Updated",
						description: "Task has been updated successfully",
						type: "success",
						duration: 3000,
					});
					if (onRefresh) onRefresh();
				} else {
					throw new Error(result.error || "Failed to update task");
				}
			} else {
				// Create new task
				const result = await tasksAPI.createTask(taskData);
				if (result.success) {
					toaster.create({
						title: "Task Created",
						description: "New task has been created successfully",
						type: "success",
						duration: 3000,
					});
					if (onRefresh) onRefresh();
				} else {
					throw new Error(result.error || "Failed to create task");
				}
			}

			// Reset form and close modal
			resetForm();
			setOpenAddEditModal(false);
		} catch (error) {
			console.error("Task save error:", error);
			toaster.create({
				title: "Error",
				description: error.message || "Failed to save task. Please try again.",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteTask = async () => {
		if (!selectedTask) return;

		try {
			const result = await tasksAPI.deleteTask(selectedTask.id);
			if (result.success) {
				toaster.create({
					title: "Task Deleted",
					description: "Task has been deleted successfully",
					type: "info",
					duration: 3000,
				});
				setOpenConfirmDeleteModal(false);
				setSelectedTask(null);
				if (onRefresh) onRefresh();
			} else {
				throw new Error(result.error || "Failed to delete task");
			}
		} catch (error) {
			console.error("Task delete error:", error);
			toaster.create({
				title: "Error",
				description: error.message || "Failed to delete task. Please try again.",
				type: "error",
				duration: 3000,
			});
		}
	};

	const toggleTaskStatus = async (task) => {
		try {
			const result = await tasksAPI.updateTask(task.id, {
				isActive: !task.is_active
			});

			if (result.success) {
				toaster.create({
					title: "Task Status Updated",
					description: "Task status has been changed",
					type: "success",
					duration: 2000,
				});
				if (onRefresh) onRefresh();
			} else {
				throw new Error(result.error || "Failed to update task status");
			}
		} catch (error) {
			console.error("Task status update error:", error);
			toaster.create({
				title: "Error",
				description: error.message || "Failed to update task status",
				type: "error",
				duration: 3000,
			});
		}
	};

	const resetForm = () => {
		setTaskForm({
			title: "",
			description: "",
			type: "social",
			category: "twitter",
			rewardPoints: 0,
			rewardSabiCash: 0,
			isActive: true,
			maxCompletions: 1000,
			externalUrl: "",
			verificationMethod: "manual",
			instructions: "",
			validationRules: "",
		});
		setSelectedTask(null);
	};

	const openEditModal = (task) => {
		setSelectedTask(task);
		setTaskForm({
			title: task.title,
			description: task.description,
			type: task.taskType || "social",
			category: task.category || "twitter",
			rewardPoints: task.rewardPoints || 0,
			rewardSabiCash: task.rewardSabiCash || 0,
			isActive: task.isActive,
			maxCompletions: task.maxCompletions || 1000,
			externalUrl: task.externalUrl || "",
			verificationMethod: task.verificationMethod || "manual",
			instructions: task.taskData?.instructions || "",
			validationRules: task.taskData?.validationRules || "",
		});
		setOpenAddEditModal(true);
	};

	const openDeleteModal = (task) => {
		setSelectedTask(task);
		// setOpenConfirmDeleteModal(true);
	};

	const getTaskIcon = (category) => {
		const icons = {
			twitter: FaTwitter,
			referral: FaUserPlus,
			engagement: FaThumbsUp,
			comment: FaComment,
		};
		return icons[category] || FaTasks;
	};

	const getStatusColor = (isActive) => (isActive ? "green" : "red");
	const getStatusText = (isActive) => (isActive ? "Active" : "Inactive");

	if (loading) {
		return (
			<Center py={10}>
				<Spinner size="xl" color="blue.500" />
			</Center>
		);
	}

	return (
		<VStack gap={6} align="stretch">
			{/* Task Statistics */}
			<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Total Tasks</Stat.Label>
							<Stat.ValueText>{taskStats.totalTasks}</Stat.ValueText>
							<Stat.HelpText>All time</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label> Active Tasks</Stat.Label>
							<Stat.ValueText>{taskStats.activeTasks}</Stat.ValueText>
							<Stat.HelpText> Currently available</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Completed Today</Stat.Label>
							<Stat.ValueText>{taskStats.completedToday}</Stat.ValueText>
							<Stat.HelpText>Task completions</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>

				<Card.Root>
					<Card.Body>
						<Stat.Root>
							<Stat.Label>Rewards Distributed</Stat.Label>
							<Stat.ValueText>
								{taskStats.totalRewardsDistributed}
							</Stat.ValueText>
							<Stat.HelpText>Total SABI</Stat.HelpText>
						</Stat.Root>
					</Card.Body>
				</Card.Root>
			</SimpleGrid>

			{/* Header with Add Button */}
			<HStack justify="space-between" alignItems={`center`}>
				<Heading size="lg" fontWeight={600}>
					Task Management
				</Heading>

				{/* Add/Edit Task Modal */}
				<AddEditTaskModal
					handleTaskSubmit={handleTaskSubmit}
					isLoading={isSubmitting}
					selectedTask={selectedTask}
					taskForm={taskForm}
					setTaskForm={setTaskForm}
					openAddEditModal={openAddEditModal}
					setOpenAddEditModal={setOpenAddEditModal}
				>
					<Dialog.Trigger>
						<Button
							bg="#0088CD"
							color="white"
							onClick={() => {
								resetForm();
							}}
							_hover={{ bg: "#0077B6" }}
						>
							<FaPlus size={`sm`} />
							<Text display={{ base: `none`, md: `block` }}>
								Add New Task
							</Text>
						</Button>
					</Dialog.Trigger>
				</AddEditTaskModal>
			</HStack>

			{/* Tasks Table */}
			<Card.Root rounded={`sm`}>
				<Card.Body p={2} rounded={`sm`}>
					<Table.ScrollArea maxH={`500px`}>
						<Table.Root stickyHeader>
							<Table.Header>
								<Table.Row
									fontSize={15}
									bg={`bg.muted`}
									fontWeight={`bold`}
								>
									<Table.ColumnHeader>Task</Table.ColumnHeader>
									<Table.ColumnHeader>Category</Table.ColumnHeader>
									<Table.ColumnHeader>Reward</Table.ColumnHeader>
									<Table.ColumnHeader>Completions</Table.ColumnHeader>
									<Table.ColumnHeader>Status</Table.ColumnHeader>
									<Table.ColumnHeader>Actions</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{tasks.map((task) => (
									<Table.Row key={task.id}>
										<Table.Cell>
											<HStack>
												<Icon as={getTaskIcon(task.category)} color="blue.500" />
												<Box>
													<Text
														fontWeight="600"
														textWrap={`nowrap`}
													>
														{task.title}
													</Text>
													<Text fontSize="13px" color="gray.500">
														{task.description}
													</Text>
												</Box>
											</HStack>
										</Table.Cell>
										<Table.Cell>
											<Badge colorPalette="blue">
												{task.category}
											</Badge>
										</Table.Cell>
										<Table.Cell>
											<VStack align="start" gap={0}>
												<Text>{task.rewardPoints} Pts</Text>
												{Number(task.rewardSabiCash) > 0 && (
													<Text fontSize="xs" color="green.500">
														+ ${Number(task.rewardSabiCash).toFixed(2)}
													</Text>
												)}
											</VStack>
										</Table.Cell>
										<Table.Cell>
											{task.completionCount || 0} / {task.maxCompletions}
										</Table.Cell>
										<Table.Cell>
											<HStack>
												<Badge
													colorPalette={getStatusColor(
														task.isActive
													)}
												>
													{getStatusText(task.isActive)}
												</Badge>
												<Switch.Root
													checked={task.isActive}
													onCheckedChange={() =>
														toggleTaskStatus(task)
													}
													size="sm"
												>
													<Switch.HiddenInput />
													<Switch.Control>
														<Switch.Thumb />
													</Switch.Control>
												</Switch.Root>
											</HStack>
										</Table.Cell>
										<Table.Cell>
											<HStack gap={2}>
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														// TODO: Implement view task details
														toaster.create({
															title: "Task Details",
															description: `Viewing details for: ${task.title}`,
															type: "info",
															duration: 2000,
														});
													}}
												>
													<FaEye />
													View
												</Button>
												<Button
													size="sm"
													bg="#0077B6"
													onClick={() => openEditModal(task)}
												>
													<FaEdit />
													Edit
												</Button>

												{/* Delete Confirmation Dialog */}
												<DeleteConfirmModal
													handleDeleteTask={handleDeleteTask}
													selectedTask={selectedTask}
													cancelRef={cancelRef}
													openConfirmDeleteModal={
														openConfirmDeleteModal
													}
													setOpenConfirmDeleteModal={
														setOpenConfirmDeleteModal
													}
												>
													<Dialog.Trigger>
														<Button
															size="sm"
															bg="#b62a2aff"
															onClick={() =>
																openDeleteModal(task)
															}
														>
															<FaTrash />
															Delete
														</Button>
													</Dialog.Trigger>
												</DeleteConfirmModal>
											</HStack>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Table.ScrollArea>
				</Card.Body>
			</Card.Root>
		</VStack>
	);
};

export default TaskManager;
