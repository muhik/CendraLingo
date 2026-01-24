import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function check() {
    console.log("Checking DB Connection...");
    try {
        const res = await turso.execute("SELECT name FROM sqlite_master WHERE type='table'");
        const tables = res.rows.map(r => r.name);
        console.log("Tables:", tables);

        if (tables.includes("transactions")) {
            console.log("✅ 'transactions' table exists.");

            // Check columns
            const cols = await turso.execute("PRAGMA table_info(transactions)");
            console.log("Columns:", cols.rows.map(c => c.name).join(", "));
        } else {
            console.error("❌ 'transactions' table MISSING!");
        }
    } catch (e) {
        console.error("❌ DB Error:", e);
    }
}

check();
