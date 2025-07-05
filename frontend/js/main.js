// Main JavaScript for Online Book Store
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initSearch();
    initCategoryCards();
    initNewsletter();
    loadFeaturedBooks();
    loadBestsellers();
    updateCartCount();
    updateWishlistCount();
    checkAuthStatus();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // User dropdown toggle
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.style.display = 'none';
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        // Store search query in localStorage for the search results page
        localStorage.setItem('searchQuery', query);
        window.location.href = 'pages/search-results.html';
    }
}

// Category cards functionality
function initCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            window.location.href = `pages/category.html?cat=${category}`;
        });
    });
}

// Newsletter subscription
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                subscribeNewsletter(email);
            }
        });
    }
}

function subscribeNewsletter(email) {
    // Show loading state
    const submitBtn = document.querySelector('#newsletterForm button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Show success message
        showNotification('Successfully subscribed to newsletter!', 'success');
        
        // Reset form
        document.getElementById('newsletterForm').reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Load featured books
function loadFeaturedBooks() {
    const featuredBooksContainer = document.getElementById('featuredBooks');
    
    if (featuredBooksContainer) {
        // Show loading state
        featuredBooksContainer.innerHTML = '<div class="loading">Loading featured books...</div>';
        
        // Simulate API call to get featured books
        setTimeout(() => {
            const featuredBooks = getFeaturedBooks();
            displayBooks(featuredBooks, featuredBooksContainer);
        }, 1000);
    }
}

// Load bestsellers
function loadBestsellers() {
    const bestsellersContainer = document.getElementById('bestsellersBooks');
    
    if (bestsellersContainer) {
        // Show loading state
        bestsellersContainer.innerHTML = '<div class="loading">Loading bestsellers...</div>';
        
        // Simulate API call to get bestsellers
        setTimeout(() => {
            const bestsellers = getBestsellers();
            displayBooks(bestsellers, bestsellersContainer);
        }, 1200);
    }
}

// Display books in grid
function displayBooks(books, container) {
    if (!books || books.length === 0) {
        container.innerHTML = '<p class="no-books">No books available at the moment.</p>';
        return;
    }

    const booksHTML = books.map(book => createBookCard(book)).join('');
    container.innerHTML = booksHTML;
    
    // Add event listeners to book cards
    addBookCardListeners();
}

// Create book card HTML
function createBookCard(book) {
    const discountBadge = book.discount_percentage > 0 ? 
        `<div class="book-badge">-${book.discount_percentage}%</div>` : '';
    
    const originalPrice = book.original_price && book.original_price > book.price ? 
        `<span class="original-price">$${book.original_price.toFixed(2)}</span>` : '';
    
    const discount = book.original_price && book.original_price > book.price ? 
        `<span class="discount">Save $${(book.original_price - book.price).toFixed(2)}</span>` : '';

    return `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-image">
                <img src="${book.cover_image_url || 'images/book-placeholder.jpg'}" alt="${book.title}">
                ${discountBadge}
            </div>
            <div class="book-content">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    <div class="stars">
                        ${generateStars(book.rating || 0)}
                    </div>
                    <span class="rating-text">(${book.review_count || 0} reviews)</span>
                </div>
                <div class="book-price">
                    <span class="current-price">$${book.price.toFixed(2)}</span>
                    ${originalPrice}
                    ${discount}
                </div>
                <div class="book-actions">
                    <button class="btn-add-cart" onclick="addToCart(${book.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist(${book.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Add event listeners to book cards
function addBookCardListeners() {
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.closest('.book-actions')) {
                return;
            }
            
            const bookId = this.dataset.bookId;
            window.location.href = `pages/book-details.html?id=${bookId}`;
        });
    });
}

// Cart functionality
function addToCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if book is already in cart
    const existingItem = cart.find(item => item.bookId === bookId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            bookId: bookId,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    showNotification('Book added to cart!', 'success');
}

// Wishlist functionality
function toggleWishlist(bookId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    const existingIndex = wishlist.indexOf(bookId);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('Book removed from wishlist!', 'info');
    } else {
        wishlist.push(bookId);
        showNotification('Book added to wishlist!', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

// Update cart count badge
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Update wishlist count badge
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// Check authentication status
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const ordersLink = document.getElementById('ordersLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (user) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (ordersLink) ordersLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (ordersLink) ordersLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Sample data functions (replace with actual API calls)
function getFeaturedBooks() {
    return [
        {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            price: 12.99,
            original_price: 15.99,
            discount_percentage: 19,
            rating: 4.5,
            review_count: 1250,
            cover_image_url: "images/book1.jpg"
        },
        {
            id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            price: 14.99,
            original_price: 14.99,
            discount_percentage: 0,
            rating: 4.8,
            review_count: 2100,
            cover_image_url: "images/book2.jpg"
        },
        {
            id: 3,
            title: "1984",
            author: "George Orwell",
            price: 11.99,
            original_price: 13.99,
            discount_percentage: 14,
            rating: 4.6,
            review_count: 1800,
            cover_image_url: "images/book3.jpg"
        },
        {
            id: 4,
            title: "The Catcher in the Rye",
            author: "J.D. Salinger",
            price: 13.99,
            original_price: 13.99,
            discount_percentage: 0,
            rating: 4.3,
            review_count: 950,
            cover_image_url: "images/book4.jpg"
        }
    ];
}

function getBestsellers() {
    return [
        {
            id: 5,
            title: "The Alchemist",
            author: "Paulo Coelho",
            price: 15.99,
            original_price: 18.99,
            discount_percentage: 16,
            rating: 4.7,
            review_count: 3200,
            cover_image_url: "images/book5.jpg"
        },
        {
            id: 6,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            price: 9.99,
            original_price: 12.99,
            discount_percentage: 23,
            rating: 4.4,
            review_count: 1600,
            cover_image_url: "images/book6.jpg"
        },
        {
            id: 7,
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            price: 16.99,
            original_price: 16.99,
            discount_percentage: 0,
            rating: 4.9,
            review_count: 2800,
            cover_image_url: "images/book7.jpg"
        },
        {
            id: 8,
            title: "The Lord of the Rings",
            author: "J.R.R. Tolkien",
            price: 24.99,
            original_price: 29.99,
            discount_percentage: 17,
            rating: 4.8,
            review_count: 3500,
            cover_image_url: "images/book8.jpg"
        }
    ];
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        font-size: 1rem;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .no-books {
        text-align: center;
        padding: 2rem;
        color: #666;
        font-style: italic;
    }
`;
document.head.appendChild(style); 