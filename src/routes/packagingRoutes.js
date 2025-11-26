const express = require('express');
const router = express.Router();
const { getAllPackaging, createPackaging, updatePackagingStock, updatePackaging, deletePackaging } = require('../controllers/packagingController');

router.get('/', getAllPackaging);
router.post('/', createPackaging);
router.patch('/:id/stock', updatePackagingStock);
router.put('/:id', updatePackaging); 
router.delete('/:id', deletePackaging);

module.exports = router;