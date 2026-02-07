
const { createClient } = require('@libsql/client');
require('dotenv').config();

async function main() {
    console.log("--- Manual Inject Transaction 7 ---");
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("❌ Missing Turso credentials"); return;
    }

    const client = createClient({ url, authToken });

    const orderId = "ORD-9b279493-a815-4b7f-ad5c-140c521162b4";
    const userId = "0f9e0bd9-f0bb-48fd-9422-a45dc0ff4026";
    const amount = 1000;

    try {
        // Insert Transaction
        await client.execute({
            sql: "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, json_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(order_id) DO UPDATE SET status=excluded.status",
            args: [orderId, userId, amount, "SUCCESS", "MAYAR", new Date().toISOString(), "{}", Date.now()]
        });
        console.log("✅ Transaction Inserted:", orderId);

        // Update Gems
        const userCheck = await client.execute({ sql: "SELECT points FROM user_progress WHERE user_id = ?", args: [userId] });
        if (userCheck.rows.length > 0) {
            console.log("   Gems before:", userCheck.rows[0].points);
            await client.execute({ sql: "UPDATE user_progress SET points = points + 10 WHERE user_id = ?", args: [userId] });
            console.log("✅ Gems +10 Added!");
        } else {
            console.error("❌ User not found");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
