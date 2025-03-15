import api from './api';
import { Device } from '../types/device';

export const deviceService = {
    getDevices: async () => {
        const response = await api.get<Device[]>('/devices');
        return response.data;
    },

    getDevice: async (id: number) => {
        const response = await api.get<Device>(`/devices/${id}`);
        return response.data;
    },

    createDevice: async (device: Omit<Device, 'id'>) => {
        const response = await api.post<Device>('/devices', device);
        return response.data;
    },

    updateDevice: async (id: number, device: Partial<Device>) => {
        const response = await api.put<Device>(`/devices/${id}`, device);
        return response.data;
    },

    deleteDevice: async (id: number) => {
        await api.delete(`/devices/${id}`);
    }
}; 