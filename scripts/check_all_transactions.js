
const { createClient } = require('@libsql/client');
require('dotenv').config();

async function main() {
    console.log("--- Checking Recent Transactions ---");
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("❌ Missing Turso credentials"); return;
    }

    const client = createClient({ url, authToken });

    try {
        const result = await client.execute("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5");
        console.log("Recent Transactions:");
        result.rows.forEach(row => {
            console.log(`- Order: ${row.order_id}, Time: ${row.transaction_time}, Status: ${row.status}`);
        });

        // Also check user points
        const user = await client.execute("SELECT points FROM user_progress WHERE user_id = '0f9e0bd9-f0bb-48fd-9422-a45dc0ff4026'");
        if (user.rows.length > 0) {
            console.log(`\nCurrent User Gems: ${user.rows[0].points}`);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
