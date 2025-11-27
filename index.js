// src/server.js
const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors'); // <--- 1. Import cors
require('dotenv').config();

// Connect Database
connectDB();

const app = express();

// <--- 2. Tambahkan Middleware cors DI SINI (Sebelum route lain)
app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (seperti Postman) atau jika origin ada di list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true
}));
// Ini mengizinkan semua frontend untuk mengakses backend ini

// Init Middleware
app.use(express.json({ extended: false }));

app.use(async (req, res, next) => {
    try {
        await connectDB(); 
        next();
    } catch (error) {
        console.error("Database connection failed in middleware");
        res.status(500).json({ error: "Database connection failed" });
    }
});

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
app.use('/api/auth', require('./src/routes/authRoutes'));

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;