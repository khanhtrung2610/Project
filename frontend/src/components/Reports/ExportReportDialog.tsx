import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { reportService } from '../../services/reportService';
import { useNotification } from '../../contexts/NotificationContext';

interface ExportReportDialogProps {
    open: boolean;
    onClose: () => void;
    type: 'devices' | 'transactions';
}

const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
    open,
    onClose,
    type
}) => {
    const { showNotification } = useNotification();
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        format: 'xlsx',
        category: '',
    });

    const handleExport = async () => {
        try {
            if (type === 'devices') {
                await reportService.exportDeviceReport(filters);
            } else {
                await reportService.exportTransactionReport(filters);
            }
            showNotification('Xuất báo cáo thành công!', 'success');
            onClose();
        } catch (error) {
            showNotification('Lỗi khi xuất báo cáo!', 'error');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Xuất báo cáo {type === 'devices' ? 'thiết bị' : 'giao dịch'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                        <DatePicker
                            label="Từ ngày"
                            value={filters.startDate}
                            onChange={(date) => setFilters({ ...filters, startDate: date })}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DatePicker
                            label="Đến ngày"
                            value={filters.endDate}
                            onChange={(date) => setFilters({ ...filters, endDate: date })}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Định dạng</InputLabel>
                            <Select
                                value={filters.format}
                                label="Định dạng"
                                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                            >
                                <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                                <MenuItem value="pdf">PDF</MenuItem>
                                <MenuItem value="csv">CSV</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {type === 'devices' && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Danh mục"
                                select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="network">Thiết bị mạng</MenuItem>
                                <MenuItem value="computer">Máy tính</MenuItem>
                                <MenuItem value="mobile">Di động</MenuItem>
                            </TextField>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button variant="contained" onClick={handleExport}>
                    Xuất báo cáo
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportReportDialog; 