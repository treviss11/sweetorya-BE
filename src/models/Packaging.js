const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackagingSchema = new Schema({
    nama_packaging: { type: String, required: true, unique: true },
    stok: { type: Number, required: true, min: 0 },
    satuan: { type: String, required: true, enum: ['pcs', 'lembar', 'biji'] },
    modal_dikeluarkan: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Packaging', PackagingSchema);