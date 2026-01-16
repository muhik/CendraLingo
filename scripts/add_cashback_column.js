const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

try {
    db.exec('ALTER TABLE user_progress ADD COLUMN cashback_balance INTEGER DEFAULT 0');
    console.log('✅ Added cashback_balance to user_progress');
} catch (e) {
    console.log('ℹ️ cashback_balance error:', e.message);
}

// Check rejected requests again
const rejected = db.prepare(`
    SELECT r.* 
    FROM redeem_requests r
    WHERE r.status = 'rejected'
`).all();

console.log('\n❌ Rejected Requests:');
rejected.forEach(r => {
    console.log(`ID ${r.id}: ${r.user_name} - Gems: ${r.gems_amount} - Rp: ${r.rupiah_amount}`);

    // Manually refund if needed (since API failed)
    // We assume check is needed. For now just listing them.
    // If it's the test case, we should refund.
});
