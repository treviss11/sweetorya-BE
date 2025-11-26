const express = require('express');
const router = express.Router();
const { getAllAssets, createAsset, updateAssetKondisi, deleteAsset, updateAsset } = require('../controllers/assetController');

router.get('/', getAllAssets);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.patch('/:id/kondisi', updateAssetKondisi);
router.delete('/:id', deleteAsset);

module.exports = router;