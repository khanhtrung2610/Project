import api from './api';
import { Supplier } from '../types/supplier';
import { cache } from '../utils/cache';

export const supplierService = {
    getSuppliers: async () => {
        const response = await api.get<Supplier[]>('/suppliers');
        return response.data;
    },

    getSupplier: async (id: number) => {
        const response = await api.get<Supplier>(`/suppliers/${id}`);
        return response.data;
    },

    createSupplier: async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await api.post<Supplier>('/suppliers', supplier);
        cache.clear();
        return response.data;
    },

    updateSupplier: async (id: number, supplier: Partial<Supplier>) => {
        const response = await api.put<Supplier>(`/suppliers/${id}`, supplier);
        cache.clear();
        return response.data;
    },

    deleteSupplier: async (id: number) => {
        await api.delete(`/suppliers/${id}`);
        cache.clear();
    }
};

export const transactionHistoryService = {
    getTransactionHistory: async () => {
        const response = await api.get<TransactionHistory[]>('/transactions/history');
        return response.data;
    },

    getSupplierTransactions: async (supplierId: number) => {
        const response = await api.get<TransactionHistory[]>(`/suppliers/${supplierId}/transactions`);
        return response.data;
    }
}; 