import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Tạo instance axios với cấu hình chung
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để tự động gắn token vào header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Thêm interceptor để xử lý lỗi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const deviceApi = {
    getAll: () => api.get('/devices'),
    create: (data: any) => api.post('/devices', data),
    update: (id: string, data: any) => api.put(`/devices/${id}`, data),
    delete: (id: string) => api.delete(`/devices/${id}`),
    search: (filters: any[]) => api.post('/devices/search', { filters }),
    export: (params: { format: string; fields: string[]; filters: any }) =>
        api.post('/devices/export', params, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `devices-export.${params.format}`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }),
};

export const authApi = {
    login: (credentials: { username: string; password: string }) =>
        api.post('/auth/login', credentials),
    logout: () => {
        localStorage.removeItem('token');
    },
};

export default api; 