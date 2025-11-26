const express = require('express');
const router = express.Router();
const { getAllBahan, createBahan, updateBahanStock, updateBahan, deleteBahan } = require('../controllers/bahanController');

router.get('/', getAllBahan);
router.post('/', createBahan);
router.patch('/:id/stock', updateBahanStock);
router.put('/:id', updateBahan); 
router.delete('/:id', deleteBahan);

module.exports = router;