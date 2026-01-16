const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

console.log('Adding feedbacks table...');

try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS feedbacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_name TEXT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'saran', -- 'saran' or 'kritik'
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    console.log('✅ Feedbacks table created successfully!');

    // Check tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables.map(t => t.name));

} catch (error) {
    console.error('❌ Error creating table:', error);
}

db.close();
