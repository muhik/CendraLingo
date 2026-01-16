const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Refund ID 3
const refundAmount = 262;
const userName = 'ikbal';

db.exec(`
    UPDATE user_progress 
    SET cashback_balance = cashback_balance + ${refundAmount} 
    WHERE user_name = '${userName}'
`);
console.log(`✅ Refunded Rp ${refundAmount} to ${userName}`);

// Verify
const user = db.prepare(`SELECT * FROM user_progress WHERE user_name = '${userName}'`).get();
console.log('User status:', user);
