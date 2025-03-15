const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const deviceRoutes = require('./routes/deviceRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/devices', deviceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
}); 