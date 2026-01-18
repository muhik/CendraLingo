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

async function seed() {
    console.log("🌱 Seeding 'Gemini AI' user...");

    const userId = "gemini_user_001";
    const userEmail = "gemini@cendralingo.my.id";
    const userName = "Gemini AI";

    try {
        // 1. Insert into users table
        await client.execute({
            sql: `INSERT INTO users (id, name, email, password, role, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?) 
                  ON CONFLICT(id) DO UPDATE SET name=excluded.name`,
            args: [userId, userName, userEmail, "hashed_password_placeholder", "admin", Date.now()]
        });
        console.log("✅ User 'Gemini AI' inserted/updated.");

        // 2. Insert into user_progress table
        // Grants PRO status (has_active_subscription = 1) for testing
        const oneYearFromNow = Date.now() + 365 * 24 * 60 * 60 * 1000;

        await client.execute({
            sql: `INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription, subscription_ends_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(user_id) DO UPDATE SET 
                    has_active_subscription=excluded.has_active_subscription,
                    subscription_ends_at=excluded.subscription_ends_at`,
            args: [userId, userName, "/mascot_headset.png", 5, 1000, 0, 1, oneYearFromNow]
        });
        console.log("✅ User Progress initialized (PRO Status Active).");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        client.close();
    }
}

seed();
