const Database = require('better-sqlite3');
const db = new Database('./local.db');

console.log('\n=== TABLE: users (Last 5 Registered) ===');
try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5').all();
    console.table(users);
} catch (e) { console.log("Error reading users:", e.message); }

console.log('\n=== TABLE: user_progress (Last 5 Updated) ===');
try {
    // There is no created_at in user_progress usually, so we just take any 5 or if there's a way to sort
    const progress = db.prepare('SELECT user_id, user_name, points, is_guest, has_active_subscription FROM user_progress LIMIT 5').all();
    console.table(progress);
} catch (e) { console.log("Error reading user_progress:", e.message); }
