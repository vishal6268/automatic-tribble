const bcrypt = require('bcryptjs');

// Test password from database
const adminHash = '$2a$10$HJfGl6orLRisvNQpZC0/fuUuoyZKQ/zFLjmzHcg56kcoETyiop4B2';
const userHash = '$2a$10$U.trW.Gcy6vKoXRh65v0ouYsLhkd21tELJI1QEVYrgsks2gCSGxrC';

const testPwds = ['Admin@123', 'User@123'];

async function testPasswords() {
  console.log('Testing password hashes...\n');
  
  for (const pwd of testPwds) {
    const isAdminMatch = await bcrypt.compare(pwd, adminHash);
    const isUserMatch = await bcrypt.compare(pwd, userHash);
    
    console.log(`Password: ${pwd}`);
    console.log(`  Admin hash matches: ${isAdminMatch}`);
    console.log(`  User hash matches: ${isUserMatch}`);
  }
}

testPasswords();
