import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    MenuItem,
    Grid,
    IconButton,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import viLocale from 'date-fns/locale/vi';

interface Transaction {
    id: number;
    type: 'import' | 'export';
    deviceName: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'completed' | 'cancelled';
    date: string;
}

const TransactionList = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        startDate: null,
        endDate: null,
        search: '',
    });

    useEffect(() => {
        loadTransactions();
    }, [filters]);

    const loadTransactions = async () => {
        try {
            // TODO: Thêm API call thực tế ở đây
            // const response = await transactionApi.getAll(filters);
            // setTransactions(response.data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách giao dịch:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'pending':
                return 'Đang xử lý';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý Giao dịch</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {/* TODO: Mở form tạo giao dịch */}}
                >
                    Tạo giao dịch
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm"
                            size="small"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            InputProps={{
                                endAdornment: <SearchIcon />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth
                            select
                            label="Loại giao dịch"
                            size="small"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="import">Nhập kho</MenuItem>
                            <MenuItem value="export">Xuất kho</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth
                            select
                            label="Trạng thái"
                            size="small"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="pending">Đang xử lý</MenuItem>
                            <MenuItem value="completed">Hoàn thành</MenuItem>
                            <MenuItem value="cancelled">Đã hủy</MenuItem>
                        </TextField>
                    </Grid>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                        <Grid item xs={12} sm={2}>
                            <DatePicker
                                label="Từ ngày"
                                value={filters.startDate}
                                onChange={(date) => setFilters({ ...filters, startDate: date })}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <DatePicker
                                label="Đến ngày"
                                value={filters.endDate}
                                onChange={(date) => setFilters({ ...filters, endDate: date })}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                    </LocalizationProvider>
                </Grid>
            </Paper>

            {/* Transactions Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã GD</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Thiết bị</TableCell>
                            <TableCell align="right">Số lượng</TableCell>
                            <TableCell align="right">Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ngày</TableCell>
                            <TableCell align="center">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>#{transaction.id}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={transaction.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                                        color={transaction.type === 'import' ? 'primary' : 'secondary'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{transaction.deviceName}</TableCell>
                                <TableCell align="right">{transaction.quantity}</TableCell>
                                <TableCell align="right">
                                    {transaction.totalPrice.toLocaleString()} VNĐ
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusText(transaction.status)}
                                        color={getStatusColor(transaction.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(transaction.date).toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => {/* TODO: Xem chi tiết */}}>
                                        <ViewIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TransactionList; 