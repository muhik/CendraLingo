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

async function cleanAndCheck() {
    console.log("🧹 Cleaning up 'Gemini AI' user...");

    try {
        // 1. Delete from users and user_progress
        const userId = "gemini_user_001";

        await client.execute({
            sql: "DELETE FROM user_progress WHERE user_id = ?",
            args: [userId]
        });

        await client.execute({
            sql: "DELETE FROM users WHERE id = ?",
            args: [userId]
        });

        console.log("✅ 'Gemini AI' user deleted.");

        // 2. Check remaining users
        console.log("\n📋 Checking 'users' table content:");
        const usersResult = await client.execute("SELECT id, name, email, role, created_at FROM users");

        if (usersResult.rows.length === 0) {
            console.log("   (Table is EMPTY)");
        } else {
            console.table(usersResult.rows);
        }

    } catch (error) {
        console.error("❌ Operation failed:", error);
    } finally {
        client.close();
    }
}

cleanAndCheck();
