import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const deviceService = {
    // Lấy tất cả thiết bị
    getAllDevices: async () => {
        try {
            const response = await axios.get(`${API_URL}/devices`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thiết bị:', error);
            throw error;
        }
    },

    // Lấy thiết bị theo ID
    getDeviceById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/devices/${id}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin thiết bị:', error);
            throw error;
        }
    },

    // Thêm thiết bị mới
    createDevice: async (deviceData) => {
        try {
            const response = await axios.post(`${API_URL}/devices`, deviceData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi thêm thiết bị:', error);
            throw error;
        }
    },

    // Cập nhật thiết bị
    updateDevice: async (id, deviceData) => {
        try {
            const response = await axios.put(`${API_URL}/devices/${id}`, deviceData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật thiết bị:', error);
            throw error;
        }
    },

    // Xóa thiết bị
    deleteDevice: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/devices/${id}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi xóa thiết bị:', error);
            throw error;
        }
    },

    // Lấy thiết bị sắp hết hàng
    getLowStockDevices: async () => {
        try {
            const response = await axios.get(`${API_URL}/devices/low-stock`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thiết bị sắp hết hàng:', error);
            throw error;
        }
    }
}; 