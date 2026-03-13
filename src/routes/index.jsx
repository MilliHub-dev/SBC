import App from "../App";
import { dashboardRoutes } from "./dashboardRoutes";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import Resources from "../pages/Resources";
import ErrorPage from "../components/ErrorPage";
import Legal from "../pages/Legal";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <App />,
			},
			{
				path: "resources",
				element: <Resources />,
			},
			{
				path: "legal",
				element: <Legal />,
			},
			{
				path: "*",
				element: <ErrorPage />,
			},
		],
	},
	...dashboardRoutes,
]);
