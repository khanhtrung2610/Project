import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Devices from './pages/Devices';
import ErrorBoundary from './components/common/ErrorBoundary';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

const App = () => {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <CssBaseline />
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
                    } />
                    <Route path="/" element={
                        isAuthenticated ? <Layout /> : <Navigate to="/login" />
                    }>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="devices" element={<Devices />} />
                        <Route path="transactions" element={<Transactions />} />
                        <Route path="reports" element={<Reports />} />
                        <Route index element={<Navigate to="/dashboard" />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
};

export default App; 