import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 24, color: '#e74c3c' }}>
          <strong>Something went wrong.</strong>
          <pre style={{ fontSize: 12, marginTop: 8 }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
