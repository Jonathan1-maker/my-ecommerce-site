const express = require('express');
const router = express.Router();
const {
    getProductReviews,
    addReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/product/:id', getProductReviews);
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
