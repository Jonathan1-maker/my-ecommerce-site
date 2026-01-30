const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrder,
    confirmOrderReceipt
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/confirm', confirmOrderReceipt);

module.exports = router;
