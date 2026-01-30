document.addEventListener('DOMContentLoaded', async () => {
    // Ensure only admin can access
    if (!AuthManager.isLoggedIn() || AuthManager.getUser().role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }

    // Back to store logic
    const backBtn = document.getElementById('backToStore');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    await loadDashboardStats();
    await loadAdmins();
});

function openAddProduct() {
    window.location.href = 'products.html?action=add';
}

async function loadAdmins() {
    try {
        const response = await API.getUsers({ role: 'admin' });
        const admins = response.data;
        const currentUser = AuthManager.getUser();

        // Find the "Super Admin" (the admin with the lowest ID)
        const superAdminId = Math.min(...admins.map(a => Number(a.id)));
        const isAdminSuper = currentUser && currentUser.id == superAdminId;

        console.log('Dashboard Debug:', { currentUser, admins, isAdminSuper, superAdminId });

        const adminsBody = document.getElementById('adminsTableBody');
        if (adminsBody) {
            adminsBody.innerHTML = admins.map(admin => `
                <tr>
                    <td>${admin.name} ${admin.id == superAdminId ? '<span class="admin-badge" style="background: var(--primary-blue); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 5px;">SUPER</span>' : ''}</td>
                    <td>${admin.email}</td>
                    <td>
                        ${isAdminSuper && admin.id != superAdminId ? `
                            <button class="btn btn-danger btn-sm" onclick="deleteAdmin(${admin.id}, '${admin.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : (admin.id == superAdminId ? '<small class="text-muted" title="You cannot delete yourself or the primary admin">Protected</small>' : '-')}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading admins:', error);
    }
}

async function deleteAdmin(id, name) {
    console.log('Attempting to delete admin:', { id, name });
    if (!confirm(`Are you sure you want to remove ${name} from administrators?`)) return;

    try {
        const response = await API.deleteUser(id);
        if (response.success) {
            Toast.success('Administrator removed');
            await loadAdmins();
            await loadDashboardStats(); // Refresh user count
        } else {
            Toast.error(response.message || 'Failed to remove admin');
        }
    } catch (error) {
        console.error('Error deleting admin:', error);
        Toast.error(error.message || 'An error occurred');
    }
}

async function loadDashboardStats() {
    try {
        const response = await API.getDashboardStats();
        const { overview, recent_orders } = response.data;

        const revEl = document.getElementById('totalRevenue');
        if (revEl) revEl.textContent = Utils.formatPrice(overview.total_revenue);

        const ordEl = document.getElementById('totalOrders');
        if (ordEl) ordEl.textContent = overview.total_orders;

        const usrEl = document.getElementById('totalUsers');
        if (usrEl) usrEl.textContent = overview.total_users;

        const pendEl = document.getElementById('pendingOrders');
        if (pendEl) pendEl.textContent = overview.pending_orders;

        const recentBody = document.getElementById('recentOrdersBody');
        if (recentBody) {
            recentBody.innerHTML = recent_orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.user_name}</td>
                    <td>${Utils.formatPrice(order.total)}</td>
                    <td><span style="color: ${getStatusColor(order.status)}">${order.status.toUpperCase()}</span></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Don't show toast on load failure to avoid annoyance, or use silent error
    }
}

function getStatusColor(status) {
    const colors = { 'pending': '#f59e0b', 'delivered': '#10b981', 'cancelled': '#ef4444' };
    return colors[status] || '#6b7280';
}

function openAddAdmin() {
    const modal = document.getElementById('addAdminModal');
    if (modal) modal.style.display = 'flex';
}

function closeAddAdmin() {
    const modal = document.getElementById('addAdminModal');
    if (modal) modal.style.display = 'none';
}

async function submitAddAdmin(e) {
    e.preventDefault();
    const nameInput = document.getElementById('adminName');
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');

    if (!nameInput || !emailInput || !passwordInput) return;

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const response = await API.createAdmin({ name, email, password });

        if (response.success) {
            alert('Admin created successfully!');
            closeAddAdmin();
            const form = document.getElementById('addAdminForm');
            if (form) form.reset();
            await loadAdmins();
        } else {
            alert(response.message || 'Failed to create admin');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
        alert(error.message || 'An error occurred');
    }
}

// Expose functions to global scope for HTML event handlers
window.openAddProduct = openAddProduct;
window.openAddAdmin = openAddAdmin;
window.closeAddAdmin = closeAddAdmin;
window.submitAddAdmin = submitAddAdmin;
window.deleteAdmin = deleteAdmin;

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('addAdminModal');
    if (modal && event.target == modal) {
        modal.style.display = "none";
    }
};
