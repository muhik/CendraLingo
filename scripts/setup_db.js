const Database = require('better-sqlite3');
const db = new Database('./db.sqlite');

db.exec(`
CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL DEFAULT 'User',
    user_image TEXT NOT NULL DEFAULT '/mascot.svg',
    active_course_id INTEGER,
    hearts INTEGER NOT NULL DEFAULT 5,
    points INTEGER NOT NULL DEFAULT 0,
    is_guest INTEGER NOT NULL DEFAULT 1,
    has_active_subscription INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    value_rp INTEGER NOT NULL,
    gems_amount INTEGER NOT NULL,
    cashback_amount INTEGER NOT NULL DEFAULT 0,
    is_claimed INTEGER NOT NULL DEFAULT 0,
    claimed_by TEXT,
    claimed_at INTEGER,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_progress(user_id)
);
`);

console.log('Tables created successfully!');

// Print schema for transactions table
console.log("\nSchema for 'transactions' table:");
const tableInfo = db.prepare("PRAGMA table_info(transactions)").all();
console.log("Table Info:", tableInfo);

const fkInfo = db.prepare("PRAGMA foreign_key_list(transactions)").all();
console.log("Foreign Keys:", fkInfo);

db.close();
