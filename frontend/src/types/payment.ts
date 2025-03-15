export interface Payment {
    id: number;
    transactionId: number;
    amount: number;
    method: 'CASH' | 'BANK_TRANSFER' | 'CARD';
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    paymentDate: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentCreate {
    transactionId: number;
    amount: number;
    method: string;
    note?: string;
} 