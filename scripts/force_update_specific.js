const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

const userId = '50162cd1-ca48-47c6-b994-ba14cc6827dc'; // from users_dump.json match
const result = db.prepare("UPDATE user_progress SET cashback_balance = 262 WHERE user_id = ?").run(userId);

console.log(`✅ Updated ${result.changes} user (ID: ${userId}) to 262.`);

// Verify
const u = db.prepare("SELECT user_id, cashback_balance FROM user_progress WHERE user_id = ?").get(userId);
console.log('User now:', u);
