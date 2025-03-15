import api from './api';
import { Transaction } from '../types/transaction';

export const transactionService = {
    getTransactions: async () => {
        const response = await api.get<Transaction[]>('/transactions');
        return response.data;
    },

    createTransaction: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await api.post<Transaction>('/transactions', transaction);
        return response.data;
    },

    updateTransaction: async (id: number, status: string) => {
        const response = await api.put<Transaction>(`/transactions/${id}/status`, { status });
        return response.data;
    }
}; 