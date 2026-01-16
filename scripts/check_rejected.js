const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Get rejected redeem requests
const rejected = db.prepare(`
    SELECT r.*, u.cashback_balance 
    FROM redeem_requests r
    LEFT JOIN user_progress u ON r.user_id = u.user_id
    WHERE r.status = 'rejected'
    ORDER BY r.updated_at DESC, r.id DESC
`).all();

console.log('❌ Rejected Requests & Current User Balance:');
console.log(JSON.stringify(rejected, null, 2));

// Get all users to see balances
const users = db.prepare('SELECT user_id, user_name, cashback_balance FROM user_progress').all();
console.log('\n👤 All Users Balance:');
users.forEach(u => {
    console.log(`${u.user_name} (ID: ${u.user_id}): Rp ${u.cashback_balance}`);
});
