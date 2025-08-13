import {
	Button,
	VStack,
	HStack,
	Dialog,
	Field,
	NumberInput,
	Switch,
	Portal,
} from "@chakra-ui/react";

const UpdateMiningPlanModal = ({
	children,
	selectedPlan,
	planForm,
	setPlanForm,
	handleUpdateMiningPlan,
	isLoading,
	openUpdatePlanModal,
	setOpenUpdatePlanModal,
}) => {
	return (
		<Dialog.Root
			open={openUpdatePlanModal}
			onOpenChange={(e) => setOpenUpdatePlanModal(e.open)}
		>
			{children}
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4} color={`#000`}>
						<Dialog.Header fontSize={`md`}>
							Edit {selectedPlan} Mining Plan
						</Dialog.Header>
						<Dialog.CloseTrigger />
						<Dialog.Body pb={6}>
							<VStack gap={4}>
								<Field.Root>
									<Field.Label>Deposit Amount (SABI)</Field.Label>
									<NumberInput.Root
										w={`full`}
										value={planForm.deposit}
										onValueChange={({ value }) =>
											setPlanForm((prev) => ({
												...prev,
												deposit: parseInt(value) || 0,
											}))
										}
										min={0}
									>
										<NumberInput.Input />
										<NumberInput.Control />
									</NumberInput.Root>
								</Field.Root>
								<Field.Root>
									<Field.Label>Daily Reward (SABI)</Field.Label>
									<NumberInput.Root
										w={`full`}
										value={planForm.dailyReward}
										onValueChange={({ value }) =>
											setPlanForm((prev) => ({
												...prev,
												dailyReward: parseFloat(value) || 0,
											}))
										}
										min={0}
										step={0.1}
									>
										<NumberInput.Input />
										<NumberInput.Control />
									</NumberInput.Root>
								</Field.Root>
								<Field.Root>
									<Field.Label>Duration (Days)</Field.Label>
									<NumberInput.Root
										w={`full`}
										value={planForm.duration}
										onValueChange={({ value }) =>
											setPlanForm((prev) => ({
												...prev,
												duration: parseInt(value) || 1,
											}))
										}
										min={1}
									>
										<NumberInput.Input />
										<NumberInput.Control />
									</NumberInput.Root>
								</Field.Root>
								<Field.Root>
									<Field.Label>Auto Trigger</Field.Label>
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
								</Field.Root>
								<HStack w="full" gap={4} pt={4}>
									<Dialog.CloseTrigger>
										<Button
											variant="outline"
											// onClick={onPlanClose}
											flex={1}
										>
											Cancel
										</Button>
									</Dialog.CloseTrigger>
									<Button
										bg="#0088CD"
										color="white"
										onClick={handleUpdateMiningPlan}
										isLoading={isLoading}
										flex={1}
										_hover={{ bg: "#0077B6" }}
									>
										Update Plan
									</Button>
								</HStack>
							</VStack>
						</Dialog.Body>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default UpdateMiningPlanModal;
