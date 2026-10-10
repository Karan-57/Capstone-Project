import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import AppRoutes from './routes/AppRoutes';
import CustomCursor from './components/landing/CustomCursor';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Collabo Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card p-6 border border-rose-500/30 text-center">
            <h2 className="text-xl font-bold text-rose-400 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-400 mb-4">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AlertProvider>
          <AuthProvider>
            <CustomCursor />
            <AppRoutes />
          </AuthProvider>
        </AlertProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
