const express = require('express');
const router = express.Router();
const { getAllPackaging, createPackaging, updatePackagingStock } = require('../controllers/packagingController');

router.get('/', getAllPackaging);
router.post('/', createPackaging);
router.patch('/:id/stock', updatePackagingStock);

module.exports = router;