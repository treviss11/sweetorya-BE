const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { nama_pemesan: { $regex: search, $options: 'i' } },
                    { nama_penerima: { $regex: search, $options: 'i' } },
                    { status_pesanan: { $regex: search, $options: 'i' } },
                    { status_pembayaran: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const orders = await Order.find(query)
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments(query); 

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
        nama_pemesan, telp_pemesan, items, 
        nama_penerima, telp_penerima, alamat_pengiriman, 
        ucapan_untuk, ucapan_isi, ucapan_dari,
        tgl_pesan, tgl_kirim, jam_kirim, catatan 
    } = req.body;

    try {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: 'Minimal harus ada satu barang.' });
        }

        let calculatedTotal = 0;
        const processedItems = items.map(item => {
            const subtotal = item.jumlah * item.harga_satuan;
            calculatedTotal += subtotal;
            return { ...item, subtotal };
        });

        const newOrder = new Order({
            nama_pemesan, telp_pemesan, items: processedItems, harga_total: calculatedTotal,
            nama_penerima, telp_penerima, alamat_pengiriman,
            ucapan_untuk, ucapan_isi, ucapan_dari,
            tgl_pesan: tgl_pesan || new Date(), 
            tgl_kirim, jam_kirim, catatan
        });

        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Pesanan tidak ditemukan' });
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateOrder = async (req, res) => {
    const { 
        nama_pemesan, telp_pemesan, items, 
        nama_penerima, telp_penerima, alamat_pengiriman, 
        ucapan_untuk, ucapan_isi, ucapan_dari,
        tgl_pesan, tgl_kirim, jam_kirim, catatan,
        status_pesanan, status_pembayaran
    } = req.body;

    try {
        let calculatedTotal = 0;
        let processedItems = [];
        
        if (items && items.length > 0) {
            processedItems = items.map(item => {
                const subtotal = item.jumlah * item.harga_satuan;
                calculatedTotal += subtotal;
                return { ...item, subtotal };
            });
        }

        const updateData = {
            nama_pemesan, telp_pemesan, 
            items: processedItems, 
            harga_total: calculatedTotal,
            nama_penerima, telp_penerima, alamat_pengiriman,
            ucapan_untuk, ucapan_isi, ucapan_dari,
            tgl_pesan, tgl_kirim, jam_kirim, catatan,
            status_pesanan, status_pembayaran
        };

        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true }
        );

        if (!order) return res.status(404).json({ msg: 'Pesanan tidak ditemukan' });
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Pesanan tidak ditemukan' });
        res.json({ msg: 'Pesanan berhasil dihapus' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getSuggestions = async (req, res) => {
    try {
        const customers = await Order.aggregate([
            { $group: { _id: { nama: "$nama_pemesan", telp: "$telp_pemesan" } } },
            { $project: { nama: "$_id.nama", telp: "$_id.telp", _id: 0 } }
        ]);

        const variants = await Order.distinct("items.nama_varian");

        res.json({ customers, variants });
    } catch (err) {
        console.error(err);
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
        const Bahan = require('../models/Bahan');
        const Packaging = require('../models/Packaging');
        const Asset = require('../models/Asset'); 

        const pResult = await Order.aggregate([
            { $match: { status_pesanan: 'Selesai', status_pembayaran: 'Lunas' } }, 
            { $group: { _id: null, total: { $sum: '$harga_total' } } }
        ]);

        const bResult = await Bahan.aggregate([{ $group: { _id: null, total: { $sum: '$modal_dikeluarkan' } } }]);
        const pkgResult = await Packaging.aggregate([{ $group: { _id: null, total: { $sum: '$modal_dikeluarkan' } } }]);
        const aResult = await Asset.aggregate([{ 
            $group: { _id: null, total: { $sum: '$modal_dikeluarkan' } } 
        }]);

        const total_pendapatan = pResult.length > 0 ? pResult[0].total : 0;
        const total_modal_bahan = bResult.length > 0 ? bResult[0].total : 0;
        const total_modal_packaging = pkgResult.length > 0 ? pkgResult[0].total : 0;
        const total_modal_aset = aResult.length > 0 ? aResult[0].total : 0;

        const total_pengeluaran = total_modal_bahan + total_modal_packaging + total_modal_aset;

        const keuntungan_bersih = total_pendapatan - total_pengeluaran;

        const jumlah_pesanan_selesai = await Order.countDocuments({ status_pesanan: 'Selesai' });

        res.json({
            total_pendapatan,
            total_pengeluaran,
            keuntungan_bersih,
            jumlah_pesanan_selesai,
            pengeluaran: {
                bahan: total_modal_bahan,
                packaging: total_modal_packaging,
                aset: total_modal_aset
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};