const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();

// Database connection
const db = new sqlite3.Database('./mcq_platform.db', (err) => {
  if (err) {
    console.error('Error opening database in admin routes:', err.message);
  }
});

const router = express.Router();

// Middleware to verify JWT token and admin role
const authenticateAdmin = (req, res, next) => {
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

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  });
};

// Get admin dashboard statistics
router.get('/dashboard-stats', authenticateAdmin, (req, res) => {
  const stats = {};

  // Get user statistics
  db.get(`
    SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
      COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as new_users_last_30_days
    FROM users
  `, [], (err, userStats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    stats.users = userStats;

    // Get quiz statistics
    db.get(`
      SELECT
        COUNT(*) as total_quizzes,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_quizzes,
        COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as new_quizzes_last_30_days
      FROM quizzes
    `, [], (err, quizStats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      stats.quizzes = quizStats;

      // Get question statistics
      db.get('SELECT COUNT(*) as total_questions FROM questions', [], (err, questionStats) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        stats.questions = questionStats;

        // Get quiz attempt statistics
        db.get(`
          SELECT
            COUNT(*) as total_attempts,
            AVG(score) as average_score,
            COUNT(DISTINCT user_id) as unique_participants
          FROM quiz_attempts
        `, [], (err, attemptStats) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          stats.attempts = attemptStats;

          res.json({ statistics: stats });
        });
      });
    });
  });
});

// Get all users (admin only)
router.get('/users', authenticateAdmin, (req, res) => {
  const { limit = 50, offset = 0, status, role } = req.query;

  let query = `
    SELECT id, name, email, role, status, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ users });
  });
});

// Update user status/role (admin only)
router.put('/users/:id', authenticateAdmin, [
  body('status').optional().isIn(['active', 'inactive', 'banned']).withMessage('Invalid status'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
], (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updates = [];
  const params = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);
  }

  if (role) {
    updates.push('role = ?');
    params.push(role);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating user' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  });
});

// Delete user (admin only)
router.delete('/users/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  // Prevent deleting the current admin user
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// Get all quiz attempts (admin only)
router.get('/quiz-attempts', authenticateAdmin, (req, res) => {
  const { limit = 50, offset = 0, quiz_id, user_id } = req.query;

  let query = `
    SELECT qa.*, q.title as quiz_title, u.name as user_name, u.email as user_email
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    JOIN users u ON qa.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (quiz_id) {
    query += ' AND qa.quiz_id = ?';
    params.push(quiz_id);
  }

  if (user_id) {
    query += ' AND qa.user_id = ?';
    params.push(user_id);
  }

  query += ' ORDER BY qa.completed_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, attempts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ attempts });
  });
});

// Create new category (admin only)
router.post('/categories', authenticateAdmin, [
  body('name').trim().isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('description').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

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

// Get all categories
router.get('/categories', authenticateAdmin, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ categories });
  });
});

// Update category
router.put('/categories/:id', authenticateAdmin, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('description').optional().trim()
], (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }

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
});

// Delete category
router.delete('/categories/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  // Check if category is being used
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

// System settings (placeholder for future implementation)
router.get('/settings', authenticateAdmin, (req, res) => {
  // In a real application, you might store settings in a settings table
  const settings = {
    siteTitle: 'MCQ Platform',
    siteDescription: 'Online MCQ testing platform',
    maintenanceMode: false,
    emailEnabled: true,
    maxQuizTime: 60,
    passwordMinLength: 6
  };

  res.json({ settings });
});

router.put('/settings', authenticateAdmin, (req, res) => {
  // Placeholder - in a real app, update settings in database
  res.json({ message: 'Settings updated successfully' });
});

module.exports = router;