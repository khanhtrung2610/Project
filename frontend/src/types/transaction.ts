export type TransactionType = 'IMPORT' | 'EXPORT';

export interface TransactionItem {
    deviceId: number;
    deviceName: string;
    quantity: number;
    price: number;
}

export interface Transaction {
    id: number;
    type: TransactionType;
    date: string;
    items: TransactionItem[];
    totalAmount: number;
    note?: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
} 