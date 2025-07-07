// API Service for Online Book Store
class ApiService {
    constructor() {
<<<<<<< HEAD
        this.baseUrl = 'http://localhost:3000/api'; // Update with your actual API URL
        this.token = localStorage.getItem('token');
=======
        this.baseURL = 'http://localhost:3000/api'; // Node.js backend
        this.phpURL = 'http://localhost/bookstore/php'; // PHP scripts (legacy)
>>>>>>> 34622f094c83388c787f60a3dec7ce229027abf8
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Set default headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authorization header if token exists
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method: 'GET',
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async login(credentials) {
        try {
<<<<<<< HEAD
            // For demo purposes, simulate API response
            // In a real app, this would be an actual API call
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            // Simulate role-based authentication
            if (credentials.role === 'admin') {
                // Admin login simulation
                const adminUser = {
                    id: 'admin-1',
                    email: credentials.email,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'admin',
                    isActive: true,
                    createdAt: new Date().toISOString()
                };
                
                this.setToken('admin-token-123');
                return { success: true, user: adminUser };
            } else {
                // Customer login simulation
                const customerUser = {
                    id: 'customer-1',
                    email: credentials.email,
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'customer',
                    isActive: true,
                    createdAt: new Date().toISOString()
                };
                
                this.setToken('customer-token-123');
                return { success: true, user: customerUser };
            }
        } catch (error) {
            return { success: false, message: error.message };
=======
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    role: data.user.role,
                    token: data.token
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Login failed'
            };
>>>>>>> 34622f094c83388c787f60a3dec7ce229027abf8
        }
    }

    async register(userData) {
        try {
<<<<<<< HEAD
            const response = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            // Simulate registration response
            const newUser = {
                id: `user-${Date.now()}`,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role || 'customer',
                isActive: true,
                createdAt: new Date().toISOString()
            };

            this.setToken('new-user-token-123');
            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, message: error.message };
=======
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    role: data.user.role,
                    token: data.token
                }
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || 'Registration failed'
            };
>>>>>>> 34622f094c83388c787f60a3dec7ce229027abf8
        }
    }

    async logout() {
<<<<<<< HEAD
        try {
            await this.request('/auth/logout', { method: 'POST' });
            this.clearToken();
            return { success: true };
        } catch (error) {
            this.clearToken();
            return { success: false, message: error.message };
        }
    }

    // User management endpoints
    async getProfile() {
        return await this.request('/user/profile');
=======
        // For now, just return success since our backend doesn't have a logout endpoint
        return { success: true };
    }

    async refreshToken() {
        try {
            const response = await fetch(`${this.baseURL}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Token verification failed');
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Token refresh error:', error);
            return { success: false, message: error.message };
        }
>>>>>>> 34622f094c83388c787f60a3dec7ce229027abf8
    }

    async updateProfile(profileData) {
        const response = await this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        return response;
    }

    async changePassword(passwordData) {
        const response = await this.request('/user/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
        return response;
    }

    async resetPassword(email) {
        const response = await this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        return response;
    }

    // Book endpoints
    async getBooks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/books?${queryString}` : '/books';
        return await this.request(endpoint);
    }

    async getBook(id) {
        return await this.request(`/books/${id}`);
    }

    async createBook(bookData) {
        const response = await this.request('/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });
        return response;
    }

    async updateBook(id, bookData) {
        const response = await this.request(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        });
        return response;
    }

    async deleteBook(id) {
        const response = await this.request(`/books/${id}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Category endpoints
    async getCategories() {
        return await this.request('/categories');
    }

    async getCategory(id) {
        return await this.request(`/categories/${id}`);
    }

    // Order endpoints
    async getOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/orders?${queryString}` : '/orders';
        return await this.request(endpoint);
    }

    async getOrder(id) {
        return await this.request(`/orders/${id}`);
    }

    async createOrder(orderData) {
        const response = await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        return response;
    }

    async updateOrder(id, orderData) {
        const response = await this.request(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(orderData)
        });
        return response;
    }

    // User management (admin only)
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
        return await this.request(endpoint);
    }

    async getUser(id) {
        return await this.request(`/admin/users/${id}`);
    }

    async updateUser(id, userData) {
        const response = await this.request(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        return response;
    }

    async deleteUser(id) {
        const response = await this.request(`/admin/users/${id}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Analytics endpoints (admin only)
    async getAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/admin/analytics?${queryString}` : '/admin/analytics';
        return await this.request(endpoint);
    }

    async getSalesData(period = 'month') {
        return await this.request(`/admin/analytics/sales?period=${period}`);
    }

    async getTopBooks(limit = 10) {
        return await this.request(`/admin/analytics/top-books?limit=${limit}`);
    }

    // Search endpoints
    async searchBooks(query, params = {}) {
        const searchParams = { q: query, ...params };
        const queryString = new URLSearchParams(searchParams).toString();
        return await this.request(`/search/books?${queryString}`);
    }

    // Wishlist endpoints
    async getWishlist() {
        return await this.request('/user/wishlist');
    }

    async addToWishlist(bookId) {
        const response = await this.request('/user/wishlist', {
            method: 'POST',
            body: JSON.stringify({ bookId })
        });
        return response;
    }

    async removeFromWishlist(bookId) {
        const response = await this.request(`/user/wishlist/${bookId}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Review endpoints
    async getBookReviews(bookId) {
        return await this.request(`/books/${bookId}/reviews`);
    }

    async createReview(bookId, reviewData) {
        const response = await this.request(`/books/${bookId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
        return response;
    }

    async updateReview(reviewId, reviewData) {
        const response = await this.request(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
        return response;
    }

    async deleteReview(reviewId) {
        const response = await this.request(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Utility methods
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES'
        }).format(price);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Error handling
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.message === 'Unauthorized') {
            // Token expired or invalid
            this.clearToken();
            window.location.href = '/pages/login.html';
        }
        
        return {
            success: false,
            message: error.message || 'An error occurred'
        };
    }
}

// Create global API instance
const api = new ApiService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    api.handleError(event.reason);
});

// Network status monitoring
window.addEventListener('online', function() {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', function() {
    showNotification('You are offline. Some features may not work.', 'error');
});

// Auto-refresh token before expiration
setInterval(async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token && user.expiresAt) {
        const now = new Date().getTime();
        const expiresAt = new Date(user.expiresAt).getTime();
        const timeUntilExpiry = expiresAt - now;
        
        // Refresh token if it expires in the next 5 minutes
        if (timeUntilExpiry > 0 && timeUntilExpiry < 300000) {
            try {
                const response = await api.refreshToken();
                localStorage.setItem('user', JSON.stringify(response));
            } catch (error) {
                console.error('Token refresh failed:', error);
                // Redirect to login if refresh fails
                localStorage.removeItem('user');
                window.location.href = '/pages/login.html';
            }
        }
    }
}, 60000); // Check every minute 