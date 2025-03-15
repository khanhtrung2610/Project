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
    IconButton,
    Typography,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { deviceService } from '../services/deviceService';
import { Device } from '../types/device';
import { validateDevice } from '../utils/validation';

const Devices = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        deviceId: null as number | null
    });

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        serialNumber: '',
        status: '',
        quantity: 0
    });

    const [errors, setErrors] = useState({});

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await deviceService.getDevices();
            setDevices(data);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách thiết bị',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDialog = (device?: Device) => {
        if (device) {
            setSelectedDevice(device);
            setFormData({
                name: device.name,
                category: device.category,
                serialNumber: device.serialNumber,
                status: device.status,
                quantity: device.quantity
            });
        } else {
            setSelectedDevice(null);
            setFormData({
                name: '',
                category: '',
                serialNumber: '',
                status: '',
                quantity: 0
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDevice(null);
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({
            open: true,
            deviceId: id
        });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.deviceId) return;

        setLoading(true);
        try {
            await deviceService.deleteDevice(confirmDialog.deviceId);
            setSnackbar({
                open: true,
                message: 'Xóa thiết bị thành công',
                severity: 'success'
            });
            fetchDevices(); // Tải lại danh sách
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Xóa thiết bị thất bại',
                severity: 'error'
            });
        } finally {
            setLoading(false);
            setConfirmDialog({ open: false, deviceId: null });
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (selectedDevice) {
                // Cập nhật thiết bị
                await deviceService.updateDevice(selectedDevice.id, formData);
                setSnackbar({
                    open: true,
                    message: 'Cập nhật thiết bị thành công',
                    severity: 'success'
                });
            } else {
                // Thêm thiết bị mới
                await deviceService.createDevice(formData);
                setSnackbar({
                    open: true,
                    message: 'Thêm thiết bị thành công',
                    severity: 'success'
                });
            }
            handleCloseDialog();
            fetchDevices(); // Tải lại danh sách
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Thao tác thất bại',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const { isValid, errors: validationErrors } = validateDevice(formData);
        setErrors(validationErrors);
        return isValid;
    };

    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Quản lý thiết bị</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm thiết bị
                </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Tìm kiếm theo tên hoặc số serial..."
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên thiết bị</TableCell>
                            <TableCell>Danh mục</TableCell>
                            <TableCell>Số serial</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Số lượng</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDevices
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((device) => (
                                <TableRow key={device.id}>
                                    <TableCell>{device.name}</TableCell>
                                    <TableCell>{device.category}</TableCell>
                                    <TableCell>{device.serialNumber}</TableCell>
                                    <TableCell>{device.status}</TableCell>
                                    <TableCell>{device.quantity}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenDialog(device)}>
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
                <TablePagination
                    component="div"
                    count={filteredDevices.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                />
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedDevice ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Tên thiết bị"
                        margin="normal"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Danh mục"
                        margin="normal"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Số serial"
                        margin="normal"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Trạng thái"
                        margin="normal"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Số lượng"
                        type="number"
                        margin="normal"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedDevice ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity as 'success' | 'error'}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <LoadingOverlay open={loading} />
            
            <ConfirmDialog
                open={confirmDialog.open}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa thiết bị này?"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ open: false, deviceId: null })}
            />
        </Box>
    );
};

export default Devices; 