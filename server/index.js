const express = require('express');
const cors = require('cors');
require('dotenv').config();

const deviceRoutes = require('./routes/device.routes');

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình CORS
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:5501'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/alerts', require('./routes/alert.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/payments', require('./routes/payment.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Có lỗi xảy ra!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
}); 