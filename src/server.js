const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect Database
connectDB();

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));

// Simple logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Define Routes
app.get('/api', (req, res) => res.send('API Running'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/bahan', require('./routes/bahanRoutes'));
app.use('/api/packaging', require('./routes/packagingRoutes'));
app.use('/api/inventaris', require('./routes/assetRoutes')); // Keep path as inventaris

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));