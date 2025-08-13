import { Alert } from "@chakra-ui/react";

const AlertNotification = ({ children, status, alertMsg }) => {
	return (
		<Alert.Root status={status}>
			<Alert.Indicator />
			<Alert.Title>{alertMsg}</Alert.Title>
			{children && children}
		</Alert.Root>
	);
};

export default AlertNotification;
