import {
	Button,
	VStack,
	HStack,
	Input,
	Dialog,
	Field,
	Portal,
} from "@chakra-ui/react";

const AddMinterModal = ({
	children,
	newMinter,
	setNewMinter,
	handleAddMinter,
	isLoading,
	openMinterModal,
	setOpenMinterModal,
}) => {
	return (
		<Dialog.Root
			open={openMinterModal}
			onOpenChange={(e) => setOpenMinterModal(e.open)}
		>
			{children}
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4}>
						<Dialog.Header color={`#000`} fontSize={`md`}>
							Add Authorized Minter
						</Dialog.Header>
						<Dialog.CloseTrigger />
						<Dialog.Body pb={6}>
							<VStack gap={4}>
								<Field.Root>
									<Field.Label>Wallet Address</Field.Label>
									<Input
										value={newMinter}
										onChange={(e) => setNewMinter(e.target.value)}
										color={`#000`}
										placeholder="0x..."
									/>
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
										onClick={handleAddMinter}
										isLoading={isLoading}
										flex={1}
										_hover={{ bg: "#0077B6" }}
									>
										Add Minter
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

export default AddMinterModal;
