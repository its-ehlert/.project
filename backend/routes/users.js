const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/', adminAuth, async (req, res) => {
    try {
        const [users] = await db.promise().query(`
            SELECT u.id, u.username, u.email, u.role, u.created_at,
                   CONCAT(c.first_name, ' ', c.last_name) as firstName, c.last_name as lastName,
                   c.phone, c.date_of_birth, c.gender
            FROM users u
            LEFT JOIN customers c ON u.id = c.user_id
            WHERE u.role = 'customer'
            ORDER BY u.created_at DESC
        `);

        const formattedUsers = users.map(user => ({
            id: user.id,
            firstName: user.firstName || user.username,
            lastName: user.lastName || '',
            email: user.email,
            role: user.role,
            status: 'active', // You can add a status field to users table
            createdAt: user.created_at,
            avatar: null // You can add avatar field to users table
        }));

        res.json(formattedUsers);

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new user
router.post('/', adminAuth, async (req, res) => {
    try {
        const { firstName, lastName, email, password, role = 'customer' } = req.body;

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
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        const userId = userResult.insertId;

        // Insert customer profile
        await db.promise().query(
            'INSERT INTO customers (user_id, first_name, last_name) VALUES (?, ?, ?)',
            [userId, firstName, lastName]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: userId,
                firstName,
                lastName,
                email,
                role,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const { firstName, lastName, email, role, status } = req.body;

        // Check if user exists
        const [users] = await db.promise().query(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user
        if (email) {
            await db.promise().query(
                'UPDATE users SET email = ?, role = ? WHERE id = ?',
                [email, role, userId]
            );
        }

        // Update customer profile
        if (firstName || lastName) {
            await db.promise().query(
                'UPDATE customers SET first_name = ?, last_name = ? WHERE user_id = ?',
                [firstName, lastName, userId]
            );
        }

        res.json({ message: 'User updated successfully' });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const [users] = await db.promise().query(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user (this will cascade to customer profile due to foreign key)
        await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;

        const [users] = await db.promise().query(`
            SELECT u.id, u.username, u.email, u.role, u.created_at,
                   c.first_name, c.last_name, c.phone, c.date_of_birth, c.gender
            FROM users u
            LEFT JOIN customers c ON u.id = c.user_id
            WHERE u.id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        res.json({
            id: user.id,
            firstName: user.first_name || user.username,
            lastName: user.last_name || '',
            email: user.email,
            role: user.role,
            phone: user.phone,
            dateOfBirth: user.date_of_birth,
            gender: user.gender,
            createdAt: user.created_at
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 