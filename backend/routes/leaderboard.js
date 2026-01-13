const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mcq_platform.db');

// Get leaderboard with user stats
router.get('/leaderboard', (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(DISTINCT qa.quiz_id) as quizzes_attempted,
      COUNT(DISTINCT qa.id) as total_attempts,
      ROUND(AVG(CAST(qa.score AS FLOAT) / NULLIF(qa.total_questions, 0) * 100), 2) as average_accuracy,
      SUM(qa.score) as total_score,
      ROUND(AVG(qa.time_taken), 0) as avg_time_taken,
      MAX(qa.completed_at) as last_attempt
    FROM users u
    LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
    WHERE u.role = 'user'
    GROUP BY u.id, u.name, u.email
    ORDER BY total_score DESC, average_accuracy DESC
    LIMIT 100
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching leaderboard:', err.message);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
    res.json({ leaderboard: rows || [] });
  });
});

// Get user quiz history with details
router.get('/user-quiz-history/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT 
      qa.id as attempt_id,
      q.id as quiz_id,
      q.title as quiz_title,
      c.name as category,
      qa.score,
      qa.total_questions,
      ROUND(CAST(qa.score AS FLOAT) / NULLIF(qa.total_questions, 0) * 100, 2) as accuracy,
      qa.time_taken,
      qa.completed_at,
      CASE 
        WHEN (CAST(qa.score AS FLOAT) / NULLIF(qa.total_questions, 0) * 100) >= 80 THEN 'Pass'
        WHEN (CAST(qa.score AS FLOAT) / NULLIF(qa.total_questions, 0) * 100) >= 50 THEN 'Moderate'
        ELSE 'Fail'
      END as result
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    LEFT JOIN categories c ON q.category_id = c.id
    WHERE qa.user_id = ?
    ORDER BY qa.completed_at DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching user quiz history:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user quiz history' });
    }
    res.json({ quizHistory: rows || [] });
  });
});

// Get quiz participation stats
router.get('/quiz-stats', (req, res) => {
  const query = `
    SELECT 
      q.id,
      q.title,
      c.name as category,
      COUNT(DISTINCT qa.user_id) as total_participants,
      ROUND(AVG(CAST(qa.score AS FLOAT) / NULLIF(qa.total_questions, 0) * 100), 2) as avg_accuracy,
      ROUND(AVG(qa.time_taken), 0) as avg_time_taken,
      COUNT(qa.id) as total_attempts
    FROM quizzes q
    LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
    LEFT JOIN categories c ON q.category_id = c.id
    WHERE q.status = 'Published'
    GROUP BY q.id, q.title, c.name
    ORDER BY total_participants DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching quiz stats:', err.message);
      return res.status(500).json({ error: 'Failed to fetch quiz stats' });
    }
    res.json({ quizStats: rows || [] });
  });
});

// Get overall platform stats
router.get('/platform-stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT q.id) as total_quizzes,
      COUNT(DISTINCT qa.id) as total_attempts,
      ROUND(AVG(CAST(qa.score AS FLOAT) / NULLIF(qa.total_questions, 0) * 100), 2) as overall_accuracy,
      ROUND(AVG(qa.time_taken), 0) as avg_time_per_attempt
    FROM users u
    CROSS JOIN quizzes q
    LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = u.id
    WHERE u.role = 'user' AND q.status = 'Published'
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching platform stats:', err.message);
      return res.status(500).json({ error: 'Failed to fetch platform stats' });
    }
    res.json({ stats: rows[0] || {} });
  });
});

module.exports = router;
