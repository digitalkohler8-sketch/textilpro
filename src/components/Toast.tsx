'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

const ToastContext = createContext<{
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const iconMap = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
                        <span className="toast-icon">{iconMap[toast.type]}</span>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
