import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  }, [addToast]);

  // Reassign as function with methods
  const toastFn = useCallback((msg, type, dur) => addToast(msg, type, dur), [addToast]);
  toastFn.success = (msg, dur) => addToast(msg, 'success', dur);
  toastFn.error = (msg, dur) => addToast(msg, 'error', dur);
  toastFn.warning = (msg, dur) => addToast(msg, 'warning', dur);
  toastFn.info = (msg, dur) => addToast(msg, 'info', dur);

  return (
    <ToastContext.Provider value={toastFn}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const ICON_MAP = {
  success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const ACCENT_MAP = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
};

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '420px' }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto bg-white border border-gray-200 border-l-4 ${ACCENT_MAP[t.type]} shadow-lg px-5 py-4 flex items-start gap-3 animate-toast-in`}
          role="alert"
        >
          {ICON_MAP[t.type]}
          <p className="text-sm font-medium text-gray-800 leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
