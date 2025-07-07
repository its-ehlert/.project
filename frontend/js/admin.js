// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadDashboardData();
    }

    // Check if user is authenticated as admin
    checkAuth() {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            window.location.href = 'admin-login.html';
            return;
        }
        // Accept the hardcoded token for JS-only login
        if (adminToken === 'fake-admin-token') {
            this.currentUser = {
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                firstName: 'Admin',
                lastName: '',
                avatar: ''
            };
            this.updateAdminInfo();
        } else {
            // Verify admin token with backend for real tokens
            this.verifyAdminToken(adminToken);
        }
    }

    // Verify admin authentication token
    async verifyAdminToken(token) {
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid admin token');
            }

            const data = await response.json();
            this.currentUser = data.admin;
            this.updateAdminInfo();
        } catch (error) {
            console.error('Admin verification failed:', error);
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        }
    }

    // Update admin user info in header
    updateAdminInfo() {
        const adminName = document.getElementById('adminName');
        const adminRole = document.getElementById('adminRole');
        const adminAvatar = document.getElementById('adminAvatar');

        if (this.currentUser) {
            adminName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            adminRole.textContent = this.currentUser.role;
            if (this.currentUser.avatar) {
                adminAvatar.src = this.currentUser.avatar;
            }
        }
    }

    // Bind event listeners
    bindEvents() {
        // Navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.closest('.admin-nav-link').dataset.tab);
            });
        });

        // Search functionality
        const adminSearch = document.getElementById('adminSearch');
        if (adminSearch) {
            adminSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Logout
        const logoutBtn = document.getElementById('adminLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal').id);
            });
        });

        // Form submissions
        this.bindFormEvents();
    }

    // Switch between admin tabs
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to nav link
        const selectedLink = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedLink) {
            selectedLink.classList.add('active');
        }

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    // Load data for specific tab
    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'books':
                this.loadBooks();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'categories':
                this.loadCategories();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    // Load dashboard statistics and recent data
    async loadDashboardData() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load dashboard data');

            const data = await response.json();
            this.updateDashboardStats(data.stats);
            this.updateRecentOrders(data.recentOrders);
            this.updateRecentUsers(data.recentUsers);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        } finally {
            this.hideLoading();
        }
    }

    // Update dashboard statistics
    updateDashboardStats(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('totalBooks').textContent = stats.totalBooks.toLocaleString();
        document.getElementById('totalOrders').textContent = stats.totalOrders.toLocaleString();
        document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue.toLocaleString()}`;
    }

    // Update recent orders section
    updateRecentOrders(orders) {
        const container = document.getElementById('recentOrders');
        if (!container) return;

        container.innerHTML = orders.map(order => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>Order #${order.id}</h4>
                    <p>${order.customerName} • $${order.total}</p>
                </div>
                <span class="status-badge ${order.status}">${order.status}</span>
            </div>
        `).join('');
    }

    // Update recent users section
    updateRecentUsers(users) {
        const container = document.getElementById('recentUsers');
        if (!container) return;

        container.innerHTML = users.map(user => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${user.firstName} ${user.lastName}</h4>
                    <p>${user.email}</p>
                </div>
                <span class="status-badge ${user.status}">${user.status}</span>
            </div>
        `).join('');
    }

    // Load users for user management
    async loadUsers() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load users');

            const users = await response.json();
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        } finally {
            this.hideLoading();
        }
    }

    // Render users table
    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <img src="${user.avatar || '../images/default-avatar.jpg'}" alt="${user.firstName}" class="user-avatar">
                        <div>
                            <div>${user.firstName} ${user.lastName}</div>
                            <small>${user.email}</small>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit" onclick="adminPanel.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Load books for book management
    async loadBooks() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/books', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load books');

            const books = await response.json();
            this.renderBooksTable(books);
        } catch (error) {
            console.error('Error loading books:', error);
            this.showError('Failed to load books');
        } finally {
            this.hideLoading();
        }
    }

    // Render books table
    renderBooksTable(books) {
        const tbody = document.getElementById('booksTableBody');
        if (!tbody) return;

        tbody.innerHTML = books.map(book => `
            <tr>
                <td>
                    <div class="book-info">
                        <img src="${book.coverImage || '../images/default-book.jpg'}" alt="${book.title}" class="book-cover">
                        <div>
                            <div>${book.title}</div>
                            <small>ISBN: ${book.isbn}</small>
                        </div>
                    </div>
                </td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>$${book.price}</td>
                <td>${book.stock}</td>
                <td><span class="status-badge ${book.status}">${book.status}</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit" onclick="adminPanel.editBook('${book.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteBook('${book.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Load orders for order management
    async loadOrders() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load orders');

            const orders = await response.json();
            this.renderOrdersTable(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showError('Failed to load orders');
        } finally {
            this.hideLoading();
        }
    }

    // Render orders table
    renderOrdersTable(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>${order.items.length} items</td>
                <td>$${order.total}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit" onclick="adminPanel.viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="adminPanel.updateOrderStatus('${order.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Load categories
    async loadCategories() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load categories');

            const categories = await response.json();
            this.renderCategoriesGrid(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Failed to load categories');
        } finally {
            this.hideLoading();
        }
    }

    // Render categories grid
    renderCategoriesGrid(categories) {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <div class="category-card">
                <div class="category-icon">
                    <i class="fas fa-tag"></i>
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                    <span class="category-count">${category.bookCount} books</span>
                </div>
                <div class="category-actions">
                    <button class="action-btn edit" onclick="adminPanel.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="adminPanel.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Load reports
    async loadReports() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/reports', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load reports');

            const reports = await response.json();
            this.renderReports(reports);
        } catch (error) {
            console.error('Error loading reports:', error);
            this.showError('Failed to load reports');
        } finally {
            this.hideLoading();
        }
    }

    // Render reports
    renderReports(reports) {
        // Implementation for charts and reports
        console.log('Reports data:', reports);
    }

    // Show add user modal
    showAddUserModal() {
        document.getElementById('addUserModal').classList.add('active');
    }

    // Show add book modal
    showAddBookModal() {
        document.getElementById('addBookModal').classList.add('active');
    }

    // Show add category modal
    showAddCategoryModal() {
        // Implementation for category modal
        console.log('Show add category modal');
    }

    // Close modal
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Bind form events
    bindFormEvents() {
        // Add user form
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser(new FormData(addUserForm));
            });
        }

        // Add book form
        const addBookForm = document.getElementById('addBookForm');
        if (addBookForm) {
            addBookForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBook(new FormData(addBookForm));
            });
        }
    }

    // Add new user
    async addUser(formData) {
        try {
            this.showLoading();
            // Convert FormData to a plain object
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to add user');
            }

            this.showSuccess('User added successfully');
            this.closeModal('addUserModal');
            this.loadUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            this.showError(error.message || 'Failed to add user');
        } finally {
            this.hideLoading();
        }
    }

    // Add new book
    async addBook(formData) {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/books', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to add book');
            }

            this.showSuccess('Book added successfully');
            this.closeModal('addBookModal');
            this.loadBooks();
        } catch (error) {
            console.error('Error adding book:', error);
            this.showError(error.message || 'Failed to add book');
        } finally {
            this.hideLoading();
        }
    }

    // Edit user
    editUser(userId) {
        console.log('Edit user:', userId);
        // Implementation for editing user
    }

    // Delete user
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            this.showLoading();
            
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');

            this.showSuccess('User deleted successfully');
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Failed to delete user');
        } finally {
            this.hideLoading();
        }
    }

    // Edit book
    editBook(bookId) {
        console.log('Edit book:', bookId);
        // Implementation for editing book
    }

    // Delete book
    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            this.showLoading();
            
            const response = await fetch(`/api/admin/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete book');

            this.showSuccess('Book deleted successfully');
            this.loadBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            this.showError('Failed to delete book');
        } finally {
            this.hideLoading();
        }
    }

    // View order details
    viewOrder(orderId) {
        console.log('View order:', orderId);
        // Implementation for viewing order details
    }

    // Update order status
    updateOrderStatus(orderId) {
        console.log('Update order status:', orderId);
        // Implementation for updating order status
    }

    // Handle global search
    handleGlobalSearch(query) {
        console.log('Global search:', query);
        // Implementation for global search
    }

    // Logout admin
    logout() {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }

    // Show loading spinner
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    // Hide loading spinner
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    // Show success message
    showSuccess(message) {
        // Implementation for success notification
        console.log('Success:', message);
    }

    // Show error message
    showError(message) {
        // Implementation for error notification
        console.error('Error:', message);
    }
}

// Admin login functionality
class AdminAuth {
    constructor() {
        this.errorContainer = null;
        this.bindEvents();
    }

    bindEvents() {
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            // Insert error container above the form if not present
            if (!document.getElementById('adminLoginError')) {
                this.errorContainer = document.createElement('div');
                this.errorContainer.id = 'adminLoginError';
                this.errorContainer.style.display = 'none';
                this.errorContainer.className = 'notification notification-error';
                loginForm.parentNode.insertBefore(this.errorContainer, loginForm);
            } else {
                this.errorContainer = document.getElementById('adminLoginError');
            }
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login(new FormData(loginForm));
            });
        }

        // Password toggle
        const passwordToggle = document.getElementById('passwordToggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                this.togglePassword();
            });
        }
    }

    async login(formData) {
        try {
            this.showLoading();
            this.showError(''); // Clear previous error
            // Hardcoded admin credentials
            const username = formData.get('username');
            const password = formData.get('password');
            if (username === 'admin' && password === 'admin123') {
                // Store a fake token
                localStorage.setItem('adminToken', 'fake-admin-token');
                window.location.href = 'admin-dashboard.html';
            } else {
                throw new Error('Invalid username or password');
            }
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Invalid username or password');
        } finally {
            this.hideLoading();
        }
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('passwordToggle');
        const icon = toggleBtn.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    showError(message) {
        if (this.errorContainer) {
            if (message) {
                this.errorContainer.textContent = message;
                this.errorContainer.style.display = 'block';
            } else {
                this.errorContainer.textContent = '';
                this.errorContainer.style.display = 'none';
            }
        } else {
            // fallback to console
            if (message) console.error('Error:', message);
        }
    }
}

// Initialize admin functionality
let adminPanel;
let adminAuth;

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on admin login page or dashboard
    if (window.location.pathname.includes('admin-login.html')) {
        adminAuth = new AdminAuth();
    } else if (window.location.pathname.includes('admin-dashboard.html')) {
        adminPanel = new AdminPanel();
    }
});

// Global functions for modal operations
function showAddUserModal() {
    if (adminPanel) adminPanel.showAddUserModal();
}

function showAddBookModal() {
    if (adminPanel) adminPanel.showAddBookModal();
}

function showAddCategoryModal() {
    if (adminPanel) adminPanel.showAddCategoryModal();
}

function closeModal(modalId) {
    if (adminPanel) adminPanel.closeModal(modalId);
} 