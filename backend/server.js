const express = require('express');
const cors = require('cors');
const devicesRouter = require('./routes/devices');
const transactionsRouter = require('./routes/transactions');
const paymentsRouter = require('./routes/payments');
const alertsRouter = require('./routes/alerts');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/devices', devicesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/alerts', alertsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
});

// Start server
app.listen(port, () => {
    console.log(`Server đang chạy trên port ${port}`);
});
