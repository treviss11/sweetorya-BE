const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssetSchema = new Schema({
    nama_barang: { type: String, required: true },
    jumlah: { type: Number, required: true, min: 1 },
    kondisi: { type: String, enum: ['Baik', 'Rusak', 'Hilang'], default: 'Baik' },
    modal_dikeluarkan: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);