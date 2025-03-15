import api from './api';
import { Payment, PaymentCreate } from '../types/payment';

export const paymentService = {
    getPayments: async () => {
        const response = await api.get<Payment[]>('/payments');
        return response.data;
    },

    createPayment: async (payment: PaymentCreate) => {
        const response = await api.post<Payment>('/payments', payment);
        return response.data;
    },

    updatePaymentStatus: async (id: number, status: string) => {
        const response = await api.put<Payment>(`/payments/${id}/status`, { status });
        return response.data;
    }
}; 