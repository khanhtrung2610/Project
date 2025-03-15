import api from './api';
import { saveAs } from 'file-saver';

export interface DailyRevenue {
    date: string;
    revenue: number;
}

export interface InventoryMovement {
    date: string;
    import: number;
    export: number;
}

export interface StockSummary {
    categoryName: string;
    quantity: number;
    value: number;
}

export const reportService = {
    async exportDeviceReport(filters: any) {
        try {
            const response = await api.get('/reports/devices/export', {
                params: filters,
                responseType: 'blob'
            });
            saveAs(response.data, `bao-cao-thiet-bi-${new Date().getTime()}.xlsx`);
        } catch (error) {
            throw new Error('Lỗi khi xuất báo cáo thiết bị');
        }
    },

    async exportTransactionReport(filters: any) {
        try {
            const response = await api.get('/reports/transactions/export', {
                params: filters,
                responseType: 'blob'
            });
            saveAs(response.data, `bao-cao-giao-dich-${new Date().getTime()}.xlsx`);
        } catch (error) {
            throw new Error('Lỗi khi xuất báo cáo giao dịch');
        }
    },

    async getInventoryStats() {
        try {
            const response = await api.get('/reports/inventory/stats');
            return response.data;
        } catch (error) {
            throw new Error('Lỗi khi lấy thống kê tồn kho');
        }
    },

    getDailyRevenue: async (startDate: Date, endDate: Date) => {
        const response = await api.get<DailyRevenue[]>('/reports/revenue', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getInventoryMovements: async (startDate: Date, endDate: Date) => {
        const response = await api.get<InventoryMovement[]>('/reports/inventory-movements', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getStockSummary: async () => {
        const response = await api.get<StockSummary[]>('/reports/stock-summary');
        return response.data;
    }
}; 