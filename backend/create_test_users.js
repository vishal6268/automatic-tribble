const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mcq_platform.db');

async function createUsers() {
  try {
    // Hash passwords
    const userPasswordHash = await bcrypt.hash('User@123', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    
    // Insert user
    db.run(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      ['John User', 'user@test.com', userPasswordHash, 'user', 'active'],
      function(err) {
        if (err) console.log('User insert error:', err.message);
        else console.log('User created: ID ' + this.lastID);
      }
    );
    
    // Insert admin
    db.run(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      ['Admin User', 'admin@test.com', adminPasswordHash, 'admin', 'active'],
      function(err) {
        if (err) console.log('Admin insert error:', err.message);
        else console.log('Admin created: ID ' + this.lastID);
      }
    );
    
    setTimeout(() => {
      db.all('SELECT id, name, email, role FROM users', (err, rows) => {
        if (err) console.log(err);
        else {
          console.log('\n--- Users in database ---');
          rows.forEach(row => {
            console.log('ID: ' + row.id + ', Name: ' + row.name + ', Email: ' + row.email + ', Role: ' + row.role);
          });
        }
        db.close();
      });
    }, 500);
  } catch (err) {
    console.error('Error:', err);
    db.close();
  }
}

createUsers();
