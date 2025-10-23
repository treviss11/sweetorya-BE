// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' }); // Adjust path if needed when running directly

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false); // Optional: Prepare for Mongoose 7
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;