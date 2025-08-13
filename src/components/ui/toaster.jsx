"use client";

import {
	Toaster as ChakraToaster,
	Portal,
	Spinner,
	Stack,
	Toast,
	createToaster,
} from "@chakra-ui/react";

export const toaster = createToaster({
	placement: "bottom-end",
	pauseOnPageIdle: true,
});

export const Toaster = () => {
	return (
		<Portal>
			<ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
				{(toast) => (
					<Toast.Root width={{ md: "sm" }}>
						{toast.type === "loading" ? (
							<Spinner size="sm" color="blue.solid" />
						) : (
							<Toast.Indicator />
						)}
						<Stack gap="1" flex="1" maxWidth="100%">
							{toast.title && <Toast.Title>{toast.title}</Toast.Title>}
							{toast.description && (
								<Toast.Description>
									{toast.description}
								</Toast.Description>
							)}
						</Stack>
						{toast.action && (
							<Toast.ActionTrigger>
								{toast.action.label}
							</Toast.ActionTrigger>
						)}
						{toast.closable && <Toast.CloseTrigger />}
					</Toast.Root>
				)}
			</ChakraToaster>
		</Portal>
	);
};

// "use client";

// import {
// 	Toast,
// 	ToastClose,
// 	ToastDescription,
// 	ToastProvider,
// 	ToastTitle,
// 	ToastViewport,
// } from "./toast";
// import { useToast } from "./use-toast";

// export function Toaster() {
// 	const { toasts } = useToast();

// 	return (
// 		<ToastProvider>
// 			{toasts.map(function ({ id, title, description, action, ...props }) {
// 				return (
// 					<Toast key={id} {...props}>
// 						<div className="grid gap-1">
// 							{title && <ToastTitle>{title}</ToastTitle>}
// 							{description && (
// 								<ToastDescription>{description}</ToastDescription>
// 							)}
// 						</div>
// 						{action}
// 						<ToastClose />
// 					</Toast>
// 				);
// 			})}
// 			<ToastViewport />
// 		</ToastProvider>
// 	);
// }

// // Export the toaster for backward compatibility
// export { toaster } from "./use-toast";
