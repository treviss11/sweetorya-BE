// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' }); // Adjust path if needed when running directly

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    // Jika sudah ada koneksi aktif, pakai yang lama (hemat waktu)
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // PENTING: Jangan buffer request jika belum konek
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected via Serverless Pattern');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;