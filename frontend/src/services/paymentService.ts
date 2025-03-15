import api from './api';
import { Payment, PaymentCreate } from '../types/payment';
import { cache } from '../utils/cache';

export const paymentService = {
    getPayments: async () => {
        const response = await api.get<Payment[]>('/payments');
        return response.data;
    },

    createPayment: async (payment: PaymentCreate) => {
        const response = await api.post<Payment>('/payments', payment);
        cache.clear();
        return response.data;
    },

    updatePaymentStatus: async (id: number, status: string) => {
        const response = await api.put<Payment>(`/payments/${id}/status`, { status });
        cache.clear();
        return response.data;
    }
}; 