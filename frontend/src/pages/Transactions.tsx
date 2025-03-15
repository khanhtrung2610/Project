import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { deviceService } from '../services/deviceService';
import { transactionService } from '../services/transactionService';
import { Device } from '../types/device';
import { Transaction, TransactionItem, TransactionType } from '../types/transaction';
import LoadingOverlay from '../components/common/LoadingOverlay';

const Transactions = () => {
    const [tabValue, setTabValue] = useState<TransactionType>('IMPORT');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItems, setSelectedItems] = useState<TransactionItem[]>([]);
    const [note, setNote] = useState('');

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [transactionsData, devicesData] = await Promise.all([
                    transactionService.getTransactions(),
                    deviceService.getDevices()
                ]);
                setTransactions(transactionsData);
                setDevices(devicesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddItem = () => {
        setSelectedItems([
            ...selectedItems,
            { deviceId: 0, deviceName: '', quantity: 0, price: 0 }
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof TransactionItem, value: any) => {
        const newItems = [...selectedItems];
        if (field === 'deviceId') {
            const device = devices.find(d => d.id === value);
            newItems[index] = {
                ...newItems[index],
                deviceId: value,
                deviceName: device?.name || ''
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
        }
        setSelectedItems(newItems);
    };

    const handleSubmit = async () => {
        if (!selectedItems.length) return;

        setLoading(true);
        try {
            const transaction = {
                type: tabValue,
                date: new Date().toISOString(),
                items: selectedItems,
                totalAmount: selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
                note,
                status: 'PENDING',
                createdBy: 'Current User' // Thay bằng user thật sau
            };

            await transactionService.createTransaction(transaction);
            setOpenDialog(false);
            setSelectedItems([]);
            setNote('');
            // Refresh transactions list
            const updatedTransactions = await transactionService.getTransactions();
            setTransactions(updatedTransactions);
        } catch (error) {
            console.error('Error creating transaction:', error);
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

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Quản lý nhập xuất kho
            </Typography>

            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                >
                    <Tab label="Nhập kho" value="IMPORT" />
                    <Tab label="Xuất kho" value="EXPORT" />
                </Tabs>
            </Paper>

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Tạo phiếu {tabValue === 'IMPORT' ? 'nhập' : 'xuất'} kho
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã phiếu</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Số mặt hàng</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ghi chú</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions
                            .filter(t => t.type === tabValue)
                            .map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>
                                        {new Date(transaction.date).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell>{transaction.items.length}</TableCell>
                                    <TableCell>
                                        {transaction.totalAmount.toLocaleString('vi-VN')} đ
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={transaction.status}
                                            color={getStatusColor(transaction.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{transaction.note}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Tạo phiếu {tabValue === 'IMPORT' ? 'nhập' : 'xuất'} kho
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {selectedItems.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    select
                                    label="Thiết bị"
                                    value={item.deviceId}
                                    onChange={(e) => handleItemChange(index, 'deviceId', Number(e.target.value))}
                                    sx={{ flexGrow: 1 }}
                                >
                                    {devices.map((device) => (
                                        <MenuItem key={device.id} value={device.id}>
                                            {device.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    type="number"
                                    label="Số lượng"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                    sx={{ width: 120 }}
                                />
                                <TextField
                                    type="number"
                                    label="Đơn giá"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                    sx={{ width: 150 }}
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveItem(index)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddItem}
                            sx={{ mt: 1 }}
                        >
                            Thêm thiết bị
                        </Button>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Ghi chú"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit}
                        disabled={!selectedItems.length}
                    >
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            <LoadingOverlay open={loading} />
        </Box>
    );
};

export default Transactions; 