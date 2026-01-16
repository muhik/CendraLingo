const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

try {
    db.exec('ALTER TABLE user_progress ADD COLUMN subscription_ends_at INTEGER');
    console.log('✅ Added subscription_ends_at');
} catch (e) {
    console.log('ℹ️ subscription_ends_at:', e.message);
}

try {
    db.exec('ALTER TABLE user_progress ADD COLUMN last_spin_date TEXT');
    console.log('✅ Added last_spin_date');
} catch (e) {
    console.log('ℹ️ last_spin_date:', e.message);
}

// Create treasure_settings table
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS treasure_settings (
            id INTEGER PRIMARY KEY,
            paid4link_url TEXT DEFAULT '',
            is_enabled INTEGER DEFAULT 1,
            require_paid4link INTEGER DEFAULT 0
        )
    `);
    // Insert default row if empty
    const count = db.prepare('SELECT COUNT(*) as c FROM treasure_settings').get();
    if (count.c === 0) {
        db.exec("INSERT INTO treasure_settings (id, paid4link_url, is_enabled, require_paid4link) VALUES (1, '', 1, 0)");
    }
    console.log('✅ Created treasure_settings table');
} catch (e) {
    console.log('ℹ️ treasure_settings:', e.message);
}

console.log('✅ Done! Restart server and refresh admin.');
