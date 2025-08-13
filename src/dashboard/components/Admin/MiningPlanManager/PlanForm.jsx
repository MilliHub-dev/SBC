import React from "react";
import {
	Button,
	Card,
	VStack,
	HStack,
	Text,
	Input,
	Field,
	Switch,
	Heading,
	Textarea,
	NativeSelect,
} from "@chakra-ui/react";

const PlanForm = ({
	planForm,
	setPlanForm,
	onSubmit,
	onCancel,
	isEdit = false,
	isLoading,
}) => (
	<Card.Root>
		<Card.Body>
			<form onSubmit={onSubmit}>
				<VStack gap={4}>
					<Heading
						size="2xl"
						alignSelf={`start`}
						color="#000"
						fontWeight={600}
					>
						{isEdit ? "Edit Mining Plan" : "Create New Mining Plan"}
					</Heading>

					<HStack w="full" gap={4}>
						<Field.Root required>
							<Field.Label fontSize={`md`}>Plan Name</Field.Label>
							<Input
								value={planForm.name}
								onChange={(e) =>
									setPlanForm((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								placeholder="Enter plan name"
							/>
						</Field.Root>

						<Field.Root required>
							<Field.Label fontSize={`md`}>Plan Type</Field.Label>
							<NativeSelect.Root
								value={planForm.type}
								onValueChange={(
									value // Use onValueChange instead of onChange
								) =>
									setPlanForm((prev) => ({
										...prev,
										type: value,
									}))
								}
							>
								<NativeSelect.Field>
									<option value="STAKING">Staking</option>
									<option value="MINING">Mining</option>
								</NativeSelect.Field>
								<NativeSelect.Indicator />
							</NativeSelect.Root>
						</Field.Root>
					</HStack>

					<Field.Root required>
						<Field.Label fontSize={`md`}>Description</Field.Label>
						<Textarea
							value={planForm.description}
							onChange={(e) =>
								setPlanForm((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Enter plan description"
							rows={3}
						/>
					</Field.Root>

					<HStack w="full" gap={4}>
						<Field.Root required>
							<Field.Label fontSize={`md`}>
								Deposit Amount (SABI)
							</Field.Label>
							<Input
								type="number"
								value={planForm.deposit}
								onChange={(e) =>
									setPlanForm((prev) => ({
										...prev,
										deposit: parseInt(e.target.value) || 0,
									}))
								}
								min={0}
								placeholder="0"
							/>
						</Field.Root>

						<Field.Root required>
							<Field.Label fontSize={`md`}>
								Daily Reward (SABI)
							</Field.Label>
							<Input
								type="number"
								step="0.1"
								value={planForm.dailyReward}
								onChange={(e) =>
									setPlanForm((prev) => ({
										...prev,
										dailyReward: parseFloat(e.target.value) || 0,
									}))
								}
								min={0}
								placeholder="0.0"
							/>
						</Field.Root>
					</HStack>

					<HStack w="full" gap={4}>
						<Field.Root required>
							<Field.Label>Duration (Days)</Field.Label>
							<Input
								type="number"
								value={planForm.duration}
								onChange={(e) =>
									setPlanForm((prev) => ({
										...prev,
										duration: parseInt(e.target.value) || 1,
									}))
								}
								min={1}
								placeholder="1"
							/>
						</Field.Root>

						<Field.Root>
							<Field.Label>Max Participants</Field.Label>
							<Input
								type="number"
								value={planForm.maxParticipants}
								onChange={(e) =>
									setPlanForm((prev) => ({
										...prev,
										maxParticipants: parseInt(e.target.value) || 1000,
									}))
								}
								min={1}
								placeholder="1000"
							/>
						</Field.Root>
					</HStack>

					<HStack w="full" gap={4}>
						<VStack align="start">
							<Text fontSize="sm" color="gray.500">
								Auto Trigger
							</Text>
							<Switch.Root
								checked={planForm.autoTrigger}
								onChange={(e) =>
									setPlanForm((prev) => ({
										...prev,
										autoTrigger: e.target.checked,
									}))
								}
							>
								<Switch.HiddenInput />
								<Switch.Control />
							</Switch.Root>
						</VStack>

						<VStack align="start">
							<Text fontSize="sm" color="gray.500">
								Active Status
							</Text>
							<Switch.Root
								checked={planForm.isActive}
								onChange={(e) =>
									setPlanForm((prev) => ({
										...prev,
										isActive: e.target.checked,
									}))
								}
							>
								<Switch.HiddenInput />
								<Switch.Control />
							</Switch.Root>
						</VStack>
					</HStack>

					<HStack w="full" gap={4} pt={4}>
						<Button variant="outline" onClick={onCancel} flex={1}>
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
							{isEdit ? "Update Plan" : "Create Plan"}
						</Button>
					</HStack>
				</VStack>
			</form>
		</Card.Body>
	</Card.Root>
);

export default PlanForm;
