import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";
import DashboardHome from "./dashboard";
import { BrowserRouter, RouterProvider } from "react-router";
import { router } from "./routes";
import Web3Provider from "./providers/Web3Provider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Web3Provider>
      <Provider>
        <RouterProvider router={router} />
        <Toaster />
      </Provider>
    </Web3Provider>
  </StrictMode>
);
