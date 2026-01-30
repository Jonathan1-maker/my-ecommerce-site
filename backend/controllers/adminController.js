const db = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Total revenue
        const [revenueResult] = await db.query(
            `SELECT SUM(total) as total_revenue, COUNT(*) as total_orders
             FROM orders
             WHERE payment_status = 'completed'`
        );

        // Total users
        const [usersResult] = await db.query(
            'SELECT COUNT(*) as total_users FROM users WHERE role = "user"'
        );

        // Total products
        const [productsResult] = await db.query(
            'SELECT COUNT(*) as total_products FROM products'
        );

        // Pending orders
        const [pendingResult] = await db.query(
            'SELECT COUNT(*) as pending_orders FROM orders WHERE status = "pending"'
        );

        // Recent orders
        const [recentOrders] = await db.query(
            `SELECT o.*, u.name as user_name, u.email as user_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC
             LIMIT 10`
        );

        // Sales by month (last 6 months)
        const [monthlySales] = await db.query(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(total) as revenue,
                COUNT(*) as orders
             FROM orders
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             AND payment_status = 'completed'
             GROUP BY DATE_FORMAT(created_at, '%Y-%m')
             ORDER BY month DESC`
        );

        // Top selling products
        const [topProducts] = await db.query(
            `SELECT p.id, p.name, p.price, p.image,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * oi.price) as revenue
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.payment_status = 'completed'
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT 5`
        );

        // Low stock products
        const [lowStock] = await db.query(
            'SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 10'
        );

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    total_revenue: parseFloat(revenueResult[0].total_revenue || 0).toFixed(2),
                    total_orders: revenueResult[0].total_orders || 0,
                    total_users: usersResult[0].total_users || 0,
                    total_products: productsResult[0].total_products || 0,
                    pending_orders: pendingResult[0].pending_orders || 0
                },
                recent_orders: recentOrders,
                monthly_sales: monthlySales,
                top_products: topProducts,
                low_stock: lowStock
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role } = req.query;

        // Base query
        let query = 'FROM users';
        const params = [];

        // Add filter if role is provided
        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }

        // Get total count
        const [countResult] = await db.query(`SELECT COUNT(*) as total ${query}`, params);
        const total = countResult[0].total;

        // Get users
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const [users] = await db.query(
            `SELECT id, name, email, role, phone, created_at
             ${query}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);

        const [users] = await db.query(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User role updated',
            data: users[0]
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const targetId = Number(req.params.id);
        const requesterId = Number(req.user.id);

        // Prevent deleting yourself
        if (targetId === requesterId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Check target user role
        const [targetUser] = await db.query('SELECT role FROM users WHERE id = ?', [targetId]);

        if (targetUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Delete Request Debug:', { targetId, requesterId, targetRole: targetUser[0].role });

        // Find the actual Super Admin (admin with the lowest ID)
        const [admins] = await db.query('SELECT id FROM users WHERE role = "admin" ORDER BY id ASC LIMIT 1');
        const superAdminId = admins[0].id;

        // If target is admin, only the Super Admin can delete
        if (targetUser[0].role === 'admin' && requesterId != superAdminId) {
            return res.status(403).json({
                success: false,
                message: 'Only the Primary Administrator can delete other admins'
            });
        }

        const [result] = await db.query('DELETE FROM users WHERE id = ?', [targetId]);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create category (Admin)
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const [result] = await db.query(
            'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
            [name, description, image]
        );

        const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: categories[0]
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update category (Admin)
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (image) updates.image = image;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE categories SET ${setClause} WHERE id = ?`, values);

        const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: categories[0]
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create new admin
// @route   POST /api/admin/create-admin
// @access  Private/Admin
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with role 'admin'
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'admin']
        );

        res.status(201).json({
            success: true,
            message: 'New admin created successfully',
            data: { id: result.insertId, name, email, role: 'admin' }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
