import React from 'react';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';
import PokeballHatLogo from './PokeballHatLogo';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Pokédeckz caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            padding: '32px 20px',
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <PokeballHatLogo size={56} />
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              marginBottom: '10px',
              color: '#FFCB05',
              letterSpacing: '-0.5px',
            }}
          >
            A Wild Glitch Appeared!
          </h2>
          <p
            style={{
              maxWidth: '480px',
              color: '#8A8A8A',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Don't worry, Trainer! Something unexpected occurred while rendering this page, but your collection and data are safe.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#E53935',
                color: '#FFFFFF',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(229, 57, 53, 0.4)',
              }}
            >
              <RotateCcw size={16} /> Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                borderRadius: '100px',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              <Home size={16} /> Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
