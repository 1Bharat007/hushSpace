import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
      default:
        return <Info size={16} className="text-blue-400 shrink-0" />;
    }
  };

  const getStyle = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-[#0F172A]/90 text-emerald-200';
      case 'error':
        return 'border-red-500/30 bg-[#0F172A]/90 text-red-200';
      case 'warning':
        return 'border-amber-500/30 bg-[#0F172A]/90 text-amber-200';
      default:
        return 'border-blue-500/30 bg-[#0F172A]/90 text-blue-200';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Toast Render Container */}
      <div 
        role="status" 
        aria-live="polite" 
        className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-xs font-medium ${getStyle(
                toast.type
              )}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getIcon(toast.type)}
                <span className="truncate">{toast.message}</span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-dim hover:text-white transition-colors p-1 rounded-lg"
                aria-label="Dismiss toast"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
