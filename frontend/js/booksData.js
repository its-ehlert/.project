// Central book data for the entire frontend
(function() {
  const LS_KEY = 'booksData';
  const defaultBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: "Fiction",
      price: 1754,
      original_price: 2159,
      discount_percentage: 19,
      rating: 4.5,
      review_count: 1250,
      cover_image_url: "images/book1.jpg"
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      category: "Fiction",
      price: 2024,
      original_price: 2024,
      discount_percentage: 0,
      rating: 4.8,
      review_count: 2100,
      cover_image_url: "images/book2.jpg"
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      category: "Fiction",
      price: 1619,
      original_price: 1889,
      discount_percentage: 14,
      rating: 4.6,
      review_count: 1800,
      cover_image_url: "images/book3.jpg"
    },
    {
      id: 4,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      category: "Fiction",
      price: 1889,
      original_price: 1889,
      discount_percentage: 0,
      rating: 4.3,
      review_count: 950,
      cover_image_url: "images/book4.jpg"
    }
    // Add more book objects here as needed
  ];

  function loadBooksData() {
    const ls = localStorage.getItem(LS_KEY);
    if (ls) {
      try {
        return JSON.parse(ls);
      } catch (e) {
        return defaultBooks;
      }
    }
    // Save default to localStorage if not present
    localStorage.setItem(LS_KEY, JSON.stringify(defaultBooks));
    return defaultBooks;
  }

  function syncBooksDataToLocalStorage() {
    localStorage.setItem(LS_KEY, JSON.stringify(window.booksData));
  }

  window.booksData = loadBooksData();
  window.syncBooksDataToLocalStorage = syncBooksDataToLocalStorage;
})(); 