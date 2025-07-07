const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add new book (admin)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config (reuse from books.js)
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
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
        const allowedPdfType = /pdf/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (file.fieldname === 'coverImage') {
            if (allowedImageTypes.test(ext) && allowedImageTypes.test(file.mimetype)) {
                return cb(null, true);
            } else {
                return cb(new Error('Only image files are allowed for cover image'));
            }
        } else if (file.fieldname === 'bookPdf') {
            if (allowedPdfType.test(ext) && file.mimetype === 'application/pdf') {
                return cb(null, true);
            } else {
                return cb(new Error('Only PDF files are allowed for book PDF'));
            }
        }
        cb(new Error('Invalid file field'));
    }
});

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Find user by username
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE username = ? AND role = "admin"',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify admin token
router.post('/verify', adminAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [users] = await db.promise().query(
            'SELECT id, username, email, role FROM users WHERE id = ? AND role = "admin"',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.json({
            message: 'Token verified',
            admin: users[0]
        });

    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/books
router.post('/books', adminAuth, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookPdf', maxCount: 1 }
]), async (req, res) => {
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
        if (req.files && req.files['coverImage'] && req.files['coverImage'][0]) {
            coverImageUrl = `/uploads/books/${req.files['coverImage'][0].filename}`;
        }
        // Handle book PDF
        let pdfUrl = null;
        if (req.files && req.files['bookPdf'] && req.files['bookPdf'][0]) {
            pdfUrl = `/uploads/books/${req.files['bookPdf'][0].filename}`;
        }
        // Insert book
        const [bookResult] = await db.promise().query(`
            INSERT INTO books (
                isbn, title, description, price, stock_quantity, publication_date,
                language, page_count, format, cover_image_url, pdf_url, category_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            pdfUrl,
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
                coverImage: coverImageUrl,
                pdfUrl: pdfUrl
            }
        });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/users
router.post('/users', adminAuth, async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Username, email, password, and role are required' });
        }
        // Check if username or email exists
        const [existingUsers] = await db.promise().query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        // Insert user
        const [userResult] = await db.promise().query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, role]
        );
        const userId = userResult.insertId;
        // Optionally insert into customers table if role is customer
        if (role === 'customer') {
            await db.promise().query(
                'INSERT INTO customers (user_id, first_name, last_name) VALUES (?, ?, ?)',
                [userId, firstName || '', lastName || '']
            );
        }
        res.status(201).json({
            message: 'User added successfully',
            user: {
                id: userId,
                username,
                email,
                role,
                firstName: firstName || '',
                lastName: lastName || ''
            }
        });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get total users
        const [userCount] = await db.promise().query(
            'SELECT COUNT(*) as count FROM users WHERE role = "customer"'
        );

        // Get total books
        const [bookCount] = await db.promise().query(
            'SELECT COUNT(*) as count FROM books'
        );

        // Get total orders
        const [orderCount] = await db.promise().query(
            'SELECT COUNT(*) as count FROM orders'
        );

        // Get total revenue
        const [revenue] = await db.promise().query(
            'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != "cancelled"'
        );

        // Get recent orders
        const [recentOrders] = await db.promise().query(`
            SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
                   CONCAT(c.first_name, ' ', c.last_name) as customerName
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        // Get recent users
        const [recentUsers] = await db.promise().query(`
            SELECT u.id, u.username, u.email, u.created_at,
                   CONCAT(c.first_name, ' ', c.last_name) as firstName, c.last_name as lastName
            FROM users u
            LEFT JOIN customers c ON u.id = c.user_id
            WHERE u.role = 'customer'
            ORDER BY u.created_at DESC
            LIMIT 5
        `);

        res.json({
            stats: {
                totalUsers: userCount[0].count,
                totalBooks: bookCount[0].count,
                totalOrders: orderCount[0].count,
                totalRevenue: parseFloat(revenue[0].total)
            },
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                customerName: order.customerName,
                total: order.total_amount,
                status: order.status,
                createdAt: order.created_at
            })),
            recentUsers: recentUsers.map(user => ({
                id: user.id,
                firstName: user.firstName || user.username,
                lastName: user.lastName || '',
                email: user.email,
                status: 'active',
                createdAt: user.created_at
            }))
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 