const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'local.db');
const db = new Database(dbPath);

console.log('Adding redeem_requests table...');

// Create redeem_requests table
db.exec(`
    CREATE TABLE IF NOT EXISTS redeem_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        gems_amount INTEGER NOT NULL,
        rupiah_amount INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        admin_notes TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        processed_at INTEGER
    );
`);

console.log('✓ redeem_requests table created successfully!');

db.close();
