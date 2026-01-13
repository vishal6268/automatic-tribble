const sqlite3 = require('sqlite3').verbose();

// Single database connection for all routes
let db = null;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database('./mcq_platform.db', (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      }
    });
  }
  return db;
}

module.exports = { getDatabase };
