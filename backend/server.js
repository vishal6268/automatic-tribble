const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Database setup
const db = new sqlite3.Database('./mcq_platform.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Keep database connection alive
db.configure('busyTimeout', 5000);

// Initialize database tables
function initializeDatabase() {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Categories table
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Quizzes table
    `CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      created_by INTEGER,
      status TEXT DEFAULT 'draft',
      time_limit INTEGER,
      total_questions INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id),
      FOREIGN KEY (created_by) REFERENCES users (id)
    )`,

    // Questions table
    `CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER,
      question_text TEXT NOT NULL,
      question_type TEXT DEFAULT 'multiple_choice',
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      points INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
    )`,

    // Quiz attempts table
    `CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      quiz_id INTEGER,
      score INTEGER DEFAULT 0,
      total_questions INTEGER,
      time_taken INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
    )`,

    // User answers table
    `CREATE TABLE IF NOT EXISTS user_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER,
      question_id INTEGER,
      user_answer TEXT,
      is_correct BOOLEAN,
      points_earned INTEGER DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id),
      FOREIGN KEY (question_id) REFERENCES questions (id)
    )`,

    // User quiz history table
    `CREATE TABLE IF NOT EXISTS user_quiz_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      quiz_id INTEGER,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
    )`
  ];

  let completed = 0;
  const total = tables.length;

  tables.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('Error creating table:', err.message);
      }
      completed++;
      if (completed === total) {
        seedDatabase();
      }
    });
  });

  function seedDatabase() {
    const bcrypt = require('bcryptjs');
    const adminPassword = bcrypt.hashSync('admin123', 10);
    let seedCompleted = 0;
    const seedTotal = 5; // 1 admin + 4 categories

    // Insert default admin user
    db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Admin', 'admin@mcqplatform.com', adminPassword, 'admin'], (err) => {
        if (err) {
          console.error('Error seeding admin user:', err.message);
        }
        seedCompleted++;
        if (seedCompleted === seedTotal) {
          console.log('Database seeding completed.');
          // Initialize routes after database is ready
          setTimeout(initializeRoutes, 100);
        }
      });

    // Insert default categories
    const categories = [
      ['Programming', 'Programming and coding related questions'],
      ['Mathematics', 'Math problems and concepts'],
      ['Science', 'General science questions'],
      ['General Knowledge', 'General knowledge and trivia']
    ];

    categories.forEach(([name, description]) => {
      db.run(`INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)`,
        [name, description], (err) => {
          if (err) {
            console.error('Error seeding category:', err.message);
          }
          seedCompleted++;
          if (seedCompleted === seedTotal) {
            console.log('Database seeding completed.');
            // Initialize routes after database is ready
            setTimeout(initializeRoutes, 100);
          }
        });
    });
  }
}

// Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizzes');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const leaderboardRoutes = require('./routes/leaderboard');

function initializeRoutes() {
  app.use('/api/auth', authRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  // Serve React app for any unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Ready to accept requests.');
  });
  
  // Log server events
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });
  
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, closing database...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Export db for use in routes
module.exports = { db };