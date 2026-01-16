
const Database = require('better-sqlite3');
const db = new Database('db.sqlite');

try {
    console.log("Checking schema...");
    const info = db.prepare("PRAGMA table_info(vouchers)").all();
    const hasClaimedAt = info.some(c => c.name === 'claimed_at');

    if (!hasClaimedAt) {
        console.log("Adding 'claimed_at' column...");
        db.prepare("ALTER TABLE vouchers ADD COLUMN claimed_at integer").run();
        console.log("Migration successful!");
    } else {
        console.log("Column 'claimed_at' already exists.");
    }
} catch (error) {
    console.error("Migration failed:", error);
}
