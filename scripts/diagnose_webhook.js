
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
                "id": "9906df54-033a-4f42-9f94-1c55e6b079f3",
                "transactionId": "9906df54-033a-4f42-9f94-1c55e6b079f3",
                "status": "SUCCESS",
                "transactionStatus": "created",
                "createdAt": "2026-02-07T06:50:04.264Z",
                "updatedAt": "2026-02-07T06:50:24.747Z",
                "merchantId": "9def8dd8-bd05-4cf8-87ac-bd1fb31c2ac9",
                "merchantName": "Cendra Lingo",
                "merchantEmail": "muhikmu@gmail.com",
                "customerId": "c5d32fc9-1c4a-41f3-9aff-fe0d34db06ed",
                "customerName": "Guest8965",
                "customerEmail": "guest1770447003001@example.com",
                "customerMobile": "081211259158",
                "amount": 1000,
                "paymentLinkAmount": 1000,
                "isAdminFeeBorneByCustomer": null,
                "isChannelFeeBorneByCustomer": null,
                "productId": "6afd09d7-8e5f-4b9a-8740-d0b2cc3afd0d",
                "productName": "INVOICE",
                "productDescription": "Trx 1770447003001-962",
                "productType": "invoice",
                "pixelFbp": null,
                "pixelFbc": null,
                "qty": 1,
                "couponUsed": null, "paymentMethod": "QRIS",
                "nettAmount": 1000,
                "extraData": {
                    "userId": "0f9e0bd9-f0bb-48fd-9422-a45dc0ff4026",
                    "type": "G",
                    "orderId": "ORD-98caf928-66fa-45bb-af76-685ed8c35cb3"
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
