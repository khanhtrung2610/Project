export interface Supplier {
    id: number;
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    contactPerson: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface TransactionHistory {
    id: number;
    type: 'IMPORT' | 'EXPORT';
    date: string;
    supplierId?: number;
    supplierName?: string;
    items: {
        deviceId: number;
        deviceName: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
    note?: string;
    createdBy: string;
    createdAt: string;
} 