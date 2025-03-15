import React from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Inventory,
    ShoppingCart,
    Assessment,
    Category,
    ImportExport,
    LocalShipping,
    Receipt,
    People
} from '@mui/icons-material';

interface MenuItemType {
    title: string;
    icon: JSX.Element;
    path: string;
    description: string;
    color: string;
}

const Dashboard = () => {
    const menuItems: MenuItemType[] = [
        {
            title: 'Quản lý thiết bị',
            icon: <Inventory sx={{ fontSize: 40 }}/>,
            path: '/devices',
            description: 'Quản lý danh sách thiết bị, thông tin chi tiết',
            color: '#4caf50'
        },
        {
            title: 'Nhập kho',
            icon: <ImportExport sx={{ fontSize: 40 }}/>,
            path: '/import',
            description: 'Quản lý nhập kho từ nhà cung cấp',
            color: '#2196f3'
        },
        {
            title: 'Xuất kho',
            icon: <LocalShipping sx={{ fontSize: 40 }}/>,
            path: '/export',
            description: 'Quản lý xuất kho cho khách hàng',
            color: '#ff9800'
        },
        {
            title: 'Báo cáo thống kê',
            icon: <Assessment sx={{ fontSize: 40 }}/>,
            path: '/reports',
            description: 'Xem báo cáo và thống kê kho',
            color: '#f44336'
        },
        {
            title: 'Danh mục',
            icon: <Category sx={{ fontSize: 40 }}/>,
            path: '/categories',
            description: 'Quản lý danh mục thiết bị',
            color: '#9c27b0'
        },
        {
            title: 'Nhà cung cấp',
            icon: <People sx={{ fontSize: 40 }}/>,
            path: '/suppliers',
            description: 'Quản lý thông tin nhà cung cấp',
            color: '#795548'
        },
        {
            title: 'Hóa đơn',
            icon: <Receipt sx={{ fontSize: 40 }}/>,
            path: '/invoices',
            description: 'Quản lý hóa đơn nhập xuất',
            color: '#607d8b'
        },
        {
            title: 'Giao dịch',
            icon: <ShoppingCart sx={{ fontSize: 40 }}/>,
            path: '/transactions',
            description: 'Lịch sử giao dịch nhập xuất',
            color: '#009688'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Hệ thống quản lý kho
            </Typography>
            <Grid container spacing={3}>
                {menuItems.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.title}>
                        <Tooltip title={item.description}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: 180,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    }
                                }}
                                onClick={() => window.location.href = item.path}
                            >
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: '50%', 
                                    backgroundColor: item.color,
                                    color: 'white',
                                    mb: 2
                                }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" component="h2" align="center">
                                    {item.title}
                                </Typography>
                            </Paper>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard; 