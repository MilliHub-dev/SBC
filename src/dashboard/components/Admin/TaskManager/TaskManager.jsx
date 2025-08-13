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

const TaskManager = () => {
	const [tasks, setTasks] = useState([]);
	const [selectedTask, setSelectedTask] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
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
		reward: 7,
		isActive: true,
		maxCompletions: 1000,
		externalLink: "",
		verificationMethod: "manual",
		instructions: "",
		validationRules: "",
	});

	// Mock task data
	useEffect(() => {
		const mockTasks = [
			{
				id: 1,
				title: "Follow @SabiRide on Twitter",
				description: "Follow our official Twitter account",
				type: "social",
				category: "twitter",
				reward: 7,
				isActive: true,
				completions: 245,
				maxCompletions: 1000,
				createdAt: "2024-01-15",
				externalLink: "https://twitter.com/sabiride",
				verificationMethod: "api",
				icon: FaTwitter,
			},
			{
				id: 2,
				title: "Refer a Friend",
				description: "Invite someone to join Sabi Ride",
				type: "referral",
				category: "referral",
				reward: 7,
				isActive: true,
				completions: 89,
				maxCompletions: 500,
				createdAt: "2024-01-10",
				verificationMethod: "manual",
				icon: FaUserPlus,
			},
			{
				id: 3,
				title: "Like Latest Post",
				description: "Like our latest social media post",
				type: "social",
				category: "engagement",
				reward: 7,
				isActive: false,
				completions: 156,
				maxCompletions: 200,
				createdAt: "2024-01-08",
				verificationMethod: "manual",
				icon: FaThumbsUp,
			},
		];

		setTasks(mockTasks);
		setTaskStats({
			totalTasks: mockTasks.length,
			activeTasks: mockTasks.filter((t) => t.isActive).length,
			completedToday: 47,
			totalRewardsDistributed: mockTasks.reduce(
				(sum, task) => sum + task.completions * task.reward,
				0
			),
		});
	}, []);

	const handleTaskSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (selectedTask) {
				// Update existing task
				setTasks((prev) =>
					prev.map((task) =>
						task.id === selectedTask.id
							? {
									...task,
									...taskForm,
									updatedAt: new Date().toISOString().split("T")[0],
							  }
							: task
					)
				);
				toaster.create({
					title: "Task Updated",
					description: "Task has been updated successfully",
					type: "success",
					duration: 3000,
				});
			} else {
				// Create new task
				const newTask = {
					id: Date.now(),
					...taskForm,
					completions: 0,
					createdAt: new Date().toISOString().split("T")[0],
					icon: getTaskIcon(taskForm.category),
				};

				setTasks((prev) => [...prev, newTask]);
				toaster.create({
					title: "Task Created",
					description: "New task has been created successfully",
					type: "success",
					duration: 3000,
				});
			}

			// Reset form and close modal
			resetForm();
			setOpenAddEditModal(false);
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to save task. Please try again.",
				type: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteTask = async () => {
		if (!selectedTask) return;

		try {
			setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
			toaster.create({
				title: "Task Deleted",
				description: "Task has been deleted successfully",
				type: "info",
				duration: 3000,
			});
			setOpenConfirmDeleteModal(false);
			setSelectedTask(null);
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to delete task. Please try again.",
				type: "error",
				duration: 3000,
			});
		}
	};

	const toggleTaskStatus = async (taskId) => {
		try {
			setTasks((prev) =>
				prev.map((task) =>
					task.id === taskId ? { ...task, isActive: !task.isActive } : task
				)
			);

			toaster.create({
				title: "Task Status Updated",
				description: "Task status has been changed",
				type: "success",
				duration: 2000,
			});
		} catch (error) {
			toaster.create({
				title: "Error",
				description: "Failed to update task status",
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
			reward: 7,
			isActive: true,
			maxCompletions: 1000,
			externalLink: "",
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
			type: task.type,
			category: task.category,
			reward: task.reward,
			isActive: task.isActive,
			maxCompletions: task.maxCompletions,
			externalLink: task.externalLink || "",
			verificationMethod: task.verificationMethod,
			instructions: task.instructions || "",
			validationRules: task.validationRules || "",
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
					isLoading={isLoading}
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
												<Icon as={task.icon} color="blue.500" />
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
										<Table.Cell>{task.reward} SABI</Table.Cell>
										<Table.Cell>
											{task.completions} / {task.maxCompletions}
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
														toggleTaskStatus(task.id)
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
