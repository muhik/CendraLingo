const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
    console.log("Adding is_course_completed column...");
    db.prepare(`ALTER TABLE user_progress ADD COLUMN is_course_completed INTEGER NOT NULL DEFAULT 0;`).run();
    console.log("✅ Migration successful!");
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log("✅ Column already exists. Skipping.");
    } else {
        console.error("❌ Migration failed:", error);
    }
}
