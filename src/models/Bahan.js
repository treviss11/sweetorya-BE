const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BahanSchema = new Schema({
    nama_bahan: { type: String, required: true, unique: true },
    stok: { type: Number, required: true, min: 0 },
    satuan: { type: String, required: true, enum: ['ltr', 'kg', 'gr', 'cc', 'ml', 'pack', 'biji', 'pcs', 'lembar'] },
    modal_dikeluarkan: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Bahan', BahanSchema);