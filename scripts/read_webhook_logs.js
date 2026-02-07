
const { createClient } = require('@libsql/client');
require('dotenv').config();

async function main() {
    console.log("--- Reading Webhook Logs from Database ---");
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("❌ Missing Turso credentials"); return;
    }

    const client = createClient({ url, authToken });

    const result = await client.execute("SELECT * FROM webhook_logs ORDER BY id DESC LIMIT 10");

    if (result.rows.length === 0) {
        console.log("📭 No webhook logs found yet. Wait for Mayar to send a webhook after deploy.");
        return;
    }

    console.log(`\n📋 Found ${result.rows.length} webhook log(s):\n`);

    for (const row of result.rows) {
        console.log("=".repeat(60));
        console.log(`🕐 Timestamp: ${row.timestamp}`);
        console.log(`📦 Content-Type: ${row.content_type}`);
        console.log(`📨 Headers: ${row.headers}`);
        console.log(`📝 Raw Body (first 500): ${String(row.body_raw).substring(0, 500)}`);
        console.log(`🔑 Parsed Keys: ${row.body_parsed}`);
        console.log(`❌ Error: ${row.error}`);
        console.log("=".repeat(60));
        console.log("");
    }
}

main();
