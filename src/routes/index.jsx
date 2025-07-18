import App from "../App";
import { dashboardRoutes } from "./dashboardRoutes";
import { createBrowserRouter } from "react-router";
import RootLayout from "../layout/RootLayout";

export const router = createBrowserRouter([
  {
    Path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
    ],
  },
  ...dashboardRoutes,
]);
