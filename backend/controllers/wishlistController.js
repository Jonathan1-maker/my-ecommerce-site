const db = require('../config/database');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        const [wishlistItems] = await db.query(
            `SELECT w.*, p.name, p.price, p.image, p.stock, p.rating
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             WHERE w.user_id = ?`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            count: wishlistItems.length,
            data: wishlistItems
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
    try {
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists
        const [products] = await db.query('SELECT id FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already in wishlist
        const [existing] = await db.query(
            'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        await db.query(
            'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
            [req.user.id, product_id]
        );

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM wishlist WHERE product_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in wishlist'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
