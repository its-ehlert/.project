// category.js - Display books by category from localStorage

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    const booksGrid = document.getElementById('booksGrid');
    const resultsCount = document.getElementById('resultsCount');

    if (category) {
        categoryTitle.textContent = category;
        categoryBreadcrumb.textContent = category;
    }

    // Use window.booksData instead of localStorage
    let objOfBook = window.booksData || [];

    // Filter books by category
    let filteredBooks = category ? objOfBook.filter(book => book.category === category || book.bookType === category) : objOfBook;

    // Display books
    if (filteredBooks.length === 0) {
        booksGrid.innerHTML = '<p class="no-books">No books found in this category.</p>';
        resultsCount.textContent = 'Showing 0 results';
    } else {
        booksGrid.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
        resultsCount.textContent = `Showing ${filteredBooks.length} result${filteredBooks.length > 1 ? 's' : ''}`;
    }
});

function createBookCard(book) {
    return `
        <div class="book-card">
            <div class="book-image">
                <img src="${book.coverImage || '../images/book-placeholder.jpg'}" alt="${book.book}">
            </div>
            <div class="book-content">
                <h3 class="book-title">${book.book}</h3>
                <p class="book-author">by ${book.bookauthor}</p>
                <p class="book-category">${book.bookType}</p>
                <button class="btn-add-cart icon-only" onclick="addToCartFromCategory(this, '${book.id}')" title="Add to Cart">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `;
}

// Add this function to handle adding to cart from category page
function addToCartFromCategory(btn, bookId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.bookId == bookId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ bookId: bookId, quantity: 1, addedAt: new Date().toISOString() });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 1000);
    if (typeof updateCartCount === 'function') updateCartCount();
} 