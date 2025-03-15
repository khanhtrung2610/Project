import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface ImportExcelProps {
    open: boolean;
    onClose: () => void;
    onImport: (data: any[]) => Promise<void>;
    templateFields: string[];
    title: string;
}

const ImportExcel = ({ open, onClose, onImport, templateFields, title }: ImportExcelProps) => {
    const [error, setError] = useState<string>('');
    const [importing, setImporting] = useState(false);

    const validateData = (data: any[]) => {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('File không có dữ liệu');
        }

        const firstRow = data[0];
        const missingFields = templateFields.filter(
            field => !Object.keys(firstRow).includes(field)
        );

        if (missingFields.length > 0) {
            throw new Error(`Thiếu các trường: ${missingFields.join(', ')}`);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        setImporting(true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    validateData(jsonData);
                    await onImport(jsonData);
                    onClose();
                } catch (error: any) {
                    setError(error.message);
                } finally {
                    setImporting(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error: any) {
            setError(error.message);
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            templateFields.reduce((obj, field) => ({ ...obj, [field]: '' }), {})
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'template.xlsx');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <input
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="raised-button-file">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<UploadIcon />}
                            disabled={importing}
                        >
                            Chọn file Excel
                        </Button>
                    </label>
                    
                    <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                        hoặc
                    </Typography>
                    
                    <Button onClick={downloadTemplate}>
                        Tải template
                    </Button>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportExcel; 