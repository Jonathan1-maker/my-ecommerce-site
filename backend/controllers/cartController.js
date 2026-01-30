const db = require('../config/database');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const [cartItems] = await db.query(
            `SELECT c.*, p.name, p.price, p.image, p.stock,
                    (c.quantity * p.price) as subtotal
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [req.user.id]
        );

        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.status(200).json({
            success: true,
            count: cartItems.length,
            total: total.toFixed(2),
            data: cartItems
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists and has stock
        const [products] = await db.query(
            'SELECT id, stock FROM products WHERE id = ?',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (products[0].stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Check if item already in cart
        const [existingItems] = await db.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existingItems.length > 0) {
            // Update quantity
            const newQuantity = existingItems[0].quantity + parseInt(quantity);

            if (products[0].stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock'
                });
            }

            await db.query(
                'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
                [newQuantity, req.user.id, product_id]
            );
        } else {
            // Add new item
            await db.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, product_id, quantity]
            );
        }

        // Get updated cart
        const [cartItems] = await db.query(
            `SELECT c.*, p.name, p.price, p.image, p.stock,
                    (c.quantity * p.price) as subtotal
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [req.user.id]
        );

        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            count: cartItems.length,
            total: total.toFixed(2),
            data: cartItems
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        // Get cart item
        const [cartItems] = await db.query(
            'SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?',
            [req.params.id, req.user.id]
        );

        if (cartItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        if (cartItems[0].stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        await db.query(
            'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.id, req.user.id]
        );

        // Get updated cart
        const [updatedCart] = await db.query(
            `SELECT c.*, p.name, p.price, p.image, p.stock,
                    (c.quantity * p.price) as subtotal
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [req.user.id]
        );

        const total = updatedCart.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            count: updatedCart.length,
            total: total.toFixed(2),
            data: updatedCart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM cart WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Get updated cart
        const [cartItems] = await db.query(
            `SELECT c.*, p.name, p.price, p.image, p.stock,
                    (c.quantity * p.price) as subtotal
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [req.user.id]
        );

        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            count: cartItems.length,
            total: total.toFixed(2),
            data: cartItems
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        res.status(200).json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
