// Authentication Manager
class AuthManager {
    static isLoggedIn() {
        return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    static getUser() {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    static setAuth(token, user) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    static clearAuth() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }

    static async login(email, password) {
        try {
            const response = await API.login({ email, password });
            this.setAuth(response.data.token, response.data.user);
            Toast.success('Login successful!');
            return response.data.user;
        } catch (error) {
            Toast.error(error.message || 'Login failed');
            throw error;
        }
    }

    static async register(name, email, password) {
        try {
            const response = await API.register({ name, email, password });
            this.setAuth(response.data.token, response.data.user);
            Toast.success('Registration successful!');
            return response.data.user;
        } catch (error) {
            Toast.error(error.message || 'Registration failed');
            throw error;
        }
    }

    static logout() {
        this.clearAuth();
        Toast.success('Logged out successfully');
        window.location.href = 'index.html';
    }

    static getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    static updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        if (!loginBtn) return;

        const user = this.getUser();

        if (this.isLoggedIn() && user) {
            loginBtn.textContent = user.name.split(' ')[0];
            loginBtn.onclick = () => {
                window.location.href = 'account.html';
            };

            // If user is admin, add an Admin Panel link
            if (user.role === 'admin') {
                const navActions = loginBtn.parentElement;
                if (!document.getElementById('adminLink')) {
                    const adminBtn = document.createElement('button');
                    adminBtn.id = 'adminLink';
                    adminBtn.className = 'btn btn-outline';
                    adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
                    adminBtn.onclick = () => window.location.href = 'admin/dashboard.html';
                    navActions.insertBefore(adminBtn, loginBtn);
                }
            }
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => {
                window.location.href = 'login.html';
            };
        }
    }
}

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.updateUI();
});
