// src/controllers/reportController.js
const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const Bahan = require('../models/Bahan');
const Packaging = require('../models/Packaging');
const Asset = require('../models/Asset');

exports.downloadFullReport = async (req, res) => {
    try {
        // 1. Ambil semua data dari Database
        const orders = await Order.find().sort({ createdAt: 'asc' });
        const bahanList = await Bahan.find().sort({ nama_bahan: 'asc' });
        const packagingList = await Packaging.find().sort({ nama_packaging: 'asc' });
        const assetList = await Asset.find().sort({ nama_barang: 'asc' });

        // 2. Hitung Ringkasan Keuangan (Sama logic dengan getSummary)
        const totalPendapatan = orders
            .filter(o => o.status_pembayaran === 'Lunas')
            .reduce((acc, curr) => acc + curr.harga_total, 0);
        
        const modalBahan = bahanList.reduce((acc, curr) => acc + (curr.modal_dikeluarkan || 0), 0);
        const modalPackaging = packagingList.reduce((acc, curr) => acc + (curr.modal_dikeluarkan || 0), 0);
        const modalAsset = assetList.reduce((acc, curr) => acc + (curr.modal_dikeluarkan || 0), 0);
        const totalPengeluaran = modalBahan + modalPackaging + modalAsset;
        const keuntunganBersih = totalPendapatan - totalPengeluaran;

        // 3. Buat Workbook Excel Baru
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sweetorya System';
        workbook.created = new Date();

        // --- SHEET 1: RINGKASAN KEUANGAN ---
        const summarySheet = workbook.addWorksheet('Ringkasan Keuangan');
        summarySheet.columns = [
            { header: 'Kategori', key: 'kategori', width: 30 },
            { header: 'Jumlah (Rp)', key: 'jumlah', width: 20, style: { numFmt: '#,##0' } }
        ];
        summarySheet.addRows([
            { kategori: 'Total Pendapatan (Lunas)', jumlah: totalPendapatan },
            { kategori: 'Total Modal Bahan', jumlah: modalBahan },
            { kategori: 'Total Modal Packaging', jumlah: modalPackaging },
            { kategori: 'Total Modal Inventaris', jumlah: modalAsset },
            { kategori: 'TOTAL PENGELUARAN', jumlah: totalPengeluaran },
            { kategori: 'KEUNTUNGAN BERSIH', jumlah: keuntunganBersih },
        ]);
        // Styling Header
        summarySheet.getRow(1).font = { bold: true };

        // --- SHEET 2: DATA PESANAN ---
        const orderSheet = workbook.addWorksheet('Data Pesanan');
        orderSheet.columns = [
            { header: 'Tanggal', key: 'createdAt', width: 15 },
            { header: 'Pemesan', key: 'nama_pemesan', width: 20 },
            { header: 'No Telp', key: 'telp_pemesan', width: 15 },
            { header: 'Item', key: 'item', width: 25 },
            { header: 'Total Harga', key: 'harga_total', width: 15, style: { numFmt: '#,##0' } },
            { header: 'Penerima', key: 'nama_penerima', width: 20 },
            { header: 'Alamat', key: 'alamat_pengiriman', width: 30 },
            { header: 'Status Pesanan', key: 'status_pesanan', width: 15 },
            { header: 'Status Bayar', key: 'status_pembayaran', width: 15 },
        ];
        orders.forEach(order => {
            orderSheet.addRow({
                createdAt: order.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
                nama_pemesan: order.nama_pemesan,
                telp_pemesan: order.telp_pemesan,
                item: `${order.jumlah_box} box @ ${order.tipe_box}`,
                harga_total: order.harga_total,
                nama_penerima: order.nama_penerima,
                alamat_pengiriman: order.alamat_pengiriman,
                status_pesanan: order.status_pesanan,
                status_pembayaran: order.status_pembayaran
            });
        });
        orderSheet.getRow(1).font = { bold: true };

        // --- SHEET 3: STOK BAHAN ---
        const bahanSheet = workbook.addWorksheet('Stok Bahan');
        bahanSheet.columns = [
            { header: 'Nama Bahan', key: 'nama', width: 25 },
            { header: 'Sisa Stok', key: 'stok', width: 15 },
            { header: 'Satuan', key: 'satuan', width: 10 },
            { header: 'Modal Dikeluarkan', key: 'modal', width: 20, style: { numFmt: '#,##0' } }
        ];
        bahanList.forEach(item => {
            bahanSheet.addRow({
                nama: item.nama_bahan,
                stok: item.stok,
                satuan: item.satuan,
                modal: item.modal_dikeluarkan
            });
        });
        bahanSheet.getRow(1).font = { bold: true };

        // --- SHEET 4: STOK PACKAGING ---
        const packagingSheet = workbook.addWorksheet('Stok Packaging');
        packagingSheet.columns = [
            { header: 'Nama Packaging', key: 'nama', width: 25 },
            { header: 'Sisa Stok', key: 'stok', width: 15 },
            { header: 'Satuan', key: 'satuan', width: 10 },
            { header: 'Modal Dikeluarkan', key: 'modal', width: 20, style: { numFmt: '#,##0' } }
        ];
        packagingList.forEach(item => {
            packagingSheet.addRow({
                nama: item.nama_packaging,
                stok: item.stok,
                satuan: item.satuan,
                modal: item.modal_dikeluarkan
            });
        });
        packagingSheet.getRow(1).font = { bold: true };

        // --- SHEET 5: INVENTARIS ---
        const assetSheet = workbook.addWorksheet('Inventaris');
        assetSheet.columns = [
            { header: 'Nama Barang', key: 'nama', width: 25 },
            { header: 'Jumlah', key: 'jumlah', width: 10 },
            { header: 'Kondisi', key: 'kondisi', width: 15 },
            { header: 'Modal Dikeluarkan', key: 'modal', width: 20, style: { numFmt: '#,##0' } }
        ];
        assetList.forEach(item => {
            assetSheet.addRow({
                nama: item.nama_barang,
                jumlah: item.jumlah,
                kondisi: item.kondisi,
                modal: item.modal_dikeluarkan
            });
        });
        assetSheet.getRow(1).font = { bold: true };

        // 4. Set Response Header agar browser mendownload file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'Laporan_Lengkap_Sweetorya.xlsx'
        );

        // 5. Tulis workbook ke response
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal generate laporan Excel');
    }
};