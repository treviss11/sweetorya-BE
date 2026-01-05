const Bahan = require('../models/Bahan');

exports.getAllBahan = async (req, res) => {
    try {
        const search = req.query.search || '';
        const pipeline = [
            {
                $match: search ? { nama_bahan: { $regex: search, $options: 'i' } } : {}
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

        const bahan = await Bahan.aggregate(pipeline);
        res.json(bahan);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.createBahan = async (req, res) => {
    const { nama_bahan, stok, satuan, total_harga, tgl_beli, supplier } = req.body;
    try {
        const bahan = new Bahan({
            nama_bahan,
            stok_awal: stok, 
            stok_sisa: stok, 
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
    const bahanId = req.params.id;

    try {
        let bahan = await Bahan.findById(bahanId);
        if (!bahan) return res.status(404).json({ msg: 'Bahan tidak ditemukan' });

        if (jumlah_keluar > bahan.stok_sisa) {
             return res.status(400).json({ msg: `Stok sisa tidak mencukupi. Sisa: ${bahan.stok_sisa}` });
        }
        if (jumlah_keluar < 0) {
            return res.status(400).json({ msg: `Jumlah keluar tidak boleh negatif.` });
        }

        bahan.stok_sisa -= jumlah_keluar;

        await bahan.save();
        res.json(bahan);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateBahan = async (req, res) => {
    try {
        const { nama_bahan, stok, satuan, total_harga, tgl_beli, supplier } = req.body;
        
        const updatedBahan = await Bahan.findByIdAndUpdate(
            req.params.id,
            { 
                nama_bahan, 
                stok_awal: stok, 
                stok_sisa: stok, 
                satuan, 
                modal_dikeluarkan: total_harga, 
                tgl_beli, 
                supplier 
            },
            { new: true }
        );

        if (!updatedBahan) return res.status(404).json({ msg: 'Bahan tidak ditemukan' });
        res.json(updatedBahan);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteBahan = async (req, res) => {
    try {
        const bahan = await Bahan.findByIdAndDelete(req.params.id);
        if (!bahan) return res.status(404).json({ msg: 'Bahan tidak ditemukan' });
        res.json({ msg: 'Bahan berhasil dihapus' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};