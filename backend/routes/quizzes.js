const express = require('express');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();

// Database connection
const db = new sqlite3.Database('./mcq_platform.db', (err) => {
  if (err) {
    console.error('Error opening database in quiz routes:', err.message);
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

// Get all quizzes
router.get('/', (req, res) => {
  const { category, status, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT q.*, c.name as category_name, u.name as creator_name
    FROM quizzes q
    LEFT JOIN categories c ON q.category_id = c.id
    LEFT JOIN users u ON q.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ' AND q.category_id = ?';
    params.push(category);
  }

  if (status) {
    query += ' AND q.status = ?';
    params.push(status);
  }

  query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, quizzes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Map category_name to category for frontend compatibility
    const mappedQuizzes = quizzes.map(q => ({
      ...q,
      category: q.category_name
    }));

    res.json({ quizzes: mappedQuizzes });
  });
});

// Get quiz by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT q.*, c.name as category_name, u.name as creator_name
    FROM quizzes q
    LEFT JOIN categories c ON q.category_id = c.id
    LEFT JOIN users u ON q.created_by = u.id
    WHERE q.id = ?
  `, [id], (err, quiz) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get questions for this quiz
    db.all('SELECT * FROM questions WHERE quiz_id = ? ORDER BY id', [id], (err, questions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      quiz.questions = questions;
      res.json({ quiz });
    });
  });
});

// Get questions for a quiz
router.get('/:id/questions', (req, res) => {
  const { id } = req.params;

  db.all('SELECT * FROM questions WHERE quiz_id = ? ORDER BY id', [id], (err, questions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ questions });
  });
});

// Create new quiz (authenticated users only)
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim(),
  body('category_id').optional().isInt().withMessage('Invalid category ID'),
  body('time_limit').optional().isInt({ min: 1 }).withMessage('Time limit must be positive')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, category_id, time_limit } = req.body;
  const created_by = req.user.id;

  db.run(`
    INSERT INTO quizzes (title, description, category_id, created_by, time_limit)
    VALUES (?, ?, ?, ?, ?)
  `, [title, description, category_id, created_by, time_limit], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating quiz' });
    }

    res.status(201).json({
      message: 'Quiz created successfully',
      quizId: this.lastID
    });
  });
});

// Update quiz
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, category_id, status, time_limit } = req.body;

  // Check if user owns the quiz or is admin
  const canEdit = req.user.role === 'admin' ?
    '1=1' : 'created_by = ?';
  const params = req.user.role === 'admin' ? [] : [req.user.id];

  db.get(`SELECT id FROM quizzes WHERE id = ? AND (${canEdit})`, [id, ...params], (err, quiz) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!quiz) {
      return res.status(403).json({ error: 'Not authorized to edit this quiz' });
    }

    const updateFields = [];
    const updateParams = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateParams.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateParams.push(description);
    }
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateParams.push(category_id);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }
    if (time_limit !== undefined) {
      updateFields.push('time_limit = ?');
      updateParams.push(time_limit);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `UPDATE quizzes SET ${updateFields.join(', ')} WHERE id = ?`;
    updateParams.push(id);

    db.run(query, updateParams, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating quiz' });
      }

      res.json({ message: 'Quiz updated successfully' });
    });
  });
});

// Delete quiz
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Check if user owns the quiz or is admin
  const canDelete = req.user.role === 'admin' ?
    '1=1' : 'created_by = ?';
  const params = req.user.role === 'admin' ? [] : [req.user.id];

  db.get(`SELECT id FROM quizzes WHERE id = ? AND (${canDelete})`, [id, ...params], (err, quiz) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!quiz) {
      return res.status(403).json({ error: 'Not authorized to delete this quiz' });
    }

    // Delete questions first
    db.run('DELETE FROM questions WHERE quiz_id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting questions' });
      }

      // Delete quiz
      db.run('DELETE FROM quizzes WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error deleting quiz' });
        }

        res.json({ message: 'Quiz deleted successfully' });
      });
    });
  });
});

// Add question to quiz
router.post('/:id/questions', authenticateToken, [
  body('question_text').trim().isLength({ min: 10 }).withMessage('Question must be at least 10 characters'),
  body('correct_answer').trim().notEmpty().withMessage('Correct answer is required'),
  body('options').optional().isArray().withMessage('Options must be an array'),
  body('points').optional().isInt({ min: 1 }).withMessage('Points must be positive')
], (req, res) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { question_text, options, correct_answer, explanation, points = 1 } = req.body;

  // Check if user owns the quiz or is admin
  const canEdit = req.user.role === 'admin' ?
    '1=1' : 'created_by = ?';
  const params = req.user.role === 'admin' ? [] : [req.user.id];

  db.get(`SELECT id FROM quizzes WHERE id = ? AND (${canEdit})`, [id, ...params], (err, quiz) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!quiz) {
      return res.status(403).json({ error: 'Not authorized to add questions to this quiz' });
    }

    const optionsJson = options ? JSON.stringify(options) : null;

    db.run(`
      INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation, points)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, question_text, optionsJson, correct_answer, explanation, points], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error adding question' });
      }

      // Update quiz question count
      db.run('UPDATE quizzes SET total_questions = total_questions + 1 WHERE id = ?', [id]);

      res.status(201).json({
        message: 'Question added successfully',
        questionId: this.lastID
      });
    });
  });
});

// Submit quiz attempt
router.post('/:id/attempt', authenticateToken, [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('time_taken').optional().isInt().withMessage('Time taken must be a number')
], (req, res) => {
  const { id } = req.params;
  const { answers, time_taken } = req.body;
  const user_id = req.user.id;

  // Get quiz questions
  db.all('SELECT * FROM questions WHERE quiz_id = ?', [id], (err, questions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!questions.length) {
      return res.status(400).json({ error: 'Quiz has no questions' });
    }

    let score = 0;
    const userAnswers = [];

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.question_id);
      if (question) {
        const isCorrect = question.correct_answer.toLowerCase() === answer.user_answer.toLowerCase();
        if (isCorrect) {
          score += question.points;
        }
        userAnswers.push({
          question_id: answer.question_id,
          user_answer: answer.user_answer,
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : 0
        });
      }
    });

    // Insert quiz attempt
    db.run(`
      INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, time_taken)
      VALUES (?, ?, ?, ?, ?)
    `, [user_id, id, score, questions.length, time_taken], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error saving quiz attempt' });
      }

      const attemptId = this.lastID;

      // Insert user answers
      const answerInserts = userAnswers.map(answer =>
        new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO user_answers (attempt_id, question_id, user_answer, is_correct, points_earned)
            VALUES (?, ?, ?, ?, ?)
          `, [attemptId, answer.question_id, answer.user_answer, answer.is_correct, answer.points_earned], (err) => {
            if (err) reject(err);
            else resolve();
          });
        })
      );

      Promise.all(answerInserts).then(() => {
        res.json({
          message: 'Quiz submitted successfully',
          score,
          totalQuestions: questions.length,
          percentage: Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100)
        });
      }).catch(err => {
        res.status(500).json({ error: 'Error saving answers' });
      });
    });
  });
});

// Get quiz results for user
router.get('/:id/results', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.all(`
    SELECT qa.*, q.title, q.total_questions, q.time_limit
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.quiz_id = ? AND qa.user_id = ?
    ORDER BY qa.completed_at DESC
  `, [id, user_id], (err, attempts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ attempts });
  });
});

module.exports = router;