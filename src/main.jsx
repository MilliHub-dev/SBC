import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";
import DashboardHome from "./dashboard";
import { BrowserRouter, RouterProvider } from "react-router";
import { router } from "./routes";
import Web3Provider from "./providers/Web3Provider";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'white', color: 'red' }}>
          <h1>Something went wrong:</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Web3Provider>
        <Provider>
          <RouterProvider router={router} />
          <Toaster />
        </Provider>
      </Web3Provider>
    </ErrorBoundary>
  </StrictMode>
);
