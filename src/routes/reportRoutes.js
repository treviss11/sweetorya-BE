// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { downloadFullReport } = require('../controllers/reportController');
const { getMonthlyProfit } = require('../controllers/reportController');

router.get('/download', downloadFullReport);
router.get('/monthly', getMonthlyProfit);

module.exports = router;