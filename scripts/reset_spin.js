const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

console.log('🔄 Resetting spin status for all users...');

try {
    // Set last_spin_date to NULL for all users so they can spin again
    const info = db.prepare("UPDATE user_treasure_log SET last_spin_date = NULL").run();
    console.log(`✅ Success! Reset spin status for ${info.changes} users.`);

} catch (error) {
    console.error('❌ Error resetting spin:', error);
}

db.close();
