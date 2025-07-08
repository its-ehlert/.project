// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentMode = 'api'; // 'api' or 'localStorage'
        this.currentBookIndex = null;
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

    // Switch between API and localStorage modes
    switchToLocalStorageMode() {
        this.currentMode = 'localStorage';
        this.showSuccess('Switched to Local Storage mode');
        this.loadBooks(); // Reload books from localStorage
    }

    switchToApiMode() {
        this.currentMode = 'api';
        this.showSuccess('Switched to API mode');
        this.loadBooks(); // Reload books from API
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

        // Book search
        const bookSearch = document.getElementById('bookSearch');
        if (bookSearch) {
            bookSearch.addEventListener('input', (e) => {
                this.handleBookSearch(e.target.value);
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
            
            if (this.currentMode === 'api') {
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
            } else {
                // Use localStorage data for dashboard
                this.updateDashboardStatsFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
            // Fallback to localStorage
            this.updateDashboardStatsFromLocalStorage();
        } finally {
            this.hideLoading();
        }
    }

    // Update dashboard statistics from localStorage
    updateDashboardStatsFromLocalStorage() {
        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        const totalBooks = books.length;
        const favoriteBooks = books.filter(book => book.favorite).length;
        const readBooks = books.filter(book => book.read).length;

        document.getElementById('totalUsers').textContent = '1'; // Placeholder
        document.getElementById('totalBooks').textContent = totalBooks.toString();
        document.getElementById('totalOrders').textContent = '0'; // Placeholder
        document.getElementById('totalRevenue').textContent = '$0'; // Placeholder
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
            
            if (this.currentMode === 'api') {
                const response = await fetch('/api/admin/books', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                if (!response.ok) throw new Error('Failed to load books');

                const books = await response.json();
                this.renderBooksTable(books);
            } else {
                // Use localStorage data for books
                this.renderBooksTableFromLocalStorage();
            }
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

    // Render books table from localStorage
    renderBooksTableFromLocalStorage() {
        const tbody = document.getElementById('booksTableBody');
        if (!tbody) return;

        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        tbody.innerHTML = books.map((book, index) => `
            <tr>
                <td>
                    <div class="book-info">
                        <h4>${book.book}</h4>
                        <p>${book.bookType}</p>
                    </div>
                </td>
                <td>${book.bookauthor || 'Unknown'}</td>
                <td><span class="badge">${book.bookType}</span></td>
                <td>${book.isbn || 'N/A'}</td>
                <td>
                    <span class="status ${book.favorite ? 'favorite' : ''}">
                        ${book.favorite ? 'Favorite' : 'Regular'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="adminPanel.viewBook(${index})" title="View Book">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.editBookFromLocalStorage(${index})" title="Edit Book">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.removeBookFromLocalStorage(${index})" title="Delete Book">
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
                const formData = new FormData(addBookForm);
                
                // Check if we're in edit mode
                if (addBookForm.dataset.mode === 'edit') {
                    this.updateBookInLocalStorage(parseInt(addBookForm.dataset.editIndex), formData);
                } else {
                    this.addBook(formData);
                }
            });

            // Initialize form enhancements
            this.initializeAddBookForm();
        }
    }

    // Initialize add book form enhancements
    initializeAddBookForm() {
        // Character counter for description
        const descriptionTextarea = document.getElementById('bookDescription');
        const charCount = document.getElementById('charCount');
        
        if (descriptionTextarea && charCount) {
            descriptionTextarea.addEventListener('input', (e) => {
                const length = e.target.value.length;
                charCount.textContent = length;
                
                if (length > 450) {
                    charCount.style.color = '#e74c3c';
                } else if (length > 400) {
                    charCount.style.color = '#f39c12';
                } else {
                    charCount.style.color = '#667eea';
                }
            });
        }

        // File upload preview
        this.initializeFileUploads();

        // Form validation
        this.initializeFormValidation();
    }

    // Initialize file upload previews
    initializeFileUploads() {
        const fileInputs = document.querySelectorAll('.file-upload-container input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const container = input.closest('.file-upload-container');
                const preview = container.querySelector('.file-upload-preview');
                
                if (file) {
                    this.updateFilePreview(preview, file);
                }
            });
        });
    }

    // Update file upload preview
    updateFilePreview(preview, file) {
        const icon = preview.querySelector('i');
        const text = preview.querySelector('span');
        const size = preview.querySelector('small');
        
        // Update icon based on file type
        if (file.type.startsWith('image/')) {
            icon.className = 'fas fa-image';
        } else if (file.type === 'application/pdf') {
            icon.className = 'fas fa-file-pdf';
        } else {
            icon.className = 'fas fa-file';
        }
        
        // Update text
        text.textContent = file.name;
        
        // Update size
        const fileSize = this.formatFileSize(file.size);
        size.textContent = fileSize;
        
        // Add success styling
        preview.style.borderColor = '#27ae60';
        preview.style.backgroundColor = 'rgba(39, 174, 96, 0.05)';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Initialize form validation
    initializeFormValidation() {
        const form = document.getElementById('addBookForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.clearFieldError(input);
                }
            });
        });
    }

    // Validate individual field
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        // Clear previous error
        this.clearFieldError(field);
        
        // Check required fields
        if (isRequired && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Validate specific field types
        switch (field.type) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'url':
                if (value && !this.isValidUrl(value)) {
                    this.showFieldError(field, 'Please enter a valid URL');
                    return false;
                }
                break;
            case 'number':
                if (value && parseFloat(value) < 0) {
                    this.showFieldError(field, 'Please enter a positive number');
                    return false;
                }
                break;
        }
        
        // Validate ISBN if present
        if (field.name === 'isbn' && value) {
            if (!this.isValidIsbn(value)) {
                this.showFieldError(field, 'Please enter a valid ISBN (10 or 13 digits)');
                return false;
            }
        }
        
        // Mark as success
        this.showFieldSuccess(field);
        return true;
    }

    // Show field error
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        formGroup.appendChild(errorMessage);
    }

    // Clear field error
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Show field success
    showFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        
        // Remove success class after a delay
        setTimeout(() => {
            formGroup.classList.remove('success');
        }, 2000);
    }

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate URL
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Validate ISBN
    isValidIsbn(isbn) {
        isbn = isbn.replaceAll("-", "");
        if (isbn.length === 10) {
            let sum = 0;
            for (let i = 9; i >= 0; i--) {
                sum += parseInt(isbn[i], 10) * (i + 1);
            }
            return sum % 11 === 0;
        } else if (isbn.length === 13) {
            let sum = 0;
            for (let i = 0; i < 13; i++) {
                if (i % 2 === 0) {
                    sum += parseInt(isbn[i], 10) * 1;
                } else {
                    sum += parseInt(isbn[i], 10) * 3;
                }
            }
            return sum % 10 === 0;
        }
        return false;
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
        if (this.currentMode === 'localStorage') {
            // Add book to localStorage
            const bookData = {};
            formData.forEach((value, key) => { bookData[key] = value; });
            this.addBookToLocalStorage(bookData);
            this.closeModal('addBookModal');
            return;
        }

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

    // Update book in localStorage
    updateBookInLocalStorage(index, formData) {
        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        
        if (index >= 0 && index < books.length) {
            const bookData = {};
            formData.forEach((value, key) => { bookData[key] = value; });
            
            // Update the book
            books[index] = {
                ...books[index],
                book: bookData.title,
                bookauthor: bookData.author,
                bookType: bookData.category,
                isbn: bookData.isbn || '',
                bookurl: bookData.bookUrl || '',
                price: bookData.price,
                stock: bookData.stock,
                bookDescription: bookData.bookDescription || '',
                featured: bookData.featured || false,
                available: bookData.available || false,
                coverImage: uploadedCoverImage || books[index].coverImage // keep old if not changed
            };
            
            localStorage.setItem('shelfOfBooks', JSON.stringify(books));
            
            // Reset form
            const form = document.getElementById('addBookForm');
            if (form) {
                delete form.dataset.editIndex;
                delete form.dataset.mode;
                form.reset();
                
                // Reset button text
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Add Book';
                }
            }
            
            this.showSuccess('Book updated successfully!');
            this.closeModal('addBookModal');
            this.loadBooks(); // Reload the books table
        } else {
            this.showError('Invalid book index');
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

    // Handle book search
    handleBookSearch(query) {
        console.log('Book search:', query);
        // Implementation for book search
    }

    // View book details
    viewBook(index) {
        if (this.currentMode === 'localStorage') {
            this.viewBookFromLocalStorage(index);
        } else {
            this.viewBookFromApi(index);
        }
    }

    // View book from localStorage
    viewBookFromLocalStorage(index) {
        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        const book = books[index];
        
        if (!book) {
            this.showError('Book not found!');
            return;
        }

        // Store current book index for download
        this.currentBookIndex = index;
        
        // Update modal title
        document.getElementById('modalBookTitle').textContent = book.book;
        
        // Create book details content
        const bookContent = `
            <div class="book-details">
                <div class="book-header">
                    <div class="book-cover">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="book-info">
                        <h3>${book.book}</h3>
                        <p class="author">by ${book.bookauthor || 'Unknown Author'}</p>
                        <span class="book-type">${book.bookType}</span>
                    </div>
                </div>
                
                <div class="book-details-grid">
                    <div class="detail-item">
                        <label>ISBN:</label>
                        <span>${book.isbn || 'Not available'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Edition:</label>
                        <span>${book.edition || 'Not specified'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Publication Date:</label>
                        <span>${book.publicationDate || 'Not available'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Added Date:</label>
                        <span>${new Date(book.addedDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span>
                            ${book.favorite ? '<i class="fas fa-star" style="color: gold;"></i> Favorite' : 'Regular'}
                            ${book.read ? ' | <i class="fas fa-check" style="color: green;"></i> Read' : ''}
                        </span>
                    </div>
                </div>
                
                ${book.bookurl ? `
                    <div class="book-url">
                        <label>Book URL:</label>
                        <a href="${book.bookurl}" target="_blank" class="book-link">
                            <i class="fas fa-external-link-alt"></i> Open Book URL
                        </a>
                    </div>
                ` : ''}
                
                <div class="book-actions">
                    <button class="btn btn-primary" onclick="adminPanel.openBookUrl('${book.bookurl}')" ${!book.bookurl ? 'disabled' : ''}>
                        <i class="fas fa-external-link-alt"></i> Open Book
                    </button>
                    ${book.bookurl ? `
                        <button class="btn btn-success" onclick="adminPanel.downloadBook(${index})">
                            <i class="fas fa-download"></i> Download
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Update modal content
        document.getElementById('modalBookContent').innerHTML = bookContent;
        
        // Show download button if URL exists
        const downloadBtn = document.getElementById('downloadBookBtn');
        if (downloadBtn) {
            downloadBtn.style.display = book.bookurl ? 'inline-block' : 'none';
        }
        
        // Show modal
        document.getElementById('bookViewerModal').style.display = 'flex';
    }

    // View book from API
    viewBookFromApi(bookId) {
        // Implementation for viewing books from API
        console.log('Viewing book from API:', bookId);
    }

    // Open book URL
    openBookUrl(url) {
        if (url) {
            window.open(url, '_blank');
        } else {
            this.showError('No URL available for this book');
        }
    }

    // Download book
    downloadBook(index) {
        if (this.currentMode === 'localStorage') {
            this.downloadBookFromLocalStorage(index);
        } else {
            this.downloadBookFromApi(index);
        }
    }

    // Download book from localStorage
    downloadBookFromLocalStorage(index) {
        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        const book = books[index];
        
        if (!book || !book.bookurl) {
            this.showError('No download URL available for this book');
            return;
        }

        try {
            // Create a temporary link element to trigger download
            const link = document.createElement('a');
            link.href = book.bookurl;
            link.download = `${book.book} - ${book.bookauthor}.pdf`;
            link.target = '_blank';
            
            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Download started!');
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Download failed. Please try opening the book URL instead.');
        }
    }

    // Download book from API
    downloadBookFromApi(bookId) {
        // Implementation for downloading books from API
        console.log('Downloading book from API:', bookId);
    }

    // Close book modal
    closeBookModal() {
        document.getElementById('bookViewerModal').style.display = 'none';
        this.currentBookIndex = null;
    }

    // Add book to localStorage (from management.html functionality)
    addBookToLocalStorage(bookData) {
        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        
        const newBook = {
            book: bookData.title,
            bookauthor: bookData.author,
            bookType: bookData.category,
            isbn: bookData.isbn || '',
            edition: bookData.edition || '',
            publicationDate: bookData.publicationDate || '',
            bookurl: bookData.bookUrl || '',
            favorite: bookData.favorite || false,
            read: bookData.read || false,
            addedDate: new Date().toISOString()
        };
        
        books.push(newBook);
        localStorage.setItem('shelfOfBooks', JSON.stringify(books));
        
        this.showSuccess('Book added successfully to local storage!');
        this.loadBooks(); // Reload the books table
    }

    // Remove book from localStorage
    removeBookFromLocalStorage(index) {
        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        
        if (index >= 0 && index < books.length) {
            const removedBook = books.splice(index, 1)[0];
            localStorage.setItem('shelfOfBooks', JSON.stringify(books));
            this.showSuccess(`Book "${removedBook.book}" removed successfully!`);
            this.loadBooks(); // Reload the books table
        } else {
            this.showError('Invalid book index');
        }
    }

    // Edit book in localStorage
    editBookFromLocalStorage(index) {
        const books = JSON.parse(localStorage.getItem('shelfOfBooks') || '[]');
        const book = books[index];
        
        if (!book) {
            this.showError('Book not found!');
            return;
        }

        // Populate the add book form with existing data
        const form = document.getElementById('addBookForm');
        if (form) {
            form.querySelector('[name="title"]').value = book.book;
            form.querySelector('[name="author"]').value = book.bookauthor;
            form.querySelector('[name="category"]').value = book.bookType;
            form.querySelector('[name="isbn"]').value = book.isbn;
            form.querySelector('[name="bookUrl"]').value = book.bookurl;
            form.querySelector('[name="price"]').value = book.price;
            form.querySelector('[name="stock"]').value = book.stock;
            form.querySelector('[name="description"]').value = book.bookDescription || '';
            form.querySelector('[name="featured"]').checked = !!book.featured;
            form.querySelector('[name="available"]').checked = !!book.available;
            uploadedCoverImage = book.coverImage || '';
            if (coverImagePreview) {
                if (uploadedCoverImage) {
                    coverImagePreview.innerHTML = `<img src='${uploadedCoverImage}' alt='Book Cover' style='max-width:100px;max-height:140px;border-radius:8px;'>`;
                } else {
                    coverImagePreview.innerHTML = '';
                }
            }
            form.dataset.editIndex = index;
            form.dataset.mode = 'edit';
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Update Book';
        }
        
        this.showAddBookModal();
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

function closeBookModal() {
    if (adminPanel) adminPanel.closeBookModal();
}

function downloadBook() {
    if (adminPanel && adminPanel.currentBookIndex !== null) {
        adminPanel.downloadBook(adminPanel.currentBookIndex);
    }
} 