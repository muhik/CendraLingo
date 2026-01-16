const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

// Get the user_id from the rejected request (assuming it's the latest one or specifically for ikbal)
const request = db.prepare("SELECT user_id, user_name FROM redeem_requests WHERE status = 'rejected' ORDER BY id DESC LIMIT 1").get();

if (request) {
    console.log(`Found rejected request for: ${request.user_name} (ID: ${request.user_id})`);

    // Update balance using user_id
    const result = db.prepare("UPDATE user_progress SET cashback_balance = 262 WHERE user_id = ?").run(request.user_id);
    console.log(`✅ Updated ${result.changes} user(s). Balance restored to 262.`);
} else {
    console.log("❌ No rejected request found to restore.");
}
