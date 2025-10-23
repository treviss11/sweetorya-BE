const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, updateTestimonial, getSummary } = require('../controllers/orderController');

router.get('/summary', getSummary); // Tempatkan summary di atas agar tidak tertangkap oleh /:id
router.get('/', getOrders);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/testimonial', updateTestimonial);

module.exports = router;