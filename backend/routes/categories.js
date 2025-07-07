const express = require('express');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', adminAuth, async (req, res) => {
    try {
        const [categories] = await db.promise().query(`
            SELECT c.id, c.name, c.description, c.parent_id, c.created_at,
                   p.name as parent_name,
                   COUNT(b.id) as book_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            LEFT JOIN books b ON c.id = b.category_id
            GROUP BY c.id
            ORDER BY c.name
        `);

        const formattedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            parentId: category.parent_id,
            parentName: category.parent_name,
            bookCount: category.book_count,
            createdAt: category.created_at
        }));

        res.json(formattedCategories);

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new category
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, description, parentId } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Check if category name already exists
        const [existingCategories] = await db.promise().query(
            'SELECT id FROM categories WHERE name = ?',
            [name]
        );

        if (existingCategories.length > 0) {
            return res.status(400).json({ error: 'Category name already exists' });
        }

        // Insert category
        const [result] = await db.promise().query(
            'INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)',
            [name, description || null, parentId || null]
        );

        res.status(201).json({
            message: 'Category created successfully',
            category: {
                id: result.insertId,
                name,
                description,
                parentId,
                bookCount: 0
            }
        });

    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update category
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description, parentId } = req.body;

        // Check if category exists
        const [categories] = await db.promise().query(
            'SELECT id FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if new name conflicts with existing category
        if (name) {
            const [existingCategories] = await db.promise().query(
                'SELECT id FROM categories WHERE name = ? AND id != ?',
                [name, categoryId]
            );

            if (existingCategories.length > 0) {
                return res.status(400).json({ error: 'Category name already exists' });
            }
        }

        // Update category
        const updateFields = [];
        const updateValues = [];

        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (parentId !== undefined) {
            updateFields.push('parent_id = ?');
            updateValues.push(parentId);
        }

        if (updateFields.length > 0) {
            updateValues.push(categoryId);
            await db.promise().query(
                `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );
        }

        res.json({ message: 'Category updated successfully' });

    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete category
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check if category exists
        const [categories] = await db.promise().query(
            'SELECT id FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if category has books
        const [books] = await db.promise().query(
            'SELECT COUNT(*) as count FROM books WHERE category_id = ?',
            [categoryId]
        );

        if (books[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete category with books. Please reassign books first.' 
            });
        }

        // Check if category has subcategories
        const [subcategories] = await db.promise().query(
            'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
            [categoryId]
        );

        if (subcategories[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete category with subcategories. Please delete subcategories first.' 
            });
        }

        // Delete category
        await db.promise().query('DELETE FROM categories WHERE id = ?', [categoryId]);

        res.json({ message: 'Category deleted successfully' });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get category by ID
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const categoryId = req.params.id;

        const [categories] = await db.promise().query(`
            SELECT c.*, p.name as parent_name,
                   COUNT(b.id) as book_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            LEFT JOIN books b ON c.id = b.category_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [categoryId]);

        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const category = categories[0];
        res.json({
            id: category.id,
            name: category.name,
            description: category.description,
            parentId: category.parent_id,
            parentName: category.parent_name,
            bookCount: category.book_count,
            createdAt: category.created_at
        });

    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get category tree (hierarchical structure)
router.get('/tree/structure', adminAuth, async (req, res) => {
    try {
        const [categories] = await db.promise().query(`
            SELECT c.id, c.name, c.description, c.parent_id,
                   COUNT(b.id) as book_count
            FROM categories c
            LEFT JOIN books b ON c.id = b.category_id
            GROUP BY c.id
            ORDER BY c.name
        `);

        // Build tree structure
        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => cat.parent_id === parentId)
                .map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    description: cat.description,
                    bookCount: cat.book_count,
                    children: buildTree(cat.id)
                }));
        };

        const categoryTree = buildTree();

        res.json(categoryTree);

    } catch (error) {
        console.error('Get category tree error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 