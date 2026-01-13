const express = require('express');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();

// Database connection
const db = new sqlite3.Database('./mcq_platform.db', (err) => {
  if (err) {
    console.error('Error opening database in category routes:', err.message);
  }
});

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all categories
router.get('/', (req, res) => {
  db.all(`
    SELECT c.*,
           COUNT(q.id) as quiz_count
    FROM categories c
    LEFT JOIN quizzes q ON c.id = q.category_id
    GROUP BY c.id
    ORDER BY c.name
  `, [], (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ categories });
  });
});

// Get category by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT c.*,
           COUNT(q.id) as quiz_count
    FROM categories c
    LEFT JOIN quizzes q ON c.id = q.category_id
    WHERE c.id = ?
    GROUP BY c.id
  `, [id], (err, category) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get quizzes in this category
    db.all(`
      SELECT id, title, description, status, total_questions, time_limit, created_at
      FROM quizzes
      WHERE category_id = ? AND status = 'published'
      ORDER BY created_at DESC
    `, [id], (err, quizzes) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      category.quizzes = quizzes;
      res.json({ category });
    });
  });
});

// Create new category (admin only)
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('description').optional().trim()
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  // Check if category name already exists
  db.get('SELECT id FROM categories WHERE name = ?', [name], (err, existingCategory) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    db.run('INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating category' });
        }

        res.status(201).json({
          message: 'Category created successfully',
          categoryId: this.lastID
        });
      });
  });
});

// Update category (admin only)
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('description').optional().trim()
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  const { name, description } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updates = [];
  const params = [];

  if (name) {
    // Check if new name conflicts with existing category
    db.get('SELECT id FROM categories WHERE name = ? AND id != ?', [name, id], (err, existingCategory) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingCategory) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      updates.push('name = ?');
      params.push(name);
      executeUpdate();
    });
    return;
  }

  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }

  executeUpdate();

  function executeUpdate() {
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);
    const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating category' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category updated successfully' });
    });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  // Check if category is being used by quizzes
  db.get('SELECT COUNT(*) as count FROM quizzes WHERE category_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category that is being used by quizzes' });
    }

    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting category' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully' });
    });
  });
});

module.exports = router;