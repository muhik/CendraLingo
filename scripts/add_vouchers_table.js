const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

console.log('Adding vouchers table...');

try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS vouchers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            value_rp INTEGER NOT NULL DEFAULT 0,
            gems_amount INTEGER NOT NULL DEFAULT 0,
            cashback_amount INTEGER NOT NULL DEFAULT 0,
            is_claimed BOOLEAN DEFAULT 0,
            claimed_at TEXT,
            claimed_by TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    console.log('✅ Vouchers table created successfully!');

    // Check tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables.map(t => t.name));

} catch (error) {
    console.error('❌ Error creating table:', error);
}

db.close();
