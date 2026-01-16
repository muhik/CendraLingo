const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'local.db');
const db = new Database(dbPath);

console.log('Adding lastSpinDate column to user_progress...');

try {
    db.exec(`ALTER TABLE user_progress ADD COLUMN last_spin_date TEXT;`);
    console.log('✓ lastSpinDate column added successfully!');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('✓ lastSpinDate column already exists.');
    } else {
        console.error('Error:', error.message);
    }
}

db.close();
