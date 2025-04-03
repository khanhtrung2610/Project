import React, { useState } from 'react';
import DeviceList from './components/DeviceList';
import AddDevice from './components/AddDevice';

function App() {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Quản lý kho</h1>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            {showAddForm ? 'Xem danh sách' : 'Thêm thiết bị'}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                {showAddForm ? (
                    <AddDevice onSuccess={() => setShowAddForm(false)} />
                ) : (
                    <DeviceList />
                )}
            </main>
        </div>
    );
}

export default App;
