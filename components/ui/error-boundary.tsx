'use client';

import React from "react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to your error reporting service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If a fallback prop is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <h2>Oops, something went wrong!</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
            {this.state.error && this.state.error.toString()}
            <br />
            {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Example error logging service function
const logErrorToService = (error: Error, errorInfo: React.ErrorInfo): void => {
  // Implementation for your error reporting service
  void console.error("Logged error:", error);
  void console.error("Error info:", errorInfo);
};