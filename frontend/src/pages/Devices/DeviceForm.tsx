import React from 'react';
import {
    Box,
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface DeviceFormProps {
    device?: any;
    onSubmit: (values: any) => void;
    onClose: () => void;
}

const validationSchema = Yup.object({
    name: Yup.string().required('Tên thiết bị là bắt buộc'),
    code: Yup.string().required('Mã thiết bị là bắt buộc'),
    category: Yup.string().required('Danh mục là bắt buộc'),
    quantity: Yup.number()
        .min(0, 'Số lượng không được âm')
        .required('Số lượng là bắt buộc'),
    price: Yup.number()
        .min(0, 'Giá không được âm')
        .required('Giá là bắt buộc'),
    status: Yup.string().required('Trạng thái là bắt buộc'),
});

const DeviceForm: React.FC<DeviceFormProps> = ({ device, onSubmit, onClose }) => {
    const formik = useFormik({
        initialValues: {
            name: device?.name || '',
            code: device?.code || '',
            category: device?.category || '',
            quantity: device?.quantity || 0,
            price: device?.price || 0,
            status: device?.status || 'active',
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <>
            <DialogTitle>
                {device ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="code"
                                label="Mã thiết bị"
                                value={formik.values.code}
                                onChange={formik.handleChange}
                                error={formik.touched.code && Boolean(formik.errors.code)}
                                helperText={formik.touched.code && formik.errors.code}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="name"
                                label="Tên thiết bị"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="category"
                                label="Danh mục"
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                error={formik.touched.category && Boolean(formik.errors.category)}
                                helperText={formik.touched.category && formik.errors.category}
                            />
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
                                label="Giá (VNĐ)"
                                value={formik.values.price}
                                onChange={formik.handleChange}
                                error={formik.touched.price && Boolean(formik.errors.price)}
                                helperText={formik.touched.price && formik.errors.price}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                name="status"
                                label="Trạng thái"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                            >
                                <MenuItem value="active">Hoạt động</MenuItem>
                                <MenuItem value="inactive">Không hoạt động</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained">
                        {device ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </form>
        </>
    );
};

export default DeviceForm; 