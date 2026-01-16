const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Fix treasure_settings table
try {
    db.exec('ALTER TABLE treasure_settings ADD COLUMN updated_at INTEGER');
    console.log('✅ Added updated_at to treasure_settings');
} catch (e) {
    console.log('ℹ️ updated_at:', e.message);
}

// Add test redeem request
try {
    db.exec(`
        INSERT INTO redeem_requests (user_id, user_name, gems_amount, rupiah_amount, payment_method, account_number, account_name, status, created_at) 
        VALUES ('test-user-123', 'Test User Dana', 500, 50000, 'DANA', '081234567890', 'Budi Santoso', 'pending', ${Date.now()})
    `);
    console.log('✅ Added test redeem request');
} catch (e) {
    console.log('ℹ️ Redeem insert:', e.message);
}

// Show current redeem requests
const requests = db.prepare('SELECT * FROM redeem_requests').all();
console.log('\n📋 Current Redeem Requests:');
console.log(JSON.stringify(requests, null, 2));
console.log('\n✅ Done! Refresh admin page.');
