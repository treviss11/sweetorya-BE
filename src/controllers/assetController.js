const Asset = require('../models/Asset');

exports.getAllAssets = async (req, res) => {
    try {
        const search = req.query.search || '';
        // Cari berdasarkan Nama Barang ATAU Kondisi
        let query = {};
        if (search) {
            query = {
                $or: [
                    { nama_barang: { $regex: search, $options: 'i' } },
                    { kondisi: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const assets = await Asset.find(query).sort({ nama_barang: 'asc' });
        res.json(assets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createAsset = async (req, res) => {
    const { nama_barang, jumlah, kondisi, total_harga } = req.body;
    try {
        const asset = new Asset({ nama_barang, jumlah, kondisi, modal_dikeluarkan: total_harga });
        await asset.save();
        res.status(201).json(asset);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.updateAssetKondisi = async (req, res) => {
    const { kondisi_baru } = req.body;
    try {
        let asset = await Asset.findByIdAndUpdate(req.params.id, { $set: { kondisi: kondisi_baru } }, { new: true });
        if (!asset) return res.status(404).json({ msg: 'Asset tidak ditemukan' });
        res.json(asset);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.deleteAsset = async (req, res) => {
    try {
        let asset = await Asset.findByIdAndDelete(req.params.id);
        if (!asset) return res.status(404).json({ msg: 'Asset tidak ditemukan' });
        res.json({ msg: 'Asset berhasil dihapus' });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};