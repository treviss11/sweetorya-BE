const express = require('express');
const router = express.Router();
const { getAllAssets, createAsset, updateAssetKondisi, deleteAsset } = require('../controllers/assetController');

router.get('/', getAllAssets);
router.post('/', createAsset);
router.patch('/:id/kondisi', updateAssetKondisi);
router.delete('/:id', deleteAsset);

module.exports = router;