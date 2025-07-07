const express = require('express');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all orders
router.get('/', adminAuth, async (req, res) => {
    try {
        const [orders] = await db.promise().query(`
            SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_status,
                   o.created_at, o.updated_at,
                   CONCAT(c.first_name, ' ', c.last_name) as customerName,
                   COUNT(oi.id) as itemCount
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);

        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.order_number,
            customerName: order.customerName,
            total: order.total_amount,
            status: order.status,
            paymentStatus: order.payment_status,
            itemCount: order.itemCount,
            createdAt: order.created_at,
            updatedAt: order.updated_at
        }));

        res.json(formattedOrders);

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get order by ID with details
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const orderId = req.params.id;

        // Get order details
        const [orders] = await db.promise().query(`
            SELECT o.*, CONCAT(c.first_name, ' ', c.last_name) as customerName,
                   c.email, c.phone
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?
        `, [orderId]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        // Get order items
        const [orderItems] = await db.promise().query(`
            SELECT oi.*, b.title, b.cover_image_url
            FROM order_items oi
            JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ?
        `, [orderId]);

        res.json({
            id: order.id,
            orderNumber: order.order_number,
            customerName: order.customerName,
            customerEmail: order.email,
            customerPhone: order.phone,
            total: order.total_amount,
            subtotal: order.subtotal,
            tax: order.tax_amount,
            shipping: order.shipping_amount,
            discount: order.discount_amount,
            status: order.status,
            paymentStatus: order.payment_status,
            notes: order.notes,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            items: orderItems.map(item => ({
                id: item.id,
                bookTitle: item.title,
                coverImage: item.cover_image_url,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                totalPrice: item.total_price
            }))
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update order status
router.patch('/:id/status', adminAuth, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, paymentStatus } = req.body;

        if (!status && !paymentStatus) {
            return res.status(400).json({ error: 'Status or payment status required' });
        }

        // Check if order exists
        const [orders] = await db.promise().query(
            'SELECT id FROM orders WHERE id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order
        const updateFields = [];
        const updateValues = [];

        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }

        if (paymentStatus) {
            updateFields.push('payment_status = ?');
            updateValues.push(paymentStatus);
        }

        updateValues.push(orderId);
        await db.promise().query(
            `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.json({ message: 'Order status updated successfully' });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get order statistics
router.get('/stats/summary', adminAuth, async (req, res) => {
    try {
        // Total orders
        const [totalOrders] = await db.promise().query(
            'SELECT COUNT(*) as count FROM orders'
        );

        // Orders by status
        const [ordersByStatus] = await db.promise().query(`
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
        `);

        // Revenue by month (last 6 months)
        const [revenueByMonth] = await db.promise().query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
                   SUM(total_amount) as revenue,
                   COUNT(*) as orderCount
            FROM orders
            WHERE status != 'cancelled'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);

        res.json({
            totalOrders: totalOrders[0].count,
            ordersByStatus: ordersByStatus,
            revenueByMonth: revenueByMonth
        });

    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 