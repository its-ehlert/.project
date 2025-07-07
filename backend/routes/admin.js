const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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