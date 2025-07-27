import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // Bisa log error ke server di sini
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 40, color: 'red', fontWeight: 'bold' }}>Terjadi error: {this.state.error?.message || 'Unknown error'}</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <LoadingProvider>
      <LoadingOverlay />
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col">
            <AppRoutes />
          </div>
        </div>
      </ErrorBoundary>
    </LoadingProvider>
  );
}

export default App;