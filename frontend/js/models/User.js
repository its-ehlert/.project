// User Model Classes - Demonstrating Inheritance
class User {
    constructor(id, email, firstName, lastName, role = 'customer') {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.createdAt = new Date();
        this.isActive = true;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    get displayName() {
        return this.firstName || this.email.split('@')[0];
    }

    canAccess(resource) {
        return this.isActive;
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            fullName: this.fullName,
            displayName: this.displayName,
            createdAt: this.createdAt,
            isActive: this.isActive
        };
    }
}

class Customer extends User {
    constructor(id, email, firstName, lastName) {
        super(id, email, firstName, lastName, 'customer');
        this.wishlist = [];
        this.orderHistory = [];
        this.preferences = {};
    }

    addToWishlist(bookId) {
        if (!this.wishlist.includes(bookId)) {
            this.wishlist.push(bookId);
        }
    }

    removeFromWishlist(bookId) {
        this.wishlist = this.wishlist.filter(id => id !== bookId);
    }

    hasOrdered(bookId) {
        return this.orderHistory.some(order => 
            order.items.some(item => item.bookId === bookId)
        );
    }

    canAccess(resource) {
        return super.canAccess(resource) && 
               ['books', 'cart', 'orders', 'profile'].includes(resource);
    }
}

class Admin extends User {
    constructor(id, email, firstName, lastName) {
        super(id, email, firstName, lastName, 'admin');
        this.permissions = ['manage_books', 'manage_users', 'manage_orders', 'view_analytics'];
    }

    canAccess(resource) {
        return super.canAccess(resource) && 
               this.permissions.includes(`manage_${resource}`);
    }

    canManageUsers() {
        return this.permissions.includes('manage_users');
    }

    canManageBooks() {
        return this.permissions.includes('manage_books');
    }

    canViewAnalytics() {
        return this.permissions.includes('view_analytics');
    }
}

// Factory method for creating users
class UserFactory {
    static createUser(userData) {
        switch (userData.role) {
            case 'admin':
                return new Admin(userData.id, userData.email, userData.firstName, userData.lastName);
            case 'customer':
            default:
                return new Customer(userData.id, userData.email, userData.firstName, userData.lastName);
        }
    }
} 