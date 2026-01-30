const db = require('../config/database');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let { address_id, shipping_info, payment_method, items } = req.body;

        if ((!address_id && !shipping_info) || !payment_method || !items || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Please provide address/shipping info, payment method, and items'
            });
        }

        // Create address if shipping_info provided
        if (!address_id && shipping_info) {
            const { full_name, address_line1, city, zip_code, country } = shipping_info;
            const [addressResult] = await connection.query(
                'INSERT INTO addresses (user_id, full_name, address_line1, city, zip_code, country) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.id, full_name, address_line1, city, zip_code, country]
            );
            address_id = addressResult.insertId;
        }

        // Validate payment method
        const validPaymentMethods = ['cod', 'stripe', 'paypal'];
        if (!validPaymentMethods.includes(payment_method)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        // Calculate totals and validate stock
        let subtotal = 0;
        for (const item of items) {
            const [products] = await connection.query(
                'SELECT price, stock FROM products WHERE id = ?',
                [item.product_id]
            );

            if (products.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }

            if (products[0].stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ${item.product_id}`
                });
            }

            subtotal += products[0].price * item.quantity;
        }

        const shipping = subtotal > 100 ? 0 : 10;
        const total = subtotal + shipping;

        // Create order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, address_id, payment_method, subtotal, shipping, total, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, address_id, payment_method, subtotal, shipping, total, payment_method === 'cod' ? 'pending' : 'pending']
        );

        const orderId = orderResult.insertId;

        // Create order items and update stock
        for (const item of items) {
            const [products] = await connection.query(
                'SELECT price FROM products WHERE id = ?',
                [item.product_id]
            );

            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, products[0].price]
            );

            // Update product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Clear user's cart
        await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        await connection.commit();

        // Get created order with details
        const [orders] = await connection.query(
            `SELECT o.*, a.full_name, a.address_line1, a.city, a.zip_code, a.country
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.id = ?`,
            [orderId]
        );

        const [orderItems] = await connection.query(
            `SELECT oi.*, p.name, p.image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: orders[0],
                items: orderItems
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    } finally {
        connection.release();
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, a.full_name, a.address_line1, a.city
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.user_id = ?
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        // Get items for each order
        for (const order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, p.name, p.image
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, a.full_name, a.address_line1, a.address_line2, a.city, a.state, a.zip_code, a.country
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.id = ? AND o.user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const [items] = await db.query(
            `SELECT oi.*, p.name, p.image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [req.params.id]
        );

        res.status(200).json({
            success: true,
            data: {
                order: orders[0],
                items
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = `
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        // Get total count
        const [countResult] = await db.query(
            query.replace('o.*, u.name as user_name, u.email as user_email', 'COUNT(*) as total'),
            params
        );
        const total = countResult[0].total;

        // Add pagination
        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        const [orders] = await db.query(query, params);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Confirm order receipt (User)
// @route   PUT /api/orders/:id/confirm
// @access  Private
exports.confirmOrderReceipt = async (req, res) => {
    try {
        // Check if order exists and belongs to user
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orders[0];

        // Check if order can be confirmed (must be shipped or processing)
        if (order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Order has already been confirmed as delivered'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot confirm a cancelled order'
            });
        }

        // Update order status to delivered and payment status to completed
        await db.query(
            `UPDATE orders SET status = 'delivered', payment_status = 'completed' WHERE id = ?`,
            [req.params.id]
        );

        // Get updated order
        const [updatedOrders] = await db.query(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            success: true,
            message: 'Order confirmed as delivered. Thank you for shopping with us!',
            data: updatedOrders[0]
        });
    } catch (error) {
        console.error('Confirm order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, tracking_number } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updates = {};
        if (status) updates.status = status;
        if (tracking_number) updates.tracking_number = tracking_number;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE orders SET ${setClause} WHERE id = ?`, values);

        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: orders[0]
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
