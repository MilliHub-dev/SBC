import {
	Button,
	VStack,
	HStack,
	Input,
	Portal,
	Dialog,
	Field,
	NumberInput,
	NativeSelect,
} from "@chakra-ui/react";

const SendRewardsModal = ({
	children,
	selectedUser,
	rewardForm,
	setRewardForm,
	handleRewardUser,
	openSendRewardsModal,
	setOpenSendRewardsModal,
}) => {
	return (
		<Dialog.Root
			open={openSendRewardsModal}
			onOpenChange={(e) => setOpenSendRewardsModal(e.open)}
		>
			{children}

			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4} color={`#000`}>
						<Dialog.Header fontSize={`lg`}>
							Send Reward to {selectedUser?.name}
						</Dialog.Header>
						<Dialog.CloseTrigger />
						<Dialog.Body pb={6}>
							<VStack gap={4}>
								<Field.Root required>
									<Field.Label>Reward Type</Field.Label>
									<NativeSelect.Root
										value={rewardForm.type}
										onChange={(e) =>
											setRewardForm((prev) => ({
												...prev,
												type: e.target.value,
											}))
										}
									>
										<NativeSelect.Field>
											<option value="bonus">SABI Bonus</option>
											<option value="points">Points</option>
										</NativeSelect.Field>
										<NativeSelect.Indicator />
									</NativeSelect.Root>
								</Field.Root>
								<Field.Root required>
									<Field.Label>Amount</Field.Label>
									<NumberInput.Root
										w={`full`}
										value={rewardForm.amount}
										onValueChange={({ value }) =>
											setRewardForm((prev) => ({
												...prev,
												amount: parseInt(value) || 0,
											}))
										}
										min={1}
									>
										<NumberInput.Input />
									</NumberInput.Root>
								</Field.Root>
								<Field.Root required>
									<Field.Label>Reason</Field.Label>
									<Input
										value={rewardForm.reason}
										onChange={(e) =>
											setRewardForm((prev) => ({
												...prev,
												reason: e.target.value,
											}))
										}
										placeholder="Enter reason for reward"
									/>
								</Field.Root>
								<HStack w="full" gap={4} pt={4}>
									<Dialog.ActionTrigger asChild>
										<Button variant="outline" flex={1}>
											Cancel
										</Button>
									</Dialog.ActionTrigger>
									<Button
										bg="#0088CD"
										color="white"
										onClick={handleRewardUser}
										flex={1}
										_hover={{ bg: "#0077B6" }}
									>
										Send Reward
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

export default SendRewardsModal;
