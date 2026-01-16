const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Get ALL users to show who has what userId
const users = db.prepare('SELECT user_id, user_name, is_guest, cashback_balance FROM user_progress').all();
console.log('📋 All users in database:');
users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.user_name} (${u.is_guest ? 'Guest' : 'Registered'}) - ID: ${u.user_id}`);
});

// Get all redeem requests
const redeems = db.prepare('SELECT * FROM redeem_requests ORDER BY id DESC').all();
console.log('\n📋 All redeem requests:');
redeems.forEach(r => {
    console.log(`ID ${r.id}: ${r.user_name} | ${r.payment_method} ${r.account_number} | Rp ${r.rupiah_amount} | Status: ${r.status}`);
});
