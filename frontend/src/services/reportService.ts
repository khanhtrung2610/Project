import api from './api';
import { saveAs } from 'file-saver';

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
    }
}; 