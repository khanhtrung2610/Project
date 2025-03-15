import React, { useState } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useCachedApi } from '../utils/hooks';
import { supplierService, transactionHistoryService } from '../services/supplierService';
import { Supplier, TransactionHistory } from '../types/supplier';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Suppliers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: 0 });
    const [supplierHistory, setSupplierHistory] = useState<TransactionHistory[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: suppliers, refetch } = useCachedApi<Supplier[]>(
        'suppliers',
        supplierService.getSuppliers,
        []
    );

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        contactPerson: '',
        status: 'ACTIVE'
    });

    const handleOpenDialog = (supplier?: Supplier) => {
        if (supplier) {
            setSelectedSupplier(supplier);
            setFormData({
                name: supplier.name,
                code: supplier.code,
                address: supplier.address,
                phone: supplier.phone,
                email: supplier.email,
                contactPerson: supplier.contactPerson,
                status: supplier.status
            });
        } else {
            setSelectedSupplier(null);
            setFormData({
                name: '',
                code: '',
                address: '',
                phone: '',
                email: '',
                contactPerson: '',
                status: 'ACTIVE'
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (selectedSupplier) {
                await supplierService.updateSupplier(selectedSupplier.id, formData);
            } else {
                await supplierService.createSupplier(formData);
            }
            setOpenDialog(false);
            refetch();
        } catch (error) {
            console.error('Error saving supplier:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        try {
            await supplierService.deleteSupplier(id);
            refetch();
        } catch (error) {
            console.error('Error deleting supplier:', error);
        } finally {
            setLoading(false);
            setConfirmDialog({ open: false, id: 0 });
        }
    };

    const handleViewHistory = async (supplierId: number) => {
        setLoading(true);
        try {
            const history = await transactionHistoryService.getSupplierTransactions(supplierId);
            setSupplierHistory(history);
            setOpenHistoryDialog(true);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Quản lý nhà cung cấp</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm nhà cung cấp
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã NCC</TableCell>
                            <TableCell>Tên nhà cung cấp</TableCell>
                            <TableCell>Liên hệ</TableCell>
                            <TableCell>Địa chỉ</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {suppliers
                            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>{supplier.code}</TableCell>
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell>
                                        <div>{supplier.contactPerson}</div>
                                        <div>{supplier.phone}</div>
                                        <div>{supplier.email}</div>
                                    </TableCell>
                                    <TableCell>{supplier.address}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={supplier.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                            color={supplier.status === 'ACTIVE' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleViewHistory(supplier.id)}>
                                            <HistoryIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDialog(supplier)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => setConfirmDialog({ open: true, id: supplier.id })}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={suppliers?.length || 0}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Số hàng mỗi trang:"
                />
            </TableContainer>

            {/* Dialog thêm/sửa nhà cung cấp */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Mã nhà cung cấp"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Tên nhà cung cấp"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Địa chỉ"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Số điện thoại"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Người liên hệ"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Trạng thái"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                        >
                            <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                            <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedSupplier ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xem lịch sử giao dịch */}
            <Dialog 
                open={openHistoryDialog} 
                onClose={() => setOpenHistoryDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Lịch sử giao dịch</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ngày</TableCell>
                                    <TableCell>Loại</TableCell>
                                    <TableCell>Số lượng mặt hàng</TableCell>
                                    <TableCell>Tổng tiền</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Ghi chú</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {supplierHistory.map((history) => (
                                    <TableRow key={history.id}>
                                        <TableCell>
                                            {new Date(history.date).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            {history.type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                                        </TableCell>
                                        <TableCell>{history.items.length}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(history.totalAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={history.status}
                                                color={
                                                    history.status === 'COMPLETED' ? 'success' :
                                                    history.status === 'PENDING' ? 'warning' : 'error'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{history.note}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistoryDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDialog.open}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
                onConfirm={() => handleDelete(confirmDialog.id)}
                onCancel={() => setConfirmDialog({ open: false, id: 0 })}
            />

            <LoadingOverlay open={loading} />
        </Box>
    );
};

export default Suppliers; 