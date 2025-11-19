const Packaging = require('../models/Packaging');

exports.getAllPackaging = async (req, res) => {
    try {
        const search = req.query.search || '';
        const query = search ? { nama_packaging: { $regex: search, $options: 'i' } } : {};

        const items = await Packaging.find(query).sort({ nama_packaging: 'asc' });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createPackaging = async (req, res) => {
    const { nama_packaging, stok, satuan, total_harga } = req.body;
    try {
        let item = await Packaging.findOne({ nama_packaging });
        if (item) return res.status(400).json({ msg: 'Packaging sudah ada' });
        item = new Packaging({ nama_packaging, stok, satuan, modal_dikeluarkan: total_harga });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ msg: 'Nama packaging sudah ada.' });
        console.error(err.message); res.status(500).send('Server Error');
    }
};

exports.updatePackagingStock = async (req, res) => {
    const { jumlah_keluar } = req.body;
    try {
        let item = await Packaging.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Packaging tidak ditemukan' });
        if (jumlah_keluar > item.stok) return res.status(400).json({ msg: `Stok tidak cukup. Sisa: ${item.stok}` });
        if (jumlah_keluar < 0) return res.status(400).json({ msg: `Jumlah keluar tidak boleh negatif.` });
        item.stok -= jumlah_keluar;
        await item.save();
        res.json(item);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};