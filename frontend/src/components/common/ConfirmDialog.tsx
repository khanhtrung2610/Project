import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    open,
    title,
    message,
    onConfirm,
    onCancel
}: ConfirmDialogProps) => {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">
                    Hủy
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog; 