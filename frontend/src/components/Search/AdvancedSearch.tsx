import React, { useState } from 'react';
import {
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    IconButton,
    Collapse,
    MenuItem,
    Chip,
} from '@mui/material';
import {
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

interface SearchFilter {
    field: string;
    operator: string;
    value: string;
}

interface AdvancedSearchProps {
    onSearch: (filters: SearchFilter[]) => void;
    fields: { value: string; label: string }[];
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, fields }) => {
    const [expanded, setExpanded] = useState(false);
    const [filters, setFilters] = useState<SearchFilter[]>([]);
    const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

    const operators = [
        { value: 'eq', label: '=' },
        { value: 'gt', label: '>' },
        { value: 'lt', label: '<' },
        { value: 'contains', label: 'Chứa' },
    ];

    const handleAddFilter = () => {
        setFilters([...filters, { field: '', operator: 'eq', value: '' }]);
    };

    const handleRemoveFilter = (index: number) => {
        const newFilters = filters.filter((_, i) => i !== index);
        setFilters(newFilters);
    };

    const handleFilterChange = (index: number, key: string, value: string) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [key]: value };
        setFilters(newFilters);
    };

    const handleSearch = () => {
        const validFilters = filters.filter(f => f.field && f.value);
        setActiveFilters(validFilters);
        onSearch(validFilters);
    };

    const handleClearAll = () => {
        setFilters([]);
        setActiveFilters([]);
        onSearch([]);
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Tìm kiếm nhanh..."
                    sx={{ flexGrow: 1, mr: 1 }}
                    InputProps={{
                        endAdornment: <SearchIcon />
                    }}
                />
                <Button
                    variant="outlined"
                    endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setExpanded(!expanded)}
                >
                    Tìm kiếm nâng cao
                </Button>
            </Box>

            {activeFilters.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    {activeFilters.map((filter, index) => (
                        <Chip
                            key={index}
                            label={`${fields.find(f => f.value === filter.field)?.label} ${
                                operators.find(o => o.value === filter.operator)?.label
                            } ${filter.value}`}
                            onDelete={() => {
                                const newFilters = activeFilters.filter((_, i) => i !== index);
                                setActiveFilters(newFilters);
                                onSearch(newFilters);
                            }}
                            sx={{ mr: 1, mb: 1 }}
                        />
                    ))}
                    <Chip
                        label="Xóa tất cả"
                        onDelete={handleClearAll}
                        color="error"
                        sx={{ mb: 1 }}
                    />
                </Box>
            )}

            <Collapse in={expanded}>
                <Box sx={{ mt: 2 }}>
                    {filters.map((filter, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                            <Grid item xs={4}>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Trường"
                                    value={filter.field}
                                    onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                                >
                                    {fields.map((field) => (
                                        <MenuItem key={field.value} value={field.value}>
                                            {field.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Điều kiện"
                                    value={filter.operator}
                                    onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                                >
                                    {operators.map((op) => (
                                        <MenuItem key={op.value} value={op.value}>
                                            {op.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Giá trị"
                                    value={filter.value}
                                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton onClick={() => handleRemoveFilter(index)}>
                                    <ClearIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button onClick={handleAddFilter}>
                            Thêm điều kiện
                        </Button>
                        <Box>
                            <Button onClick={() => setExpanded(false)} sx={{ mr: 1 }}>
                                Hủy
                            </Button>
                            <Button variant="contained" onClick={handleSearch}>
                                Áp dụng
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default AdvancedSearch; 