// src/server.js
const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors'); // <--- 1. Import cors
require('dotenv').config();

// Connect Database
connectDB();

const app = express();

// <--- 2. Tambahkan Middleware cors DI SINI (Sebelum route lain)
app.use(cors()); 
// Ini mengizinkan semua frontend untuk mengakses backend ini

// Init Middleware
app.use(express.json({ extended: false }));

// Simple logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Define Routes
app.get('/api', (req, res) => res.send('API Running'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/bahan', require('./src/routes/bahanRoutes'));
app.use('/api/packaging', require('./src/routes/packagingRoutes'));
app.use('/api/inventaris', require('./src/routes/assetRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;