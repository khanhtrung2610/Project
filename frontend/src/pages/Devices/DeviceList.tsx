import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    IconButton,
    Typography,
    Dialog,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { deviceApi } from '../../services/api';
import DeviceForm from './DeviceForm';
import AdvancedSearch from '../../components/Search/AdvancedSearch';
import useDebounce from '../../hooks/useDebounce';
import useQueryCache from '../../hooks/useQueryCache';
import ExportDataDialog from '../../components/Export/ExportDataDialog';
import { useNotification } from '../../contexts/NotificationContext';

interface Device {
    id: number;
    name: string;
    code: string;
    category: string;
    quantity: number;
    price: number;
    status: 'active' | 'inactive';
}

const DeviceList = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { getCachedData, setCachedData } = useQueryCache();
    const { showNotification } = useNotification();

    const searchFields = [
        { value: 'name', label: 'Tên thiết bị' },
        { value: 'code', label: 'Mã thiết bị' },
        { value: 'category', label: 'Danh mục' },
        { value: 'quantity', label: 'Số lượng' },
        { value: 'price', label: 'Giá' },
    ];

    const availableFields = useMemo(() => [
        { value: 'code', label: 'Mã thiết bị' },
        { value: 'name', label: 'Tên thiết bị' },
        { value: 'category', label: 'Danh mục' },
        { value: 'quantity', label: 'Số lượng' },
        { value: 'price', label: 'Giá' },
        { value: 'status', label: 'Trạng thái' },
    ], []);

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = useCallback(async (filters: any) => {
        const cacheKey = JSON.stringify(filters);
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
            setDevices(cachedData);
            return;
        }

        try {
            const response = await deviceApi.search(filters);
            setDevices(response.data);
            setCachedData(cacheKey, response.data);
        } catch (error) {
            showNotification('Lỗi khi tải dữ liệu thiết bị', 'error');
        }
    }, [getCachedData, setCachedData, showNotification]);

    const handleAdd = () => {
        setSelectedDevice(null);
        setOpenForm(true);
    };

    const handleEdit = (device: Device) => {
        setSelectedDevice(device);
        setOpenForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
            try {
                await deviceApi.delete(id.toString());
                loadDevices();
            } catch (error) {
                console.error('Lỗi khi xóa thiết bị:', error);
            }
        }
    };

    const handleFormSubmit = async (data: Partial<Device>) => {
        try {
            if (selectedDevice) {
                await deviceApi.update(selectedDevice.id.toString(), data);
            } else {
                await deviceApi.create(data);
            }
            setOpenForm(false);
            loadDevices();
        } catch (error) {
            console.error('Lỗi khi lưu thiết bị:', error);
        }
    };

    const handleSearch = async (filters: any[]) => {
        try {
            const response = await deviceApi.search(filters);
            setDevices(response.data);
        } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
        }
    };

    const handleExport = async (format: string, fields: string[]) => {
        try {
            await deviceApi.export({ format, fields, filters: currentFilters });
            showNotification('Xuất dữ liệu thành công', 'success');
        } catch (error) {
            showNotification('Lỗi khi xuất dữ liệu', 'error');
        }
    };

    // Sử dụng useMemo cho dữ liệu được lọc
    const filteredDevices = useMemo(() => {
        if (!debouncedSearchTerm) return devices;
        
        return devices.filter(device => 
            device.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            device.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [devices, debouncedSearchTerm]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Quản lý Thiết bị</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={() => setOpenExportDialog(true)}
                        sx={{ mr: 1 }}
                    >
                        Xuất dữ liệu
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                    >
                        Thêm thiết bị
                    </Button>
                </Box>
            </Box>

            <AdvancedSearch
                fields={searchFields}
                onSearch={handleSearch}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã</TableCell>
                            <TableCell>Tên thiết bị</TableCell>
                            <TableCell>Danh mục</TableCell>
                            <TableCell align="right">Số lượng</TableCell>
                            <TableCell align="right">Giá (VNĐ)</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="center">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDevices.map((device) => (
                            <TableRow key={device.id}>
                                <TableCell>{device.code}</TableCell>
                                <TableCell>{device.name}</TableCell>
                                <TableCell>{device.category}</TableCell>
                                <TableCell align="right">{device.quantity}</TableCell>
                                <TableCell align="right">
                                    {device.price.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            backgroundColor: device.status === 'active' ? 'success.light' : 'error.light',
                                            color: 'white',
                                            py: 0.5,
                                            px: 1,
                                            borderRadius: 1,
                                            display: 'inline-block',
                                        }}
                                    >
                                        {device.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleEdit(device)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(device.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DeviceForm
                    device={selectedDevice}
                    onSubmit={handleFormSubmit}
                    onClose={() => setOpenForm(false)}
                />
            </Dialog>

            <ExportDataDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                onExport={handleExport}
                availableFields={availableFields}
            />
        </Box>
    );
};

export default DeviceList; 