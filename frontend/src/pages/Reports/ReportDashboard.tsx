import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import ExportReportDialog from '../../components/Reports/ExportReportDialog';

const ReportDashboard = () => {
    const [summaryData, setSummaryData] = useState({
        totalDevices: 0,
        totalValue: 0,
        totalTransactions: 0,
        lowStockItems: 0,
    });

    const [monthlyData, setMonthlyData] = useState([]);
    const [topDevices, setTopDevices] = useState([]);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [exportType, setExportType] = useState<'devices' | 'transactions'>('devices');

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            // TODO: Thêm API calls thực tế
            // const summary = await reportApi.getSummary();
            // const monthly = await reportApi.getMonthlyStats();
            // const top = await reportApi.getTopDevices();
            
            // Dữ liệu mẫu
            setSummaryData({
                totalDevices: 1234,
                totalValue: 1500000000,
                totalTransactions: 456,
                lowStockItems: 5,
            });

            setMonthlyData([
                { month: 'T1', import: 100, export: 80 },
                { month: 'T2', import: 120, export: 90 },
                { month: 'T3', import: 140, export: 100 },
                // ... thêm dữ liệu các tháng khác
            ]);

            setTopDevices([
                { name: 'Thiết bị A', quantity: 50, value: 5000000 },
                { name: 'Thiết bị B', quantity: 45, value: 4500000 },
                // ... thêm dữ liệu thiết bị khác
            ]);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu báo cáo:', error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Báo cáo & Thống kê</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => {
                            setExportType('devices');
                            setOpenExportDialog(true);
                        }}
                        sx={{ mr: 1 }}
                    >
                        Xuất BC Thiết bị
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => {
                            setExportType('transactions');
                            setOpenExportDialog(true);
                        }}
                    >
                        Xuất BC Giao dịch
                    </Button>
                </Box>
            </Box>

            {/* Thống kê tổng quan */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Tổng số thiết bị
                            </Typography>
                            <Typography variant="h4">
                                {summaryData.totalDevices.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Tổng giá trị tồn kho
                            </Typography>
                            <Typography variant="h4">
                                {(summaryData.totalValue / 1000000).toFixed(1)}M
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Giao dịch trong tháng
                            </Typography>
                            <Typography variant="h4">
                                {summaryData.totalTransactions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Cần nhập thêm
                            </Typography>
                            <Typography variant="h4" color="error">
                                {summaryData.lowStockItems}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Biểu đồ thống kê */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Thống kê nhập/xuất theo tháng
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="import" name="Nhập kho" fill="#2196f3" />
                                <Bar dataKey="export" name="Xuất kho" fill="#f50057" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Top thiết bị tồn kho
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Thiết bị</TableCell>
                                        <TableCell align="right">SL</TableCell>
                                        <TableCell align="right">Giá trị</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topDevices.map((device) => (
                                        <TableRow key={device.name}>
                                            <TableCell>{device.name}</TableCell>
                                            <TableCell align="right">
                                                {device.quantity}
                                            </TableCell>
                                            <TableCell align="right">
                                                {(device.value / 1000000).toFixed(1)}M
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <ExportReportDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                type={exportType}
            />
        </Box>
    );
};

export default ReportDashboard; 