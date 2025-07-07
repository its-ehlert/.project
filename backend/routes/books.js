const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/books');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all books
router.get('/', adminAuth, async (req, res) => {
    try {
        const [books] = await db.promise().query(`
            SELECT b.id, b.isbn, b.title, b.description, b.price, b.original_price,
                   b.discount_percentage, b.stock_quantity, b.publication_date,
                   b.language, b.page_count, b.format, b.cover_image_url,
                   b.created_at, b.updated_at,
                   c.name as category_name,
                   p.name as publisher_name
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN publishers p ON b.publisher_id = p.id
            ORDER BY b.created_at DESC
        `);

        const formattedBooks = books.map(book => ({
            id: book.id,
            isbn: book.isbn,
            title: book.title,
            author: 'Unknown', // You can join with book_authors table
            category: book.category_name || 'Uncategorized',
            price: book.price,
            stock: book.stock_quantity,
            status: book.stock_quantity > 0 ? 'active' : 'inactive',
            coverImage: book.cover_image_url,
            description: book.description,
            publicationDate: book.publication_date,
            language: book.language,
            pageCount: book.page_count,
            format: book.format,
            createdAt: book.created_at
        }));

        res.json(formattedBooks);

    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new book
router.post('/', adminAuth, upload.single('coverImage'), async (req, res) => {
    try {
        const {
            title,
            author,
            category,
            price,
            stock,
            description,
            isbn,
            publicationDate,
            language,
            pageCount,
            format
        } = req.body;

        if (!title || !author || !price || !stock) {
            return res.status(400).json({ error: 'Title, author, price, and stock are required' });
        }

        // Check if ISBN already exists
        if (isbn) {
            const [existingBooks] = await db.promise().query(
                'SELECT id FROM books WHERE isbn = ?',
                [isbn]
            );

            if (existingBooks.length > 0) {
                return res.status(400).json({ error: 'ISBN already exists' });
            }
        }

        // Get or create category
        let categoryId = null;
        if (category) {
            const [categories] = await db.promise().query(
                'SELECT id FROM categories WHERE name = ?',
                [category]
            );

            if (categories.length > 0) {
                categoryId = categories[0].id;
            } else {
                const [newCategory] = await db.promise().query(
                    'INSERT INTO categories (name) VALUES (?)',
                    [category]
                );
                categoryId = newCategory.insertId;
            }
        }

        // Get or create author
        let authorId = null;
        const [authors] = await db.promise().query(
            'SELECT id FROM authors WHERE CONCAT(first_name, " ", last_name) = ?',
            [author]
        );

        if (authors.length > 0) {
            authorId = authors[0].id;
        } else {
            const nameParts = author.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const [newAuthor] = await db.promise().query(
                'INSERT INTO authors (first_name, last_name) VALUES (?, ?)',
                [firstName, lastName]
            );
            authorId = newAuthor.insertId;
        }

        // Handle cover image
        let coverImageUrl = null;
        if (req.file) {
            coverImageUrl = `/uploads/books/${req.file.filename}`;
        }

        // Insert book
        const [bookResult] = await db.promise().query(`
            INSERT INTO books (
                isbn, title, description, price, stock_quantity, publication_date,
                language, page_count, format, cover_image_url, category_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            isbn || null,
            title,
            description || null,
            price,
            stock,
            publicationDate || null,
            language || 'English',
            pageCount || null,
            format || 'paperback',
            coverImageUrl,
            categoryId
        ]);

        const bookId = bookResult.insertId;

        // Link book with author
        if (authorId) {
            await db.promise().query(
                'INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)',
                [bookId, authorId]
            );
        }

        res.status(201).json({
            message: 'Book added successfully',
            book: {
                id: bookId,
                title,
                author,
                category,
                price,
                stock,
                coverImage: coverImageUrl
            }
        });

    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update book
router.put('/:id', adminAuth, upload.single('coverImage'), async (req, res) => {
    try {
        const bookId = req.params.id;
        const {
            title,
            author,
            category,
            price,
            stock,
            description,
            isbn,
            publicationDate,
            language,
            pageCount,
            format
        } = req.body;

        // Check if book exists
        const [books] = await db.promise().query(
            'SELECT id FROM books WHERE id = ?',
            [bookId]
        );

        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Update book
        const updateFields = [];
        const updateValues = [];

        if (title) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }
        if (price) {
            updateFields.push('price = ?');
            updateValues.push(price);
        }
        if (stock !== undefined) {
            updateFields.push('stock_quantity = ?');
            updateValues.push(stock);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (isbn) {
            updateFields.push('isbn = ?');
            updateValues.push(isbn);
        }
        if (publicationDate) {
            updateFields.push('publication_date = ?');
            updateValues.push(publicationDate);
        }
        if (language) {
            updateFields.push('language = ?');
            updateValues.push(language);
        }
        if (pageCount) {
            updateFields.push('page_count = ?');
            updateValues.push(pageCount);
        }
        if (format) {
            updateFields.push('format = ?');
            updateValues.push(format);
        }

        // Handle cover image
        if (req.file) {
            const coverImageUrl = `/uploads/books/${req.file.filename}`;
            updateFields.push('cover_image_url = ?');
            updateValues.push(coverImageUrl);
        }

        if (updateFields.length > 0) {
            updateValues.push(bookId);
            await db.promise().query(
                `UPDATE books SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );
        }

        res.json({ message: 'Book updated successfully' });

    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete book
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const bookId = req.params.id;

        // Check if book exists
        const [books] = await db.promise().query(
            'SELECT id, cover_image_url FROM books WHERE id = ?',
            [bookId]
        );

        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Delete cover image if exists
        if (books[0].cover_image_url) {
            const imagePath = path.join(__dirname, '..', books[0].cover_image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete book (this will cascade to related tables)
        await db.promise().query('DELETE FROM books WHERE id = ?', [bookId]);

        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get book by ID
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const bookId = req.params.id;

        const [books] = await db.promise().query(`
            SELECT b.*, c.name as category_name, p.name as publisher_name
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN publishers p ON b.publisher_id = p.id
            WHERE b.id = ?
        `, [bookId]);

        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const book = books[0];
        res.json({
            id: book.id,
            isbn: book.isbn,
            title: book.title,
            description: book.description,
            price: book.price,
            stock: book.stock_quantity,
            category: book.category_name,
            publisher: book.publisher_name,
            coverImage: book.cover_image_url,
            publicationDate: book.publication_date,
            language: book.language,
            pageCount: book.page_count,
            format: book.format,
            createdAt: book.created_at
        });

    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 