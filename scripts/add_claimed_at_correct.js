const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

try {
    db.exec("ALTER TABLE vouchers ADD COLUMN claimed_at INTEGER;");
    console.log('Column claimed_at added successfully!');
} catch (err) {
    if (err.message.includes('duplicate column')) {
        console.log('Column already exists, skipping...');
    } else {
        console.error('Error:', err.message);
    }
}

// Verify
const tableInfo = db.prepare("PRAGMA table_info(vouchers)").all();
console.log("Vouchers table columns:");
tableInfo.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
});

db.close();
