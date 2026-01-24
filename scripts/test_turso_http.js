// Test Turso HTTP API directly (same as Edge runtime will use)
require('dotenv').config();

async function testTursoHttp() {
    const dbUrl = process.env.TURSO_CONNECTION_URL?.replace("libsql://", "https://") || "";
    const dbToken = process.env.TURSO_AUTH_TOKEN;

    console.log("🔧 Testing Turso HTTP API...");
    console.log("📍 URL:", dbUrl);
    console.log("🔑 Token:", dbToken ? `${dbToken.substring(0, 10)}...` : "MISSING!");

    if (!dbUrl || !dbToken) {
        console.error("❌ Missing credentials!");
        return;
    }

    // Test 1: Simple SELECT
    console.log("\n--- Test 1: SELECT from transactions ---");
    try {
        const res1 = await fetch(`${dbUrl}/v2/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${dbToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requests: [
                    { type: "execute", stmt: { sql: "SELECT COUNT(*) as cnt FROM transactions" } },
                    { type: "close" },
                ],
            }),
        });
        console.log("Status:", res1.status);
        const data1 = await res1.json();
        console.log("Response:", JSON.stringify(data1, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }

    // Test 2: INSERT with typed args (same format as the API)
    console.log("\n--- Test 2: INSERT with typed args ---");
    const testOrderId = `TEST-${Date.now()}`;
    const testUserId = "test-user-123";

    try {
        const res2 = await fetch(`${dbUrl}/v2/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${dbToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requests: [
                    {
                        type: "execute",
                        stmt: {
                            sql: "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, created_at, json_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            args: [
                                { type: "text", value: testOrderId },
                                { type: "text", value: testUserId },
                                { type: "integer", value: "10000" },
                                { type: "text", value: "pending_manual" },
                                { type: "text", value: "manual_transfer" },
                                { type: "text", value: new Date().toISOString() },
                                { type: "integer", value: String(Date.now()) },
                                { type: "text", value: JSON.stringify({ test: true }) }
                            ]
                        }
                    },
                    { type: "close" },
                ],
            }),
        });
        console.log("Status:", res2.status);
        const data2 = await res2.json();
        console.log("Response:", JSON.stringify(data2, null, 2));

        if (res2.ok) {
            console.log("✅ INSERT SUCCESS!");
        } else {
            console.log("❌ INSERT FAILED!");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }

    // Test 3: Verify the insert
    console.log("\n--- Test 3: Verify INSERT ---");
    try {
        const res3 = await fetch(`${dbUrl}/v2/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${dbToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requests: [
                    { type: "execute", stmt: { sql: `SELECT * FROM transactions WHERE order_id = '${testOrderId}'` } },
                    { type: "close" },
                ],
            }),
        });
        const data3 = await res3.json();
        console.log("Inserted row:", JSON.stringify(data3, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testTursoHttp();
