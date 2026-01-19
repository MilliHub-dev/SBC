import {
	Button,
	VStack,
	HStack,
	Input,
	Textarea,
	Field,
	Dialog,
	Portal,
	Switch,
	NumberInput,
	NativeSelect,
} from "@chakra-ui/react";
const AddEditTaskModal = ({
	children,
	selectedTask,
	handleTaskSubmit,
	setTaskForm,
	taskForm,
	isLoading,
	openAddEditModal,
	setOpenAddEditModal,
}) => {
	return (
		<Dialog.Root
			open={openAddEditModal}
			onOpenChange={(e) => setOpenAddEditModal(e.open)}
		>
			{children}
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4} color={`#000`}>
						<Dialog.Header fontSize={`lg`}>
							{selectedTask ? "Edit Task" : "Add New Task"}
						</Dialog.Header>
						<Dialog.CloseTrigger />
						<Dialog.Body pb={6}>
							<form onSubmit={handleTaskSubmit}>
								<VStack gap={4}>
									<Field.Root required>
										<Field.Label>Task Title</Field.Label>
										<Input
											value={taskForm.title}
											onChange={(e) =>
												setTaskForm((prev) => ({
													...prev,
													title: e.target.value,
												}))
											}
											placeholder="Enter task title"
										/>
									</Field.Root>

									<Field.Root required>
										<Field.Label>Description</Field.Label>
										<Textarea
											value={taskForm.description}
											onChange={(e) =>
												setTaskForm((prev) => ({
													...prev,
													description: e.target.value,
												}))
											}
											placeholder="Enter task description"
											rows={3}
										/>
									</Field.Root>

									<HStack w="full" gap={4}>
										<Field.Root required>
											<Field.Label>Task Type</Field.Label>
											<NativeSelect.Root
												value={taskForm.type}
												onChange={(e) =>
													setTaskForm((prev) => ({
														...prev,
														type: e.target.value,
													}))
												}
											>
												<NativeSelect.Field>
													<option value="social">
														Social Media
													</option>
													<option value="referral">
														Referral
													</option>
													<option value="engagement">
														Engagement
													</option>
													<option value="education">
														Educational
													</option>
													<option value="survey">Survey</option>
												</NativeSelect.Field>
												<NativeSelect.Indicator />
											</NativeSelect.Root>
										</Field.Root>

										<Field.Root required>
											<Field.Label>Category</Field.Label>
											<NativeSelect.Root
												value={taskForm.category}
												onChange={(e) =>
													setTaskForm((prev) => ({
														...prev,
														category: e.target.value,
													}))
												}
											>
												<NativeSelect.Field>
													<option value="twitter">Twitter</option>
													<option value="referral">
														Referral
													</option>
													<option value="engagement">
														Engagement
													</option>
													<option value="comment">Comment</option>
													<option value="follow">Follow</option>
													<option value="share">Share</option>
												</NativeSelect.Field>
												<NativeSelect.Indicator />
											</NativeSelect.Root>
										</Field.Root>
									</HStack>

									<HStack w="full" gap={4}>
										<Field.Root required>
											<Field.Label>Reward (Points)</Field.Label>
											<NumberInput.Root
												w={`full`}
												value={taskForm.rewardPoints}
												onValueChange={(details) =>
													setTaskForm((prev) => ({
														...prev,
														rewardPoints: parseInt(details.value) || 0,
													}))
												}
												min={0}
											>
												<NumberInput.Input />
												<NumberInput.Control>
													<NumberInput.IncrementTrigger />
													<NumberInput.DecrementTrigger />
												</NumberInput.Control>
											</NumberInput.Root>
										</Field.Root>

										<Field.Root>
											<Field.Label>Reward (Sabi Cash)</Field.Label>
											<NumberInput.Root
												w={`full`}
												value={taskForm.rewardSabiCash}
												onValueChange={(details) =>
													setTaskForm((prev) => ({
														...prev,
														rewardSabiCash: parseFloat(details.value) || 0,
													}))
												}
												min={0}
											>
												<NumberInput.Input />
												<NumberInput.Control>
													<NumberInput.IncrementTrigger />
													<NumberInput.DecrementTrigger />
												</NumberInput.Control>
											</NumberInput.Root>
										</Field.Root>
									</HStack>

									<HStack w="full" gap={4}>
										<Field.Root required>
											<Field.Label>Max Completions</Field.Label>
											<NumberInput.Root
												w={`full`}
												value={taskForm.maxCompletions}
												onValueChange={(details) =>
													setTaskForm((prev) => ({
														...prev,
														maxCompletions:
															parseInt(details.value) || 0,
													}))
												}
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
											value={taskForm.externalUrl}
											onChange={(e) =>
												setTaskForm((prev) => ({
													...prev,
													externalUrl: e.target.value,
												}))
											}
											placeholder="https://twitter.com/sabiride"
										/>
									</Field.Root>

									<Field.Root>
										<Field.Label>Verification Method</Field.Label>
										<NativeSelect.Root
											value={taskForm.verificationMethod}
											onChange={(e) =>
												setTaskForm((prev) => ({
													...prev,
													verificationMethod: e.target.value,
												}))
											}
										>
											<NativeSelect.Field>
												<option value="manual">
													Manual Review
												</option>
												<option value="api">
													API Verification
												</option>
												<option value="automatic">Automatic</option>
											</NativeSelect.Field>
											<NativeSelect.Indicator />
										</NativeSelect.Root>
									</Field.Root>

									<Field.Root>
										<Field.Label>Instructions for Users</Field.Label>
										<Textarea
											value={taskForm.instructions}
											onChange={(e) =>
												setTaskForm((prev) => ({
													...prev,
													instructions: e.target.value,
												}))
											}
											placeholder="Detailed instructions for completing the task"
											rows={3}
										/>
									</Field.Root>

									<Field.Root>
										<Field.Label>Active Status</Field.Label>
										<Switch.Root
											checked={taskForm.isActive}
											onCheckedChange={(details) =>
												setTaskForm((prev) => ({
													...prev,
													isActive: details.checked,
												}))
											}
										>
											<Switch.Control>
												<Switch.Thumb />
											</Switch.Control>
										</Switch.Root>
									</Field.Root>

									<HStack w="full" gap={4} pt={4}>
										<Button
											variant="outline"
											onClick={() => setOpenAddEditModal(false)}
											flex={1}
										>
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
											{selectedTask ? "Update Task" : "Create Task"}
										</Button>
									</HStack>
								</VStack>
							</form>
						</Dialog.Body>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default AddEditTaskModal;
