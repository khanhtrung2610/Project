import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Tab,
    Tabs,
    Button,
    ButtonGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from 'recharts';
import { reportService } from '../services/reportService';
import LoadingOverlay from '../components/common/LoadingOverlay';
import vi from 'date-fns/locale/vi';
import { 
    CloudDownload as DownloadIcon,
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon 
} from '@mui/icons-material';
import { exportToExcel, formatDate, formatCurrency } from '../utils/exportUtils';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    const [revenueData, setRevenueData] = useState<DailyRevenue[]>([]);
    const [movementData, setMovementData] = useState<InventoryMovement[]>([]);
    const [stockData, setStockData] = useState<StockSummary[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [revenue, movements, stock] = await Promise.all([
                reportService.getDailyRevenue(startDate, endDate),
                reportService.getInventoryMovements(startDate, endDate),
                reportService.getStockSummary()
            ]);
            setRevenueData(revenue);
            setMovementData(movements);
            setStockData(stock);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const handleExportExcel = (type: 'revenue' | 'movement' | 'stock') => {
        switch (type) {
            case 'revenue':
                const revenueExport = revenueData.map(item => ({
                    'Ngày': formatDate(new Date(item.date)),
                    'Doanh thu': formatCurrency(item.revenue)
                }));
                exportToExcel(revenueExport, `bao-cao-doanh-thu-${formatDate(startDate)}-${formatDate(endDate)}`);
                break;

            case 'movement':
                const movementExport = movementData.map(item => ({
                    'Ngày': formatDate(new Date(item.date)),
                    'Nhập kho': item.import,
                    'Xuất kho': item.export,
                    'Chênh lệch': item.import - item.export
                }));
                exportToExcel(movementExport, `bao-cao-nhap-xuat-${formatDate(startDate)}-${formatDate(endDate)}`);
                break;

            case 'stock':
                const stockExport = stockData.map(item => ({
                    'Danh mục': item.categoryName,
                    'Số lượng': item.quantity,
                    'Giá trị': formatCurrency(item.value)
                }));
                exportToExcel(stockExport, `bao-cao-ton-kho-${formatDate(new Date())}`);
                break;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <Box>
                <Typography variant="h5" gutterBottom>
                    Báo cáo và Thống kê
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <DatePicker
                            label="Từ ngày"
                            value={startDate}
                            onChange={(newValue) => newValue && setStartDate(newValue)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DatePicker
                            label="Đến ngày"
                            value={endDate}
                            onChange={(newValue) => newValue && setEndDate(newValue)}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Biểu đồ doanh thu */}
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader 
                                title="Doanh thu theo ngày"
                                action={
                                    <ButtonGroup>
                                        <Button
                                            startIcon={<ExcelIcon />}
                                            onClick={() => handleExportExcel('revenue')}
                                        >
                                            Excel
                                        </Button>
                                    </ButtonGroup>
                                }
                            />
                            <CardContent>
                                <LineChart
                                    width={800}
                                    height={300}
                                    data={revenueData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#8884d8"
                                        name="Doanh thu"
                                    />
                                </LineChart>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Biểu đồ nhập xuất */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader 
                                title="Biến động kho"
                                action={
                                    <ButtonGroup>
                                        <Button
                                            startIcon={<ExcelIcon />}
                                            onClick={() => handleExportExcel('movement')}
                                        >
                                            Excel
                                        </Button>
                                    </ButtonGroup>
                                }
                            />
                            <CardContent>
                                <BarChart
                                    width={500}
                                    height={300}
                                    data={movementData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="import" fill="#82ca9d" name="Nhập kho" />
                                    <Bar dataKey="export" fill="#8884d8" name="Xuất kho" />
                                </BarChart>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Biểu đồ tồn kho */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader 
                                title="Tồn kho theo danh mục"
                                action={
                                    <ButtonGroup>
                                        <Button
                                            startIcon={<ExcelIcon />}
                                            onClick={() => handleExportExcel('stock')}
                                        >
                                            Excel
                                        </Button>
                                    </ButtonGroup>
                                }
                            />
                            <CardContent>
                                <PieChart width={500} height={300}>
                                    <Pie
                                        data={stockData}
                                        dataKey="value"
                                        nameKey="categoryName"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {stockData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <LoadingOverlay open={loading} />
            </Box>
        </LocalizationProvider>
    );
};

export default Reports; 