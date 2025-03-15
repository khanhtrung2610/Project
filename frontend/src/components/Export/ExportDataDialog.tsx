import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    CircularProgress,
} from '@mui/material';

interface ExportDataDialogProps {
    open: boolean;
    onClose: () => void;
    onExport: (format: string, fields: string[]) => Promise<void>;
    availableFields: { value: string; label: string }[];
}

const ExportDataDialog: React.FC<ExportDataDialogProps> = ({
    open,
    onClose,
    onExport,
    availableFields,
}) => {
    const [format, setFormat] = useState('xlsx');
    const [selectedFields, setSelectedFields] = useState<string[]>(
        availableFields.map(field => field.value)
    );
    const [isExporting, setIsExporting] = useState(false);

    const handleFieldToggle = (field: string) => {
        setSelectedFields(prev =>
            prev.includes(field)
                ? prev.filter(f => f !== field)
                : [...prev, field]
        );
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await onExport(format, selectedFields);
            onClose();
        } catch (error) {
            console.error('Lỗi khi xuất dữ liệu:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Xuất dữ liệu</DialogTitle>
            <DialogContent>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel>Định dạng file</FormLabel>
                    <RadioGroup
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                    >
                        <FormControlLabel
                            value="xlsx"
                            control={<Radio />}
                            label="Excel (XLSX)"
                        />
                        <FormControlLabel
                            value="csv"
                            control={<Radio />}
                            label="CSV"
                        />
                        <FormControlLabel
                            value="pdf"
                            control={<Radio />}
                            label="PDF"
                        />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset">
                    <FormLabel>Chọn trường xuất</FormLabel>
                    <FormGroup>
                        {availableFields.map((field) => (
                            <FormControlLabel
                                key={field.value}
                                control={
                                    <Checkbox
                                        checked={selectedFields.includes(field.value)}
                                        onChange={() => handleFieldToggle(field.value)}
                                    />
                                }
                                label={field.label}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button
                    variant="contained"
                    onClick={handleExport}
                    disabled={isExporting || selectedFields.length === 0}
                >
                    {isExporting ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Đang xuất...
                        </>
                    ) : (
                        'Xuất'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportDataDialog; 