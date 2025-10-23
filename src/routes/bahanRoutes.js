const express = require('express');
const router = express.Router();
const { getAllBahan, createBahan, updateBahanStock } = require('../controllers/bahanController');

router.get('/', getAllBahan);
router.post('/', createBahan);
router.patch('/:id/stock', updateBahanStock);

module.exports = router;