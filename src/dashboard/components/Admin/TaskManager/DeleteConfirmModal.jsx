import {
	Box,
	Button,
	Card,
	VStack,
	HStack,
	Text,
	Input,
	Textarea,
	Select,
	Field,
	Dialog,
	Portal,
	Table,
	Badge,
	Icon,
	Switch,
	NumberInput,
	Heading,
	SimpleGrid,
	Stat,
	NativeSelect,
} from "@chakra-ui/react";

const DeleteConfirmModal = ({
	children,
	selectedTask,
	handleDeleteTask,
	openConfirmDeleteModal,
	setOpenConfirmDeleteModal,
	cancelRef,
}) => {
	return (
		<Dialog.Root
			open={openConfirmDeleteModal}
			onOpenChange={(e) => setOpenConfirmDeleteModal(e.open)}
			role="alertdialog"
			initialFocusEl={() => cancelRef.current}
		>
			{children}
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={4} color={`#000`}>
						<Dialog.Header fontSize="lg" fontWeight="bold">
							Delete Task
						</Dialog.Header>

						<Dialog.Body>
							Are you sure you want to delete "{selectedTask?.title}"?
							This action cannot be undone.
						</Dialog.Body>

						<Dialog.Footer>
							<Button
								ref={cancelRef}
								onClick={() => setOpenConfirmDeleteModal(false)}
							>
								Cancel
							</Button>
							<Button
								colorPalette="red"
								onClick={handleDeleteTask}
								ml={3}
							>
								Delete
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default DeleteConfirmModal;
