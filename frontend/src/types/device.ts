export interface Device {
    id: number;
    name: string;
    category: string;
    serialNumber: string;
    status: string;
    quantity: number;
    createdAt?: string;
    updatedAt?: string;
} 