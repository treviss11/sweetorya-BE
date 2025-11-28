const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssetSchema = new Schema({
    nama_barang: { type: String, required: true },
    jumlah: { type: Number, required: true, min: 1 },
    harga_satuan: { type: Number, required: true, min: 0 },
    total_harga: { type: Number, required: true, min: 0 },
    tgl_pembelian: { type: Date, default: Date.now },
    kondisi: { type: String, enum: ['Baik', 'Rusak', 'Hilang'], default: 'Baik' },
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);