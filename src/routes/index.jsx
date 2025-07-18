import App from "../App";
import { dashboardRoutes } from "./dashboardRoutes";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
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
