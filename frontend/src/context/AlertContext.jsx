import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newAlert = { id, message, type };

    setAlerts((prev) => [...prev, newAlert]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 4500);

    return id;
  }, [removeAlert]);

  const getAlertStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-2 border-[#382322]',
          bg: 'bg-[#D1FAE5] dark:bg-[#064E3B] text-[#065F46] dark:text-[#A7F3D0] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]',
          icon: <CheckCircle2 className="w-5 h-5 text-[#059669] dark:text-[#34D399] shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-2 border-[#382322]',
          bg: 'bg-[#FFE4E6] dark:bg-[#881337] text-[#9F1239] dark:text-[#FECDD3] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
        };
      case 'warning':
        return {
          border: 'border-2 border-[#382322]',
          bg: 'bg-[#FFEBAA] dark:bg-[#78350F] text-[#261615] dark:text-[#FEF3C7] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]',
          icon: <AlertTriangle className="w-5 h-5 text-[#8A5200] dark:text-[#FFEBAA] shrink-0" />,
        };
      case 'info':
      default:
        return {
          border: 'border-2 border-[#382322]',
          bg: 'bg-[#FFFDF9] dark:bg-[#201413] text-[#261615] dark:text-[#FDEBDE] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]',
          icon: <Info className="w-5 h-5 text-[#261615] dark:text-[#FFEBAA] shrink-0" />,
        };
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}

      {/* Floating Custom Alerts Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {alerts.map((alert) => {
          const styles = getAlertStyles(alert.type);
          return (
            <div
              key={alert.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 transition-all duration-300 animate-slide-in ${styles.bg} ${styles.border}`}
            >
              {styles.icon}
              <div className="flex-1 text-xs font-bold font-sans leading-relaxed">
                {alert.message}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-current opacity-70 hover:opacity-100 p-0.5 transition-opacity cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      showAlert: (msg) => console.log('[Alert]', msg),
      removeAlert: () => {},
    };
  }
  return context;
};

export default AlertContext;
