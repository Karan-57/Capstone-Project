import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { WalletProvider } from './context/WalletContext';
import { ThemeProvider } from './context/ThemeContext';
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
        <div className="min-h-screen bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#FFFDF9] dark:bg-[#201413] p-8 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] text-center">
            <h2 className="text-xl font-bold font-serif text-rose-600 dark:text-rose-400 mb-2">Something went wrong</h2>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mb-6">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-5 py-2.5 bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FDEBDE] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
      <ThemeProvider>
        <BrowserRouter>
          <AlertProvider>
            <AuthProvider>
              <WalletProvider>
                <CustomCursor />
                <AppRoutes />
              </WalletProvider>
            </AuthProvider>
          </AlertProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
