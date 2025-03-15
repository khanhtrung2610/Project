import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface TransactionFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    transaction?: any;
}

const validationSchema = Yup.object({
    type: Yup.string().required('Loại giao dịch là bắt buộc'),
    deviceId: Yup.number().required('Thiết bị là bắt buộc'),
    quantity: Yup.number()
        .min(1, 'Số lượng phải lớn hơn 0')
        .required('Số lượng là bắt buộc'),
    price: Yup.number()
        .min(0, 'Giá không được âm')
        .required('Giá là bắt buộc'),
});

const TransactionForm: React.FC<TransactionFormProps> = ({
    open,
    onClose,
    onSubmit,
    transaction
}) => {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        // TODO: Load danh sách thiết bị
        // const loadDevices = async () => {
        //     const response = await deviceApi.getAll();
        //     setDevices(response.data);
        // };
        // loadDevices();
    }, []);

    const formik = useFormik({
        initialValues: {
            type: transaction?.type || 'import',
            deviceId: transaction?.deviceId || '',
            quantity: transaction?.quantity || 1,
            price: transaction?.price || 0,
            note: transaction?.note || '',
            date: transaction?.date || new Date(),
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {transaction ? 'Chỉnh sửa giao dịch' : 'Tạo giao dịch mới'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                name="type"
                                label="Loại giao dịch"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                error={formik.touched.type && Boolean(formik.errors.type)}
                                helperText={formik.touched.type && formik.errors.type}
                            >
                                <MenuItem value="import">Nhập kho</MenuItem>
                                <MenuItem value="export">Xuất kho</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                name="deviceId"
                                label="Thiết bị"
                                value={formik.values.deviceId}
                                onChange={formik.handleChange}
                                error={formik.touched.deviceId && Boolean(formik.errors.deviceId)}
                                helperText={formik.touched.deviceId && formik.errors.deviceId}
                            >
                                {devices.map((device: any) => (
                                    <MenuItem key={device.id} value={device.id}>
                                        {device.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                name="quantity"
                                label="Số lượng"
                                value={formik.values.quantity}
                                onChange={formik.handleChange}
                                error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                helperText={formik.touched.quantity && formik.errors.quantity}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                name="price"
                                label="Đơn giá"
                                value={formik.values.price}
                                onChange={formik.handleChange}
                                error={formik.touched.price && Boolean(formik.errors.price)}
                                helperText={formik.touched.price && formik.errors.price}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="note"
                                label="Ghi chú"
                                value={formik.values.note}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained">
                        {transaction ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TransactionForm; 