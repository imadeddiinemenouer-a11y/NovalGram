import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--void)] text-[var(--txt)] flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-[var(--txt2)] text-sm mb-4">An unexpected error occurred. Try refreshing the page.</p>
          <pre className="text-[var(--red)] text-xs bg-[var(--surface2)] p-3 rounded-xl max-w-full overflow-auto">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white font-semibold"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}