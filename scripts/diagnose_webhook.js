
const { createClient } = require('@libsql/client');
require('dotenv').config(); // Load .env file

async function main() {
    console.log("--- Starting Webhook Diagnosis ---");

    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("❌ Missing Turso credentials in .env");
        return;
    }

    const client = createClient({ url, authToken });

    try {
        const payload = {
            "event": "payment.received",
            "data": {
                "id": "7931caca-8f48-45bf-a177-3b743238c280",
                "transactionId": "7931caca-8f48-45bf-a177-3b743238c280",
                "status": "SUCCESS",
                "transactionStatus": "created",
                "createdAt": "2026-02-07T07:09:23.334Z",
                "updatedAt": "2026-02-07T07:09:37.013Z",
                "merchantId": "9def8dd8-bd05-4cf8-87ac-bd1fb31c2ac9",
                "merchantName": "Cendra Lingo",
                "merchantEmail": "muhikmu@gmail.com",
                "customerId": "da5f3b75-dfe1-4987-b8af-36c75057b4f6",
                "customerName": "Guest12446",
                "customerEmail": "guest1770448162051@example.com",
                "customerMobile": "081287620989",
                "amount": 1000,
                "paymentLinkAmount": 1000,
                "isAdminFeeBorneByCustomer": null,
                "isChannelFeeBorneByCustomer": null,
                "productId": "40ae57ac-8d10-4afa-88f1-157955c49af2",
                "productName": "INVOICE",
                "productDescription": "Trx 1770448162051-350",
                "productType": "invoice",
                "pixelFbp": null,
                "pixelFbc": null,
                "qty": 1,
                "couponUsed": null, "paymentMethod": "QRIS",
                "nettAmount": 1000,
                "extraData": {
                    "userId": "0f9e0bd9-f0bb-48fd-9422-a45dc0ff4026",
                    "type": "G",
                    "orderId": "ORD-04f0683e-efed-4fb0-b0e1-227d0a7f64be"
                }
            }
        };
        const actualData = payload.data;
        let orderIdFromMeta = "";
        let userIdFromMeta = "";
        let typeFromMeta = "";

        let metaSource = actualData.extraData || {};

        if (metaSource && typeof metaSource === 'object') {
            if (metaSource.orderId) orderIdFromMeta = metaSource.orderId;
            if (metaSource.userId) userIdFromMeta = metaSource.userId;
            if (metaSource.type) typeFromMeta = metaSource.type;
        }

        console.log("   Parsed Data:", { orderIdFromMeta, userIdFromMeta, typeFromMeta });

        const safeExternalId = orderIdFromMeta || `MAYAR-${actualData.id}`;
        const safeUserId = userIdFromMeta || "unknown";

        console.log(`   Final Values -> OrderID: ${safeExternalId}, UserID: ${safeUserId}`);

        // Insert
        try {
            await client.execute({
                sql: "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, json_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(order_id) DO UPDATE SET status=excluded.status",
                args: [
                    safeExternalId,
                    safeUserId,
                    1000,
                    "SUCCESS",
                    "MAYAR",
                    new Date().toISOString(),
                    JSON.stringify(payload),
                    Date.now()
                ]
            });
            console.log("✅ INSERT Successful! (Transaction recorded)");
        } catch (e) {
            console.error("❌ INSERT Failed:", e.message);
        }

        // Update Gems
        try {
            const userCheck = await client.execute({ sql: "SELECT * FROM user_progress WHERE user_id = ?", args: [safeUserId] });
            if (userCheck.rows.length === 0) {
                console.error(`❌ User ${safeUserId} NOT FOUND in user_progress table!`);
            } else {
                console.log(`✅ User found. Points before: ${userCheck.rows[0].points}`);
                await client.execute({
                    sql: "UPDATE user_progress SET points = points + 10 WHERE user_id = ?",
                    args: [safeUserId]
                });
                console.log("✅ Gems Update Executed!");
            }
        } catch (e) {
            console.error("❌ Gems Update Failed:", e.message);
        }

    } catch (e) {
        console.error("Unexpected Error:", e);
    }
}

main();
