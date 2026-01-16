const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'local.db');
const db = new Database(dbPath);

console.log('🔧 Creating user_treasure_log table...\n');

// Create user_treasure_log table for tracking user access
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_treasure_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            has_treasure_access INTEGER DEFAULT 0,
            treasure_access_date TEXT,
            last_spin_date TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
    `);
    console.log('✓ Created table: user_treasure_log');

    // Create unique index on user_id
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_treasure_user_id ON user_treasure_log(user_id);`);
    console.log('✓ Created unique index on user_id');

} catch (error) {
    console.error('✗ Error:', error.message);
}

console.log('\n✅ Migration complete!');

// Show tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\n📋 Tables in database:');
tables.forEach(t => console.log('  -', t.name));

db.close();
