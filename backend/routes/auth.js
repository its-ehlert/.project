const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user by email
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE email = ? AND role = "customer"',
            [email]
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

        // Get customer profile
        const [customers] = await db.promise().query(
            'SELECT * FROM customers WHERE user_id = ?',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: customers[0]?.first_name || '',
                lastName: customers[0]?.last_name || '',
                role: user.role
            }
        });

    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User registration
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email already exists
        const [existingUsers] = await db.promise().query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate username from email
        const username = email.split('@')[0];

        // Insert user
        const [userResult] = await db.promise().query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, "customer")',
            [username, email, hashedPassword]
        );

        const userId = userResult.insertId;

        // Insert customer profile
        await db.promise().query(
            'INSERT INTO customers (user_id, first_name, last_name) VALUES (?, ?, ?)',
            [userId, firstName, lastName]
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: userId, 
                email: email, 
                role: 'customer' 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                role: 'customer'
            }
        });

    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token
router.post('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user details
        const [users] = await db.promise().query(
            'SELECT id, email, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Token verified',
            user: users[0]
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router; 