// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { downloadFullReport } = require('../controllers/reportController');

router.get('/download', downloadFullReport);

module.exports = router;