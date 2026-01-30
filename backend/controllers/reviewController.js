const db = require('../config/database');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:id
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const [reviews] = await db.query(
            `SELECT r.*, u.name as user_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = ? 
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { product_id, rating, comment } = req.body;

        if (!product_id || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Please provide product ID and rating'
            });
        }

        await connection.beginTransaction();

        // Check if user already reviewed this product
        const [existing] = await connection.query(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Add review
        await connection.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
            [req.user.id, product_id, rating, comment]
        );

        // Update product rating and reviews_count
        const [reviews] = await connection.query(
            'SELECT rating FROM reviews WHERE product_id = ?',
            [product_id]
        );

        const count = reviews.length;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / count;

        await connection.query(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
            [avgRating.toFixed(1), count, product_id]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Review added successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    } finally {
        connection.release();
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    const connection = await db.getConnection();
    try {
        // Get review to know product_id
        const [reviews] = await connection.query(
            'SELECT * FROM reviews WHERE id = ?',
            [req.params.id]
        );

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const review = reviews[0];

        // Check ownership or admin
        if (review.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await connection.beginTransaction();

        await connection.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);

        // Update product rating and reviews_count
        const [remainingReviews] = await connection.query(
            'SELECT rating FROM reviews WHERE product_id = ?',
            [review.product_id]
        );

        const count = remainingReviews.length;
        const avgRating = count > 0 ? (remainingReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;

        await connection.query(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
            [avgRating, count, review.product_id]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Review deleted'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    } finally {
        connection.release();
    }
};
