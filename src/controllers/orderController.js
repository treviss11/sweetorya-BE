const Order = require('../models/Order');

const HARGA_BOX = { '6pcs': 37800, '9pcs': 55800 };

exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || ''; // Ambil parameter search

        const skip = (page - 1) * limit;

        // Logika Query Pencarian
        let query = {};
        if (search) {
            query = {
                $or: [
                    { nama_pemesan: { $regex: search, $options: 'i' } }, // i = case insensitive (huruf besar/kecil sama aja)
                    { nama_penerima: { $regex: search, $options: 'i' } },
                    { status_pesanan: { $regex: search, $options: 'i' } },
                    { status_pembayaran: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const orders = await Order.find(query)
            .sort({ createdAt: 'desc' }) // Saran: Ubah ke 'desc' agar yang terbaru muncul di atas
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments(query); // Hitung total sesuai hasil pencarian

        res.json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createOrder = async (req, res) => {
    const { 
        nama_pemesan, telp_pemesan, 
        items, // Array item dari frontend
        nama_penerima, telp_penerima, alamat_pengiriman, 
        ucapan_untuk, ucapan_isi, ucapan_dari 
    } = req.body;

    try {
        // Validasi: Items harus ada dan berupa array tidak kosong
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: 'Minimal harus ada satu barang yang dipesan.' });
        }

        // Hitung ulang total harga di backend untuk keamanan (atau percaya frontend juga boleh)
        let calculatedTotal = 0;
        const processedItems = items.map(item => {
            const subtotal = item.jumlah * item.harga_satuan;
            calculatedTotal += subtotal;
            return {
                nama_varian: item.nama_varian,
                jumlah: item.jumlah,
                harga_satuan: item.harga_satuan,
                subtotal: subtotal
            };
        });

        const newOrder = new Order({
            nama_pemesan,
            telp_pemesan,
            items: processedItems, // Simpan array item
            harga_total: calculatedTotal,
            nama_penerima,
            telp_penerima,
            alamat_pengiriman,
            ucapan_untuk,
            ucapan_isi,
            ucapan_dari
        });

        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { status_pesanan, status_pembayaran } = req.body;
    try {
        const updateData = {};
        if (status_pesanan && ['Belum Selesai', 'Selesai'].includes(status_pesanan)) updateData.status_pesanan = status_pesanan;
        if (status_pembayaran && ['Belum Lunas', 'Lunas'].includes(status_pembayaran)) updateData.status_pembayaran = status_pembayaran;
        if (Object.keys(updateData).length === 0) return res.status(400).json({ msg: 'Status tidak valid' });
        let order = await Order.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        if (!order) return res.status(404).json({ msg: 'Pesanan tidak ditemukan' });
        res.json(order);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.updateTestimonial = async (req, res) => {
    const { link_testimoni } = req.body;
    try {
        if (!link_testimoni || !link_testimoni.startsWith('http')) return res.status(400).json({ msg: 'Link tidak valid' });
        let order = await Order.findByIdAndUpdate(req.params.id, { $set: { link_testimoni } }, { new: true });
        if (!order) return res.status(404).json({ msg: 'Pesanan tidak ditemukan' });
        res.json(order);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.getSummary = async (req, res) => {
    try {
        const Bahan = require('../models/Bahan'); const Packaging = require('../models/Packaging'); const Asset = require('../models/Asset');
        const pResult = await Order.aggregate([{ $match: { status_pembayaran: 'Lunas' } }, { $group: { _id: null, total: { $sum: '$harga_total' } } }]);
        const bResult = await Bahan.aggregate([{ $group: { _id: null, total: { $sum: '$modal_dikeluarkan' } } }]);
        const pkgResult = await Packaging.aggregate([{ $group: { _id: null, total: { $sum: '$modal_dikeluarkan' } } }]);
        const aResult = await Asset.aggregate([{ $group: { _id: null, total: { $sum: '$modal_dikeluarkan' } } }]);
        const total_pendapatan = pResult.length > 0 ? pResult[0].total : 0;
        const total_modal_bahan = bResult.length > 0 ? bResult[0].total : 0;
        const total_modal_packaging = pkgResult.length > 0 ? pkgResult[0].total : 0;
        const total_modal_aset = aResult.length > 0 ? aResult[0].total : 0;
        const total_pengeluaran = total_modal_bahan + total_modal_packaging + total_modal_aset;
        const keuntungan_bersih = total_pendapatan - total_pengeluaran;
        const jumlah_pesanan_selesai = await Order.countDocuments({ status_pesanan: 'Selesai' });
        res.json({ total_pendapatan, total_pengeluaran, keuntungan_bersih, jumlah_pesanan_selesai, total_modal_bahan, total_modal_packaging, total_modal_aset });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};