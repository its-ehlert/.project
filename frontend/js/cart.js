// Shopping Cart Management for Online Book Store
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    // Initialize cart functionality
    init() {
        this.updateCartDisplay();
        this.bindEvents();
    }

    // Load cart from localStorage
    loadCart() {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
    }

    // Add item to cart
    addItem(bookId, quantity = 1) {
        const existingItem = this.cart.find(item => item.bookId === bookId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                bookId: bookId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.syncWithServer();
        return true;
    }

    // Remove item from cart
    removeItem(bookId) {
        this.cart = this.cart.filter(item => item.bookId !== bookId);
        this.saveCart();
        this.syncWithServer();
        return true;
    }

    // Update item quantity
    updateQuantity(bookId, quantity) {
        const item = this.cart.find(item => item.bookId === bookId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(bookId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.syncWithServer();
            }
        }
        
        return true;
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.syncWithServer();
        return true;
    }

    // Get cart items with book details
    async getCartItems() {
        if (this.cart.length === 0) {
            return [];
        }

        try {
            const bookIds = this.cart.map(item => item.bookId);
            const books = await this.fetchBooksByIds(bookIds);
            
            return this.cart.map(cartItem => {
                const book = books.find(b => b.id === cartItem.bookId);
                return {
                    ...cartItem,
                    book: book || null
                };
            });
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return this.cart.map(cartItem => ({
                ...cartItem,
                book: null
            }));
        }
    }

    // Fetch books by IDs
    async fetchBooksByIds(bookIds) {
        try {
            const response = await api.getBooks({ ids: bookIds.join(',') });
            return response.data || response;
        } catch (error) {
            console.error('Error fetching books:', error);
            return [];
        }
    }

    // Calculate cart totals
    calculateTotals(cartItems) {
        let subtotal = 0;
        let totalItems = 0;

        cartItems.forEach(item => {
            if (item.book) {
                const price = item.book.discount_percentage > 0 
                    ? item.book.price 
                    : (item.book.original_price || item.book.price);
                subtotal += price * item.quantity;
                totalItems += item.quantity;
            }
        });

        const tax = subtotal * 0.08; // 8% tax rate
        const shipping = subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
        const total = subtotal + tax + shipping;

        return {
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            total: total,
            totalItems: totalItems
        };
    }

    // Update cart display
    updateCartDisplay() {
        this.updateCartCount();
        this.updateCartTotal();
        this.updateCartBadge();
    }

    // Update cart count in header
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Update cart total
    updateCartTotal() {
        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) {
            this.getCartItems().then(cartItems => {
                const totals = this.calculateTotals(cartItems);
                cartTotal.textContent = api.formatPrice(totals.total);
            });
        }
    }

    // Update cart badge
    updateCartBadge() {
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    // Render cart items
    async renderCartItems(container) {
        if (!container) return;

        const cartItems = await this.getCartItems();
        
        if (cartItems.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some books to get started!</p>
                    <a href="/" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        const totals = this.calculateTotals(cartItems);
        
        const itemsHTML = cartItems.map(item => this.createCartItemHTML(item)).join('');
        
        container.innerHTML = `
            <div class="cart-items">
                ${itemsHTML}
            </div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal (${totals.totalItems} items):</span>
                    <span>${api.formatPrice(totals.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax:</span>
                    <span>${api.formatPrice(totals.tax)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>${totals.shipping === 0 ? 'FREE' : api.formatPrice(totals.shipping)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>${api.formatPrice(totals.total)}</span>
                </div>
                <div class="cart-actions">
                    <button class="btn btn-secondary" onclick="cart.clearCart()">Clear Cart</button>
                    <button class="btn btn-primary" onclick="cart.proceedToCheckout()">Proceed to Checkout</button>
                </div>
            </div>
        `;

        this.bindCartItemEvents(container);
    }

    // Create cart item HTML
    createCartItemHTML(item) {
        if (!item.book) {
            return `
                <div class="cart-item" data-book-id="${item.bookId}">
                    <div class="cart-item-content">
                        <p>Book information not available</p>
                        <button class="remove-item" onclick="cart.removeItem(${item.bookId})">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        }

        const price = item.book.discount_percentage > 0 
            ? item.book.price 
            : (item.book.original_price || item.book.price);
        
        const originalPrice = item.book.original_price && item.book.original_price > price 
            ? `<span class="original-price">${api.formatPrice(item.book.original_price)}</span>` 
            : '';

        return `
            <div class="cart-item" data-book-id="${item.bookId}">
                <div class="cart-item-image">
                    <img src="${item.book.cover_image_url || 'images/book-placeholder.jpg'}" alt="${item.book.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.book.title}</h4>
                    <p class="cart-item-author">by ${item.book.author}</p>
                    <div class="cart-item-price">
                        <span class="current-price">${api.formatPrice(price)}</span>
                        ${originalPrice}
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" onclick="cart.updateQuantity(${item.bookId}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" max="99" 
                           onchange="cart.updateQuantity(${item.bookId}, parseInt(this.value))">
                    <button class="quantity-btn plus" onclick="cart.updateQuantity(${item.bookId}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    ${api.formatPrice(price * item.quantity)}
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" onclick="cart.removeItem(${item.bookId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Bind cart item events
    bindCartItemEvents(container) {
        const quantityInputs = container.querySelectorAll('.cart-item-quantity input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const bookId = parseInt(this.closest('.cart-item').dataset.bookId);
                const quantity = parseInt(this.value);
                cart.updateQuantity(bookId, quantity);
            });
        });
    }

    // Bind global events
    bindEvents() {
        // Cart icon click
        const cartIcon = document.querySelector('.action-btn[href*="cart"]');
        if (cartIcon) {
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = '/pages/cart.html';
            });
        }

        // Add to cart buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-add-cart')) {
                e.preventDefault();
                const bookId = parseInt(e.target.closest('.book-card').dataset.bookId);
                cart.addItem(bookId, 1);
                showNotification('Book added to cart!', 'success');
            }
        });
    }

    // Sync cart with server
    async syncWithServer() {
        try {
            if (this.cart.length > 0) {
                await api.addToCart({
                    items: this.cart
                });
            } else {
                await api.clearCart();
            }
        } catch (error) {
            console.error('Error syncing cart with server:', error);
        }
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }

        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.token) {
            showNotification('Please log in to continue with checkout', 'error');
            window.location.href = '/pages/login.html?redirect=checkout';
            return;
        }

        // Proceed to checkout
        window.location.href = '/pages/checkout.html';
    }

    // Apply coupon
    async applyCoupon(code) {
        try {
            const response = await api.validateCoupon(code);
            if (response.valid) {
                this.coupon = response.coupon;
                showNotification(`Coupon applied! ${response.coupon.description}`, 'success');
                this.updateCartDisplay();
                return true;
            } else {
                showNotification(response.message || 'Invalid coupon code', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            showNotification('Error applying coupon. Please try again.', 'error');
            return false;
        }
    }

    // Remove coupon
    removeCoupon() {
        this.coupon = null;
        showNotification('Coupon removed', 'info');
        this.updateCartDisplay();
    }

    // Get cart summary for checkout
    async getCartSummary() {
        const cartItems = await this.getCartItems();
        const totals = this.calculateTotals(cartItems);
        
        return {
            items: cartItems,
            totals: totals,
            coupon: this.coupon
        };
    }
}

// Create global cart instance
const cart = new ShoppingCart();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}

