const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'local.db');
const db = new Database(dbPath);

console.log('🔧 Adding treasure fields to database...\n');

// Add columns to user_progress
const userColumns = [
    { name: 'has_treasure_access', sql: 'INTEGER DEFAULT 0' },
    { name: 'treasure_access_date', sql: 'TEXT' },
    { name: 'last_spin_date', sql: 'TEXT' }
];

for (const col of userColumns) {
    try {
        db.exec(`ALTER TABLE user_progress ADD COLUMN ${col.name} ${col.sql};`);
        console.log(`✓ Added column: user_progress.${col.name}`);
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log(`○ Column already exists: user_progress.${col.name}`);
        } else {
            console.error(`✗ Error adding ${col.name}:`, error.message);
        }
    }
}

// Create treasure_settings table
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS treasure_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paid4link_url TEXT,
            is_enabled INTEGER DEFAULT 1,
            require_paid4link INTEGER DEFAULT 0,
            updated_at INTEGER
        );
    `);
    console.log('✓ Created table: treasure_settings');

    // Insert default row if not exists
    const existing = db.prepare('SELECT COUNT(*) as count FROM treasure_settings').get();
    if (existing.count === 0) {
        db.prepare(`
            INSERT INTO treasure_settings (paid4link_url, is_enabled, require_paid4link)
            VALUES (NULL, 1, 0)
        `).run();
        console.log('✓ Inserted default treasure settings');
    }
} catch (error) {
    console.error('✗ Error creating treasure_settings:', error.message);
}

console.log('\n✅ Migration complete!');
console.log('\n📋 Treasure Settings:');
const settings = db.prepare('SELECT * FROM treasure_settings').all();
console.table(settings);

db.close();
