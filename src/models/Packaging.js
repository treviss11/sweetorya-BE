const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackagingSchema = new Schema({
    nama_packaging: { type: String, required: true },
    stok_awal: { type: Number, required: true, min: 0 },
    stok_sisa: { type: Number, required: true, min: 0 },
    satuan: { type: String, required: true, enum: ['pcs', 'lembar', 'biji', 'pack', 'roll', 'kotak'] },
    modal_dikeluarkan: { type: Number, default: 0 },
    tgl_beli: { type: Date, default: Date.now },
    supplier: { type: String, default: '-' }
}, { timestamps: true });

module.exports = mongoose.model('Packaging', PackagingSchema);