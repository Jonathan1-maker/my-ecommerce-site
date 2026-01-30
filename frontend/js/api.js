// API Helper Functions
class API {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Auth APIs
    static async register(userData) {
        return this.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
    }

    static async login(credentials) {
        return this.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
    }

    static async getMe() {
        return this.get(API_CONFIG.ENDPOINTS.ME);
    }

    static async updateProfile(userData) {
        return this.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, userData);
    }

    // Product APIs
    static async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}${queryString ? '?' + queryString : ''}`);
    }

    static async getProduct(id) {
        return this.get(API_CONFIG.ENDPOINTS.PRODUCT(id));
    }

    static async getCategories() {
        return this.get(API_CONFIG.ENDPOINTS.CATEGORIES);
    }

    static async createCategory(categoryData) {
        return this.post(API_CONFIG.ENDPOINTS.CATEGORIES, categoryData);
    }

    // Cart APIs
    static async getCart() {
        return this.get(API_CONFIG.ENDPOINTS.CART);
    }

    static async addToCart(productId, quantity = 1) {
        return this.post(API_CONFIG.ENDPOINTS.CART, { product_id: productId, quantity });
    }

    static async updateCartItem(itemId, quantity) {
        return this.put(API_CONFIG.ENDPOINTS.CART_ITEM(itemId), { quantity });
    }

    static async removeFromCart(itemId) {
        return this.delete(API_CONFIG.ENDPOINTS.CART_ITEM(itemId));
    }

    static async clearCart() {
        return this.delete(API_CONFIG.ENDPOINTS.CART);
    }

    // Order APIs
    static async createOrder(orderData) {
        return this.post(API_CONFIG.ENDPOINTS.ORDERS, orderData);
    }

    static async getOrders() {
        return this.get(API_CONFIG.ENDPOINTS.ORDERS);
    }

    static async getOrder(id) {
        return this.get(API_CONFIG.ENDPOINTS.ORDER(id));
    }

    static async confirmOrder(id) {
        return this.put(API_CONFIG.ENDPOINTS.CONFIRM_ORDER(id), {});
    }

    // Address APIs
    static async getAddresses() {
        return this.get(API_CONFIG.ENDPOINTS.ADDRESSES);
    }

    static async addAddress(addressData) {
        return this.post(API_CONFIG.ENDPOINTS.ADDRESSES, addressData);
    }

    static async updateAddress(id, addressData) {
        return this.put(API_CONFIG.ENDPOINTS.ADDRESS(id), addressData);
    }

    static async deleteAddress(id) {
        return this.delete(API_CONFIG.ENDPOINTS.ADDRESS(id));
    }

    static async setDefaultAddress(id) {
        return this.put(`${API_CONFIG.ENDPOINTS.ADDRESS(id)}/default`, {});
    }

    // Admin APIs
    static async getDashboardStats() {
        return this.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
    }

    static async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}${queryString ? '?' + queryString : ''}`);
    }

    static async getAllOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`${API_CONFIG.ENDPOINTS.ADMIN_ORDERS}${queryString ? '?' + queryString : ''}`);
    }

    static async createAdmin(adminData) {
        return this.post(API_CONFIG.ENDPOINTS.ADMIN_CREATE_ADMIN, adminData);
    }

    static async deleteUser(userId) {
        return this.delete(API_CONFIG.ENDPOINTS.ADMIN_USER(userId));
    }

    // Wishlist APIs
    static async getWishlist() {
        return this.get(API_CONFIG.ENDPOINTS.WISHLIST);
    }

    static async addToWishlist(productId) {
        return this.post(API_CONFIG.ENDPOINTS.WISHLIST, { product_id: productId });
    }

    static async removeFromWishlist(productId) {
        return this.delete(API_CONFIG.ENDPOINTS.WISHLIST_ITEM(productId));
    }

    // Review APIs
    static async getProductReviews(productId) {
        return this.get(API_CONFIG.ENDPOINTS.PRODUCT_REVIEWS(productId));
    }

    static async addReview(reviewData) {
        return this.post(API_CONFIG.ENDPOINTS.REVIEWS, reviewData);
    }

    static async submitContactForm(contactData) {
        return this.post(API_CONFIG.ENDPOINTS.CONTACT, contactData);
    }
}

// Toast Notification Helper
class Toast {
    static show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" style="font-size: 1.5rem; color: var(--${type === 'success' ? 'success' : 'error'});"></i>
                <div>
                    <strong>${type === 'success' ? 'Success' : 'Error'}</strong>
                    <p style="margin: 0; color: var(--gray-600);">${message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }
}

// Utility Functions
const Utils = {
    formatPrice(price) {
        return `$${parseFloat(price).toFixed(2)}`;
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
