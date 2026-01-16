const Database = require('better-sqlite3');
const db = new Database('./db.sqlite');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));

const voucherCount = db.prepare("SELECT COUNT(*) as count FROM vouchers").get();
console.log('Voucher count:', voucherCount.count);

db.close();
