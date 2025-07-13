// Shopping Cart Management for Online Book Store
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.coupon = null;
        this.init();
    }

    // Initialize cart functionality
    init() {
        this.updateCartDisplay();
        this.bindEvents();
        this.updateShippingProgress();
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
        this.updateShippingProgress();
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
        this.coupon = null;
        this.saveCart();
        this.syncWithServer();
        this.updateCartDisplay();
        this.updateShippingProgress();
        return true;
    }

    // Get cart items with book details
    async getCartItems() {
        if (this.cart.length === 0) {
            return [];
        }
        // Use window.booksData for all book lookups
        const books = window.booksData || [];
        return this.cart.map(cartItem => {
            const book = books.find(b => b.id == cartItem.bookId);
            return {
                ...cartItem,
                book: book || null
            };
        });
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
        const shipping = subtotal >= 6750 ? 0 : 809; // Free shipping over KSh 6,750 (equivalent to $50)
        let total = subtotal + tax + shipping;

        // Apply coupon discount if available
        if (this.coupon) {
            const discount = this.coupon.type === 'percentage' 
                ? (subtotal * this.coupon.value / 100)
                : this.coupon.value;
            total -= discount;
        }

        return {
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            total: total,
            totalItems: totalItems,
            discount: this.coupon ? (this.coupon.type === 'percentage' 
                ? (subtotal * this.coupon.value / 100)
                : this.coupon.value) : 0
        };
    }

    // Update cart display
    updateCartDisplay() {
        this.updateCartCount();
        this.updateCartTotal();
        this.updateCartBadge();
        this.updateCartItemCount();
        this.updateSummary();
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

    // Update cart item count display
    updateCartItemCount() {
        const cartItemCount = document.getElementById('cartItemCount');
        if (cartItemCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartItemCount.textContent = totalItems;
        }
    }

    // Update shipping progress
    updateShippingProgress() {
        this.getCartItems().then(cartItems => {
            const totals = this.calculateTotals(cartItems);
            const progressBar = document.getElementById('shippingProgress');
            const progressText = document.getElementById('shippingText');
            
            if (progressBar && progressText) {
                const progress = Math.min((totals.subtotal / 50) * 100, 100);
                progressBar.style.width = `${progress}%`;
                
                if (totals.subtotal >= 50) {
                    progressText.textContent = 'Free shipping unlocked!';
                    progressText.style.color = '#2bff05';
                } else {
                    const remaining = 50 - totals.subtotal;
                    progressText.textContent = `Add $${remaining.toFixed(2)} more for free shipping`;
                    progressText.style.color = '#b8c5d6';
                }
            }
        });
    }

    // Update order summary
    async updateSummary() {
        const cartItems = await this.getCartItems();
        const totals = this.calculateTotals(cartItems);
        
        const summarySubtotal = document.getElementById('summarySubtotal');
        const summaryTax = document.getElementById('summaryTax');
        const summaryShipping = document.getElementById('summaryShipping');
        const summaryTotal = document.getElementById('summaryTotal');
        const summaryDiscount = document.getElementById('summaryDiscount');
        const discountAmount = document.getElementById('discountAmount');
        
        if (summarySubtotal) summarySubtotal.textContent = api.formatPrice(totals.subtotal);
        if (summaryTax) summaryTax.textContent = api.formatPrice(totals.tax);
        if (summaryShipping) summaryShipping.textContent = totals.shipping === 0 ? 'FREE' : api.formatPrice(totals.shipping);
        if (summaryTotal) summaryTotal.textContent = api.formatPrice(totals.total);
        
        if (summaryDiscount && discountAmount) {
            if (totals.discount > 0) {
                summaryDiscount.style.display = 'flex';
                discountAmount.textContent = `-${api.formatPrice(totals.discount)}`;
            } else {
                summaryDiscount.style.display = 'none';
            }
        }
    }

    // Render cart items
    async renderCartItems(container) {
        if (!container) return;

        const cartItems = await this.getCartItems();
        
        if (cartItems.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any books to your cart yet.</p>
                    <div class="empty-cart-actions">
                        <a href="../index.html" class="btn btn-primary">
                            <i class="fas fa-book"></i>
                            Start Shopping
                        </a>
                        <a href="bestsellers.html" class="btn btn-secondary">
                            <i class="fas fa-star"></i>
                            View Bestsellers
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        const totals = this.calculateTotals(cartItems);
        
        let cartHTML = `
            <div class="cart-items">
                ${cartItems.map(item => this.createCartItemHTML(item)).join('')}
            </div>
        `;
        
        container.innerHTML = cartHTML;
        this.bindCartItemEvents(container);
    }

    // Create cart item HTML
    createCartItemHTML(item) {
        if (!item.book) {
            // No fallback to localStorage, just show not available
            return `
                <div class="cart-item" data-book-id="${item.bookId}">
                    <div class="cart-item-content">
                        <p>Book information not available</p>
                        <button class="remove-item icon-only" onclick="cart.removeItem(${item.bookId})" title="Remove">
                            <i class="fas fa-trash"></i>
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
                    <img src="${item.book.cover_image_url || '../images/book-placeholder.jpg'}" alt="${item.book.title}">
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
                    <button class="remove-item" onclick="cart.removeItem(${item.bookId})" title="Remove item">
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
                window.location.href = 'cart.html';
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

        // Clear cart button
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear your cart?')) {
                    cart.clearCart();
                    showNotification('Cart cleared successfully', 'info');
                }
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                cart.proceedToCheckout();
            });
        }
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
            window.location.href = 'login.html?redirect=checkout';
            return;
        }

        // Proceed to checkout
        window.location.href = 'checkout.html';
    }

    // Apply coupon
    async applyCoupon(code) {
        try {
            const response = await api.validateCoupon(code);
            if (response.valid) {
                this.coupon = response.coupon;
                this.showCouponMessage(`Coupon applied! ${response.coupon.description}`, 'success');
                this.updateCartDisplay();
                return true;
            } else {
                this.showCouponMessage(response.message || 'Invalid coupon code', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            this.showCouponMessage('Error applying coupon. Please try again.', 'error');
            return false;
        }
    }

    // Show coupon message
    showCouponMessage(message, type) {
        const messageDiv = document.getElementById('couponMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `coupon-message ${type}`;
            messageDiv.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Remove coupon
    removeCoupon() {
        this.coupon = null;
        this.showCouponMessage('Coupon removed', 'info');
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