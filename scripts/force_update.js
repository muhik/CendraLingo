const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Force update for user named 'ikbal'
const result = db.prepare("UPDATE user_progress SET cashback_balance = 262 WHERE user_name LIKE '%ikbal%'").run();

console.log(`Updated ${result.changes} user(s). Set cashback_balance to 262.`);

// Check result
const user = db.prepare("SELECT user_name, cashback_balance FROM user_progress WHERE user_name LIKE '%ikbal%'").get();
console.log('Current status:', user);
