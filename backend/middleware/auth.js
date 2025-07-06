const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Verify admin role
const verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const [rows] = await db.promise().query(
            'SELECT role FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Combined middleware for admin routes
const adminAuth = [verifyToken, verifyAdmin];

module.exports = {
    verifyToken,
    verifyAdmin,
    adminAuth
}; 