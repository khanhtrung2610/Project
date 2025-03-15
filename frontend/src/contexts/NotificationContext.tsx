import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface NotificationContextType {
    showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType>({
    showNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

    const showNotification = (
        message: string,
        type: 'success' | 'error' | 'info' | 'warning'
    ) => {
        setMessage(message);
        setType(type);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleClose} severity={type} elevation={6} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}; 