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

    // Load books from localStorage
    let books = localStorage.getItem('shelfOfBooks');
    let objOfBook = books ? JSON.parse(books) : [];

    // Filter books by category
    let filteredBooks = category ? objOfBook.filter(book => book.bookType === category) : objOfBook;

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
                <a class="btn btn-primary" href="${book.bookurl}" target="_blank">View Book</a>
            </div>
        </div>
    `;
} 