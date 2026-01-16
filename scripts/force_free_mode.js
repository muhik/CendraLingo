const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

console.log('📉 Downgrading ALL users to Free Mode (Removing Subscription)...');

try {
    const update = db.prepare('UPDATE user_progress SET has_active_subscription = 0');
    const info = update.run();
    console.log(`Success! Updated ${info.changes} users to Free Plan.`);
} catch (error) {
    console.error('Error updating database:', error);
}

db.close();
