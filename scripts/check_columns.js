const Database = require('better-sqlite3');
const db = new Database('./db.sqlite');

const tableInfo = db.prepare("PRAGMA table_info(vouchers)").all();
console.log("Vouchers table columns:");
tableInfo.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
});

db.close();
