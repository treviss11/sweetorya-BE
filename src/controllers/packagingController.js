const Packaging = require('../models/Packaging');

exports.getAllPackaging = async (req, res) => {
    try {
        const search = req.query.search || '';

        const pipeline = [
            {
                $match: search ? { nama_packaging: { $regex: search, $options: 'i' } } : {}
            },
            {
                $addFields: {
                    isAvailable: { $gt: ["$stok_sisa", 0] }
                }
            },
            {
                $sort: {
                    isAvailable: -1,  
                    tgl_beli: -1,       
                    createdAt: -1
                }
            }
        ];

        const items = await Packaging.aggregate(pipeline);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.createPackaging = async (req, res) => {
    const { nama_packaging, stok, satuan, total_harga, tgl_beli, supplier } = req.body;
    try {
        const item = new Packaging({
            nama_packaging,
            stok_awal: stok, 
            stok_sisa: stok,
            satuan,
            modal_dikeluarkan: total_harga,
            tgl_beli: tgl_beli || new Date(),
            supplier: supplier || '-'
        });

        await item.save();
        res.status(201).json({ msg: 'Packaging baru berhasil dicatat.', data: item });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updatePackagingStock = async (req, res) => {
    const { jumlah_keluar } = req.body;
    const itemId = req.params.id;

    try {
        let item = await Packaging.findById(itemId);
        if (!item) return res.status(404).json({ msg: 'Packaging tidak ditemukan' });

        if (jumlah_keluar > item.stok_sisa) {
             return res.status(400).json({ msg: `Stok sisa tidak mencukupi. Sisa: ${item.stok_sisa}` });
        }
        if (jumlah_keluar < 0) {
            return res.status(400).json({ msg: `Jumlah keluar tidak boleh negatif.` });
        }
        
        item.stok_sisa -= jumlah_keluar;

        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updatePackaging = async (req, res) => {
    try {
        const { nama_packaging, stok, satuan, total_harga, tgl_beli, supplier } = req.body;
        
        const updatedItem = await Packaging.findByIdAndUpdate(
            req.params.id,
            { 
                nama_packaging, 
                stok_awal: stok, 
                stok_sisa: stok, 
                satuan, 
                modal_dikeluarkan: total_harga, 
                tgl_beli, 
                supplier 
            },
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ msg: 'Packaging tidak ditemukan' });
        res.json(updatedItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deletePackaging = async (req, res) => {
    try {
        await Packaging.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Packaging berhasil dihapus' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};