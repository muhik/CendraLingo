import { createClient } from "@libsql/client";

const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
    console.log("🚀 Starting E1: Creating 'transactions' table...");

    try {
        await turso.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        order_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT,
        gross_amount REAL NOT NULL,
        status TEXT NOT NULL,          -- capture, settlement, pending, deny, expire, cancel
        payment_type TEXT,             -- gopay, bank_transfer, qris, etc.
        transaction_time TEXT,
        pdf_url TEXT,                  -- Link to receipt
        created_at INTEGER,
        json_data TEXT                 -- Full raw response for debugging
      );
    `);
        console.log("✅ Table 'transactions' created successfully.");
    } catch (err) {
        console.error("❌ Error creating table:", err);
    }
}

run();
