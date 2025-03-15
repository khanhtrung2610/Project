import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Typography,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import { paymentService } from '../services/paymentService';
import { Payment } from '../types/payment';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { formatCurrency } from '../utils/exportUtils';
import ImportExcel from '../components/common/ImportExcel';
import { useCachedApi } from '../utils/hooks';

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
    { value: 'CARD', label: 'Thẻ' }
];

const Payments = () => {
    const {
        data: payments,
        loading,
        error,
        refetch: refetchPayments
    } = useCachedApi(
        'payments',
        paymentService.getPayments,
        []
    );
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        transactionId: '',
        amount: '',
        method: 'CASH',
        note: ''
    });
    const [importDialog, setImportDialog] = useState(false);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSubmit = async () => {
        if (!formData.transactionId || !formData.amount) return;

        setLoading(true);
        try {
            await paymentService.createPayment({
                transactionId: parseInt(formData.transactionId),
                amount: parseFloat(formData.amount),
                method: formData.method,
                note: formData.note
            });
            setOpenDialog(false);
            refetchPayments();
        } catch (error) {
            console.error('Error creating payment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        setLoading(true);
        try {
            await paymentService.updatePaymentStatus(id, status);
            refetchPayments();
        } catch (error) {
            console.error('Error updating payment status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    const getMethodLabel = (method: string) => {
        return PAYMENT_METHODS.find(m => m.value === method)?.label || method;
    };

    const handleImport = async (data: any[]) => {
        setLoading(true);
        try {
            // Chuẩn hóa dữ liệu
            const formattedData = data.map(item => ({
                transactionId: parseInt(item['Mã giao dịch']),
                amount: parseFloat(item['Số tiền']),
                method: item['Phương thức thanh toán'],
                note: item['Ghi chú']
            }));

            // Giả lập API call - sau này sẽ thay bằng API thật
            await Promise.all(formattedData.map(payment => paymentService.createPayment(payment)));
            
            setSnackbar({
                open: true,
                message: 'Import dữ liệu thành công',
                severity: 'success'
            });
            refetchPayments();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Import dữ liệu thất bại',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Quản lý thanh toán</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => setImportDialog(true)}
                        sx={{ mr: 1 }}
                    >
                        Import
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Thêm thanh toán
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Tổng thanh toán
                        </Typography>
                        <Typography variant="h4">
                            {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Đã hoàn thành
                        </Typography>
                        <Typography variant="h4">
                            {payments.filter(p => p.status === 'COMPLETED').length}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Đang chờ
                        </Typography>
                        <Typography variant="h4">
                            {payments.filter(p => p.status === 'PENDING').length}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã GD</TableCell>
                            <TableCell>Số tiền</TableCell>
                            <TableCell>Phương thức</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ngày thanh toán</TableCell>
                            <TableCell>Ghi chú</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.transactionId}</TableCell>
                                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>{getMethodLabel(payment.method)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={payment.status}
                                            color={getStatusColor(payment.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell>{payment.note}</TableCell>
                                    <TableCell align="right">
                                        {payment.status === 'PENDING' && (
                                            <>
                                                <IconButton
                                                    color="success"
                                                    onClick={() => handleUpdateStatus(payment.id, 'COMPLETED')}
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleUpdateStatus(payment.id, 'CANCELLED')}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={payments.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                />
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Thêm thanh toán mới</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Mã giao dịch"
                        type="number"
                        margin="normal"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Số tiền"
                        type="number"
                        margin="normal"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Phương thức thanh toán"
                        margin="normal"
                        value={formData.method}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    >
                        {PAYMENT_METHODS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Ghi chú"
                        multiline
                        rows={3}
                        margin="normal"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Thêm
                    </Button>
                </DialogActions>
            </Dialog>

            <ImportExcel
                open={importDialog}
                onClose={() => setImportDialog(false)}
                onImport={handleImport}
                templateFields={[
                    'Mã giao dịch',
                    'Số tiền',
                    'Phương thức thanh toán',
                    'Ghi chú'
                ]}
                title="Import danh sách thanh toán"
            />

            <LoadingOverlay open={loading} />
        </Box>
    );
};

export default Payments; 