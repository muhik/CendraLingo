
async function main() {
    console.log("--- Debugging LIVE Webhook Endpoint ---");
    const endpoint = "https://cendralingo.my.id/api/webhooks/mayar";

    const payload = {
        event: "payment.received",
        data: {
            id: "DEBUG_LIVE_REQ_001",
            transactionId: "DEBUG_LIVE_REQ_001",
            status: "SUCCESS",
            amount: 1000,
            transactionStatus: "created",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            productName: "DEBUG_PRODUCT",
            nettAmount: 1000,
            extraData: {
                userId: "0f9e0bd9-f0bb-48fd-9422-a45dc0ff4026",
                type: "G",
                orderId: "DEBUG_LIVE_ORDER_001"
            }
        }
    };

    try {
        console.log(`Sending POST to ${endpoint}...`);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "User-Agent": "Mayar-Webhook-Bot/1.0" // Optional
            },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Response Body:", text);

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

main();
