const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Get all non-guest users
const users = db.prepare('SELECT user_id, user_name FROM user_progress WHERE is_guest = 0').all();
console.log('Non-guest users:');
console.log(users);

if (users.length > 0) {
    const userId = users[0].user_id;
    const userName = users[0].user_name;

    // Insert completed redeem for this user
    db.exec(`
        INSERT INTO redeem_requests (user_id, user_name, gems_amount, rupiah_amount, payment_method, account_number, account_name, status, created_at) 
        VALUES ('${userId}', '${userName}', 100, 10000, 'DANA', '081234567890', 'Test User', 'completed', ${Date.now()})
    `);
    console.log('\n✅ Created completed redeem for user:', userId);
}

// Show all redeems
const redeems = db.prepare('SELECT * FROM redeem_requests').all();
console.log('\n📋 All redeem requests:');
console.log(redeems);
