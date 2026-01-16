const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

console.log("Running migration fix...");

// 1. Ensure user_progress exists
db.prepare(`
    CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT PRIMARY KEY,
        user_name TEXT NOT NULL DEFAULT 'User',
        user_image TEXT NOT NULL DEFAULT '/mascot.svg',
        active_course_id INTEGER,
        hearts INTEGER NOT NULL DEFAULT 5,
        points INTEGER NOT NULL DEFAULT 0,
        is_guest BOOLEAN NOT NULL DEFAULT 1,
        has_active_subscription BOOLEAN NOT NULL DEFAULT 0,
        last_spin_date TEXT,
        subscription_ends_at INTEGER
    )
`).run();

// 2. Add subscription_ends_at column if not exists (for existing tables)
try {
    const columns = db.prepare("PRAGMA table_info(user_progress)").all();
    const hasCol = columns.some(c => c.name === 'subscription_ends_at');

    if (!hasCol) {
        db.prepare(`ALTER TABLE user_progress ADD COLUMN subscription_ends_at INTEGER`).run();
        console.log("Added subscription_ends_at column.");
    } else {
        console.log("Column subscription_ends_at already exists.");
    }
} catch (error) {
    console.error("Error altering table:", error);
}

console.log("Migration fix complete!");
db.close();
