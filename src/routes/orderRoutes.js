const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, updateTestimonial, getSummary, getSuggestions, getOrderById, updateOrder, deleteOrder } = require('../controllers/orderController');

router.get('/summary', getSummary);
router.get('/suggestions', getSuggestions); 
router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById); 
router.put('/:id', updateOrder); 
router.delete('/:id', deleteOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/testimonial', updateTestimonial);

module.exports = router;