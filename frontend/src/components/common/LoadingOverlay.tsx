import React from 'react';
import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';

interface LoadingOverlayProps {
    open: boolean;
    message?: string;
}

const LoadingOverlay = ({ open, message = 'Đang xử lý...' }: LoadingOverlayProps) => {
    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
            open={open}
        >
            <CircularProgress color="inherit" />
            <Typography>{message}</Typography>
        </Backdrop>
    );
};

export default LoadingOverlay; 