const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    nama_pemesan: { type: String, required: true },
    telp_pemesan: { type: String, required: true },
    
    // PERUBAHAN DISINI: Menggunakan Array of Objects
    items: [{
        nama_varian: { type: String, required: true },
        jumlah: { type: Number, required: true, min: 1 },
        harga_satuan: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true }
    }],

    // harga_total adalah penjumlahan dari semua subtotal item
    harga_total: { type: Number, required: true },
    
    nama_penerima: { type: String, required: true },
    telp_penerima: { type: String, required: true },
    alamat_pengiriman: { type: String, required: true },
    ucapan_untuk: { type: String },
    ucapan_isi: { type: String },
    ucapan_dari: { type: String },
    link_testimoni: { type: String },
    status_pesanan: { type: String, enum: ['Belum Selesai', 'Selesai'], default: 'Belum Selesai' },
    status_pembayaran: { type: String, enum: ['Belum Lunas', 'Lunas'], default: 'Belum Lunas' },
}, { timestamps: true });
module.exports = mongoose.model('Order', OrderSchema);