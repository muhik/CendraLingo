const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

console.log("=== TABLE: USERS ===");
const users = db.prepare('SELECT * FROM users').all();
console.table(users);

console.log("\n=== TABLE: USER_PROGRESS ===");
const progress = db.prepare('SELECT user_id, user_name, points, hearts, has_active_subscription, subscription_ends_at FROM user_progress').all();
console.table(progress);

db.close();
