// API Configuration
const API_CONFIG = {
    BASE_URL: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api',
    ENDPOINTS: {
        // Auth
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        ME: '/auth/me',
        UPDATE_PROFILE: '/auth/profile',

        // Products
        PRODUCTS: '/products',
        PRODUCT: (id) => `/products/${id}`,
        CATEGORIES: '/products/categories',

        // Cart
        CART: '/cart',
        CART_ITEM: (id) => `/cart/${id}`,

        // Orders
        ORDERS: '/orders',
        ORDER: (id) => `/orders/${id}`,
        CONFIRM_ORDER: (id) => `/orders/${id}/confirm`,

        // Addresses
        ADDRESSES: '/addresses',
        ADDRESS: (id) => `/addresses/${id}`,

        // Admin
        ADMIN_DASHBOARD: '/admin/dashboard',
        ADMIN_USERS: '/admin/users',
        ADMIN_ORDERS: '/admin/orders',
        ADMIN_CATEGORIES: '/admin/categories',
        ADMIN_CREATE_ADMIN: '/admin/create-admin',
        ADMIN_USER: (id) => `/admin/users/${id}`,

        // Wishlist
        WISHLIST: '/wishlist',
        WISHLIST_ITEM: (id) => `/wishlist/${id}`,

        // Reviews
        REVIEWS: '/reviews',
        PRODUCT_REVIEWS: (id) => `/reviews/product/${id}`,
        CONTACT: '/contact'
    }
};

// Local Storage Keys
const STORAGE_KEYS = {
    TOKEN: 'eshop_token',
    USER: 'eshop_user',
    CART: 'eshop_cart'
};
