const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    updateUserRole,
    deleteUser,
    createCategory,
    updateCategory,
    deleteCategory,
    createAdmin
} = require('../controllers/adminController');
const {
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users management
router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.post('/create-admin', createAdmin);

// Orders management
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);

// Categories management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
