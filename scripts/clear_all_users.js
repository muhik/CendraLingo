const { createClient } = require("@libsql/client");
require("dotenv").config();

const url = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("❌ Missing Turso credentials in .env");
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function clearAllUsers() {
    console.log("🔥 WIPING ALL USERS from database...");

    try {
        // 1. Delete ALL from user_progress first (foreign key/dependency logic potentially)
        // Although SQLite/LibSQL might not verify relations strictly depending on config, good practice.
        const progressResult = await client.execute("DELETE FROM user_progress");
        console.log(`✅ Deleted ${progressResult.rowsAffected} records from 'user_progress'.`);

        // 2. Delete ALL from users
        const usersResult = await client.execute("DELETE FROM users");
        console.log(`✅ Deleted ${usersResult.rowsAffected} records from 'users'.`);

        // 3. Verify
        console.log("\n📋 Final verification (should be empty):");
        const verifyResult = await client.execute("SELECT * FROM users");

        if (verifyResult.rows.length === 0) {
            console.log("   ✅ 'users' table is EMPTY.");
        } else {
            console.warn(`   ⚠️ 'users' table still has ${verifyResult.rows.length} records!`);
            console.table(verifyResult.rows);
        }

    } catch (error) {
        console.error("❌ Operation failed:", error);
    } finally {
        client.close();
    }
}

clearAllUsers();
