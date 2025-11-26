const Asset = require('../models/Asset');

exports.getAllAssets = async (req, res) => {
    try {
        const search = req.query.search || '';
        let query = {};
        if (search) {
            query = { nama_barang: { $regex: search, $options: 'i' } };
        }
        // Urutkan berdasarkan tanggal pembelian terbaru
        const assets = await Asset.find(query).sort({ tgl_pembelian: 'desc' });
        res.json(assets);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.createAsset = async (req, res) => {
    const { nama_barang, jumlah, harga_satuan, tgl_pembelian, kondisi } = req.body;
    try {
        const existingAsset = await Asset.findOne({ 
            nama_barang: { $regex: new RegExp(`^${nama_barang}$`, 'i') } 
        });
        
        if (existingAsset) {
            return res.status(400).json({ msg: `Barang '${nama_barang}' sudah ada. Silakan edit data yang ada.` });
        }

        const total_harga = jumlah * harga_satuan;

        const asset = new Asset({
            nama_barang,
            jumlah,
            harga_satuan,
            total_harga,
            tgl_pembelian: tgl_pembelian || new Date(),
            kondisi
        });

        await asset.save();
        res.status(201).json(asset);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Nama barang sudah ada.' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateAsset = async (req, res) => {
    const { nama_barang, jumlah, harga_satuan, tgl_pembelian, kondisi } = req.body;
    
    try {
        let asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ msg: 'Asset tidak ditemukan' });

        if (nama_barang && nama_barang !== asset.nama_barang) {
             const duplicate = await Asset.findOne({ 
                nama_barang: { $regex: new RegExp(`^${nama_barang}$`, 'i') } 
            });
            if (duplicate) return res.status(400).json({ msg: `Nama '${nama_barang}' sudah digunakan barang lain.` });
        }

        if (nama_barang) asset.nama_barang = nama_barang;
        if (jumlah) asset.jumlah = jumlah;
        if (harga_satuan) asset.harga_satuan = harga_satuan;
        if (tgl_pembelian) asset.tgl_pembelian = tgl_pembelian;
        if (kondisi) asset.kondisi = kondisi;
        
        asset.total_harga = asset.jumlah * asset.harga_satuan;

        await asset.save();
        res.json(asset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
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