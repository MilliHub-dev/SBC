import {
	Button,
	VStack,
	HStack,
	Dialog,
	Field,
	NumberInput,
	Portal,
} from "@chakra-ui/react";

const UpdateRatesModal = ({
	children,
	newRates,
	setNewRates,
	handleUpdateRates,
	isLoading,
	openUpdateRateModal,
	setOpenUpdateRateModal,
}) => {
	return (
		<Dialog.Root
			open={openUpdateRateModal}
			onOpenChange={(e) => setOpenUpdateRateModal(e.open)}
		>
			{children}
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4} color={`#000`}>
						<Dialog.Header fontSize={`md`}>
							Update Conversion Rates
						</Dialog.Header>
						<Dialog.CloseTrigger />
						<Dialog.Body pb={6}>
							<VStack gap={4}>
								<Field.Root>
									<Field.Label>SOL to SABI Rate</Field.Label>
									<NumberInput.Root
										w={`full`}
										value={newRates.sol}
										onValueChange={({ value }) =>
											setNewRates((prev) => ({
												...prev,
												sol: parseInt(value) || 0,
											}))
										}
										min={1}
									>
										<NumberInput.Input />
										<NumberInput.Control />
									</NumberInput.Root>
								</Field.Root>
								<Field.Root>
									<Field.Label>USDT to SABI Rate</Field.Label>
									<NumberInput.Root
										w={`full`}
										value={newRates.usdt}
										onValueChange={({ value }) =>
											setNewRates((prev) => ({
												...prev,
												usdt: parseInt(value) || 0,
											}))
										}
										min={1}
									>
										<NumberInput.Input />
										<NumberInput.Control />
									</NumberInput.Root>
								</Field.Root>
								<HStack w="full" gap={4} pt={4}>
									<Dialog.CloseTrigger>
										<Button variant="outline" flex={1}>
											Cancel
										</Button>
									</Dialog.CloseTrigger>
									<Button
										bg="#0088CD"
										color="white"
										onClick={handleUpdateRates}
										isLoading={isLoading}
										flex={1}
										_hover={{ bg: "#0077B6" }}
									>
										Update Rates
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

export default UpdateRatesModal;
