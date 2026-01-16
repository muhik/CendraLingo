const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Update test redeem to completed
db.exec(`UPDATE redeem_requests SET status = 'completed' WHERE id = 1`);
console.log('✅ Test redeem updated to completed!');

const r = db.prepare('SELECT * FROM redeem_requests WHERE id = 1').get();
console.log(r);
