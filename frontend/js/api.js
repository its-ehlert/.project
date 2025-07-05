// API Service for Online Book Store
class BookStoreAPI {
    constructor() {
        this.baseURL = 'http://localhost:8080/api'; // Java Spring Boot backend
        this.phpURL = 'http://localhost/bookstore/php'; // PHP scripts
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get authentication token
    getAuthToken() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token || null;
    }

    // Books API
    async getBooks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/books${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async getBook(id) {
        return this.request(`/books/${id}`);
    }

    async searchBooks(query, filters = {}) {
        const params = { q: query, ...filters };
        return this.getBooks(params);
    }

    async getBooksByCategory(category) {
        return this.request(`/books/category/${category}`);
    }

    async getFeaturedBooks() {
        return this.request('/books/featured');
    }

    async getBestsellers() {
        return this.request('/books/bestsellers');
    }

    async getNewReleases() {
        return this.request('/books/new-releases');
    }

    async getBooksOnSale() {
        return this.request('/books/on-sale');
    }

    // Categories API
    async getCategories() {
        return this.request('/categories');
    }

    async getCategory(id) {
        return this.request(`/categories/${id}`);
    }

    // Authors API
    async getAuthors() {
        return this.request('/authors');
    }

    async getAuthor(id) {
        return this.request(`/authors/${id}`);
    }

    async getAuthorBooks(authorId) {
        return this.request(`/authors/${authorId}/books`);
    }

    // Authentication API
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async refreshToken() {
        return this.request('/auth/refresh', {
            method: 'POST'
        });
    }

    // User Profile API
    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(passwordData) {
        return this.request('/users/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }

    // Cart API
    async getCart() {
        return this.request('/cart');
    }

    async addToCart(cartItem) {
        return this.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify(cartItem)
        });
    }

    async updateCartItem(itemId, quantity) {
        return this.request(`/cart/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    async removeFromCart(itemId) {
        return this.request(`/cart/items/${itemId}`, {
            method: 'DELETE'
        });
    }

    async clearCart() {
        return this.request('/cart/clear', {
            method: 'DELETE'
        });
    }

    // Wishlist API
    async getWishlist() {
        return this.request('/wishlist');
    }

    async addToWishlist(bookId) {
        return this.request('/wishlist/add', {
            method: 'POST',
            body: JSON.stringify({ bookId })
        });
    }

    async removeFromWishlist(bookId) {
        return this.request(`/wishlist/remove/${bookId}`, {
            method: 'DELETE'
        });
    }

    // Orders API
    async getOrders() {
        return this.request('/orders');
    }

    async getOrder(orderId) {
        return this.request(`/orders/${orderId}`);
    }

    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async cancelOrder(orderId) {
        return this.request(`/orders/${orderId}/cancel`, {
            method: 'PUT'
        });
    }

    // Reviews API
    async getBookReviews(bookId) {
        return this.request(`/books/${bookId}/reviews`);
    }

    async addReview(bookId, reviewData) {
        return this.request(`/books/${bookId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    async updateReview(reviewId, reviewData) {
        return this.request(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    }

    async deleteReview(reviewId) {
        return this.request(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });
    }

    // Coupons API
    async validateCoupon(code) {
        return this.request(`/coupons/validate/${code}`);
    }

    // Addresses API
    async getUserAddresses() {
        return this.request('/users/addresses');
    }

    async addAddress(addressData) {
        return this.request('/users/addresses', {
            method: 'POST',
            body: JSON.stringify(addressData)
        });
    }

    async updateAddress(addressId, addressData) {
        return this.request(`/users/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(addressData)
        });
    }

    async deleteAddress(addressId) {
        return this.request(`/users/addresses/${addressId}`, {
            method: 'DELETE'
        });
    }

    // PHP API calls for dynamic content
    async getPHPData(endpoint, params = {}) {
        const url = `${this.phpURL}/${endpoint}`;
        const queryString = new URLSearchParams(params).toString();
        const fullURL = queryString ? `${url}?${queryString}` : url;

        try {
            const response = await fetch(fullURL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('PHP API request failed:', error);
            throw error;
        }
    }

    // PHP specific endpoints
    async getHomePageData() {
        return this.getPHPData('home.php');
    }

    async getCategoryPageData(categoryId) {
        return this.getPHPData('category.php', { id: categoryId });
    }

    async getBookDetailsData(bookId) {
        return this.getPHPData('book-details.php', { id: bookId });
    }

    async getSearchResultsData(query, filters = {}) {
        return this.getPHPData('search.php', { q: query, ...filters });
    }

    async getBestsellersData() {
        return this.getPHPData('bestsellers.php');
    }

    async getNewReleasesData() {
        return this.getPHPData('new-releases.php');
    }

    async getDealsData() {
        return this.getPHPData('deals.php');
    }

    // Error handling
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('401')) {
            // Unauthorized - redirect to login
            localStorage.removeItem('user');
            window.location.href = '/pages/login.html';
        } else if (error.message.includes('403')) {
            // Forbidden
            showNotification('Access denied. Please check your permissions.', 'error');
        } else if (error.message.includes('404')) {
            // Not found
            showNotification('The requested resource was not found.', 'error');
        } else if (error.message.includes('500')) {
            // Server error
            showNotification('Server error. Please try again later.', 'error');
        } else {
            // Generic error
            showNotification('An error occurred. Please try again.', 'error');
        }
    }

    // Utility methods
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
}

// Create global API instance
const api = new BookStoreAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookStoreAPI;
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