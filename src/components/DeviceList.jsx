import React, { useState, useEffect } from 'react';
import { deviceService } from '../services/deviceService';

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        try {
            setLoading(true);
            const data = await deviceService.getAllDevices();
            setDevices(data);
        } catch (err) {
            setError('Không thể tải danh sách thiết bị');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Danh sách thiết bị</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                    <div key={device.id} className="border rounded-lg p-4 shadow-md">
                        <h3 className="text-xl font-semibold">{device.name}</h3>
                        <p className="text-gray-600">Danh mục: {device.category}</p>
                        <p className="text-gray-600">Số lượng: {device.quantity}</p>
                        <p className="text-gray-600">Giá: {device.price.toLocaleString()} VNĐ</p>
                        <p className="text-gray-600">Ngưỡng cảnh báo: {device.threshold}</p>
                        <p className="text-gray-600">Trạng thái: {device.status}</p>
                        {device.description && (
                            <p className="text-gray-600 mt-2">{device.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeviceList; 