// Cart page specific functionality
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const cartContainer = document.getElementById('cartContainer');
        if (cartContainer) {
            cart.renderCartItems(cartContainer);
        }

        // Coupon form
        const couponForm = document.getElementById('couponForm');
        if (couponForm) {
            couponForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const couponCode = this.querySelector('input[name="couponCode"]').value.trim();
                if (couponCode) {
                    cart.applyCoupon(couponCode);
                    this.reset();
                }
            });
        }
    });
}

// Mini cart functionality
class MiniCart {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMiniCart();
        this.bindEvents();
    }

    createMiniCart() {
        const miniCart = document.createElement('div');
        miniCart.className = 'mini-cart';
        miniCart.innerHTML = `
            <div class="mini-cart-header">
                <h3>Shopping Cart</h3>
                <button class="close-mini-cart">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mini-cart-content"></div>
            <div class="mini-cart-footer">
                <div class="mini-cart-total">
                    <span>Total:</span>
                    <span id="miniCartTotal">$0.00</span>
                </div>
                <div class="mini-cart-actions">
                    <a href="/pages/cart.html" class="btn btn-secondary">View Cart</a>
                    <a href="/pages/checkout.html" class="btn btn-primary">Checkout</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(miniCart);
        this.element = miniCart;
    }

    bindEvents() {
        const cartIcon = document.querySelector('.action-btn[href*="cart"]');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        const closeBtn = this.element.querySelector('.close-mini-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target) && !e.target.closest('.action-btn[href*="cart"]')) {
                this.close();
            }
        });
    }

    async toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    async open() {
        await this.updateContent();
        this.element.classList.add('open');
        this.isOpen = true;
    }

    close() {
        this.element.classList.remove('open');
        this.isOpen = false;
    }

    async updateContent() {
        const content = this.element.querySelector('.mini-cart-content');
        const cartItems = await cart.getCartItems();
        
        if (cartItems.length === 0) {
            content.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }

        const itemsHTML = cartItems.slice(0, 3).map(item => this.createMiniCartItemHTML(item)).join('');
        const moreItems = cartItems.length > 3 ? `<p class="more-items">+${cartItems.length - 3} more items</p>` : '';
        
        content.innerHTML = itemsHTML + moreItems;
        
        // Update total
        const totals = cart.calculateTotals(cartItems);
        const totalElement = this.element.querySelector('#miniCartTotal');
        if (totalElement) {
            totalElement.textContent = api.formatPrice(totals.total);
        }
    }

    createMiniCartItemHTML(item) {
        if (!item.book) return '';

        return `
            <div class="mini-cart-item">
                <img src="${item.book.cover_image_url || 'images/book-placeholder.jpg'}" alt="${item.book.title}">
                <div class="mini-cart-item-details">
                    <h4>${api.truncateText(item.book.title, 30)}</h4>
                    <p>Qty: ${item.quantity}</p>
                    <span class="price">${api.formatPrice(item.book.price * item.quantity)}</span>
                </div>
                <button class="remove-mini-item" onclick="cart.removeItem(${item.bookId})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }
}

// Initialize mini cart if not on cart page
if (!window.location.pathname.includes('cart.html')) {
    const miniCart = new MiniCart();
} 