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
          border: 'border-emerald-500/40',
          bg: 'bg-[#0B1713]/95 text-emerald-200 shadow-emerald-950/50',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-rose-500/40',
          bg: 'bg-[#180C11]/95 text-rose-200 shadow-rose-950/50',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        };
      case 'warning':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-[#18140B]/95 text-amber-200 shadow-amber-950/50',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        };
      case 'info':
      default:
        return {
          border: 'border-purple-500/40',
          bg: 'bg-[#120F1F]/95 text-purple-200 shadow-purple-950/50',
          icon: <Info className="w-5 h-5 text-purple-400 shrink-0" />,
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
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-in ${styles.bg} ${styles.border}`}
            >
              {styles.icon}
              <div className="flex-1 text-xs font-medium leading-relaxed">
                {alert.message}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors"
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
