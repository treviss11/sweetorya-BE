const Bahan = require('../models/Bahan');

exports.getAllBahan = async (req, res) => {
    try {
        const search = req.query.search || '';
        const query = search ? { nama_bahan: { $regex: search, $options: 'i' } } : {};
        const bahan = await Bahan.find(query).sort({ tgl_beli: 'desc', createdAt: 'desc' });
        res.json(bahan);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.createBahan = async (req, res) => {
    const { nama_bahan, stok, satuan, total_harga, tgl_beli, supplier } = req.body;
    try {
        const bahan = new Bahan({
            nama_bahan,
            stok,
            satuan,
            modal_dikeluarkan: total_harga,
            tgl_beli: tgl_beli || new Date(),
            supplier: supplier || '-'
        });

        await bahan.save();
        res.status(201).json({ msg: 'Bahan baru berhasil dicatat.', data: bahan });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
exports.updateBahanStock = async (req, res) => {
    const { jumlah_keluar } = req.body;
    try {
        let bahan = await Bahan.findById(req.params.id);
        if (!bahan) return res.status(404).json({ msg: 'Bahan tidak ditemukan' });
        if (jumlah_keluar > bahan.stok) return res.status(400).json({ msg: `Stok tidak cukup. Sisa: ${bahan.stok}` });
        if (jumlah_keluar < 0) return res.status(400).json({ msg: `Jumlah keluar tidak boleh negatif.` });
        bahan.stok -= jumlah_keluar;
        await bahan.save();
        res.json(bahan);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};