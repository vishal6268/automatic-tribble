const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();

// Database connection
const db = new sqlite3.Database('./mcq_platform.db', (err) => {
  if (err) {
    console.error('Error opening database in user routes:', err.message);
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

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  db.get(`
    SELECT id, name, email, role, status, created_at
    FROM users
    WHERE id = ?
  `, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  });
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email } = req.body;
  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (email) {
    // Check if email is already taken by another user
    db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id], (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      updates.push('email = ?');
      params.push(email);
      executeUpdate();
    });
    return;
  }

  executeUpdate();

  function executeUpdate() {
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.user.id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating profile' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully' });
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user
    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, req.user.id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error updating password' });
          }

          res.json({ message: 'Password changed successfully' });
        });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's quiz attempts
router.get('/quiz-attempts', authenticateToken, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  db.all(`
    SELECT qa.*, q.title as quiz_title, q.total_questions
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = ?
    ORDER BY qa.completed_at DESC
    LIMIT ? OFFSET ?
  `, [req.user.id, parseInt(limit), parseInt(offset)], (err, attempts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ attempts });
  });
});

// Get user's quiz statistics
router.get('/statistics', authenticateToken, (req, res) => {
  // Get total quizzes taken
  db.get(`
    SELECT COUNT(*) as total_attempts,
           AVG(score) as average_score,
           MAX(score) as highest_score,
           SUM(time_taken) as total_time
    FROM quiz_attempts
    WHERE user_id = ?
  `, [req.user.id], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get recent performance
    db.all(`
      SELECT q.title, qa.score, qa.total_questions, qa.completed_at
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ?
      ORDER BY qa.completed_at DESC
      LIMIT 5
    `, [req.user.id], (err, recentAttempts) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        statistics: {
          totalAttempts: stats.total_attempts || 0,
          averageScore: Math.round(stats.average_score || 0),
          highestScore: stats.highest_score || 0,
          totalTimeSpent: stats.total_time || 0
        },
        recentAttempts
      });
    });
  });
});

// Store quiz selection in user history
router.post('/quiz-history', authenticateToken, (req, res) => {
  const { quizId } = req.body;
  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID required' });
  }
  db.run(`INSERT INTO user_quiz_history (user_id, quiz_id, started_at) VALUES (?, ?, datetime('now'))`,
    [req.user.id, quizId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, historyId: this.lastID });
    }
  );
});

module.exports = router;