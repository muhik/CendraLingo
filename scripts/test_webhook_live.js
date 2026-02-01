async function testWebhook() {
    // UPDATED URL: Using cendralingo.my.id based on browser screenshot
    const url = "https://cendralingo.my.id/api/webhooks/mayar";
    console.log("Testing Webhook URL:", url);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "X-Callback-Token": "test-token" 
            },
            body: JSON.stringify({
                id: "DEBUG_CHECK_DOMAIN_" + Date.now(),
                status: "PAID",
                external_id: "DEBUG_DOMAIN_CHECK",
                amount: 10000,
                description: "Debug Domain Check"
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response:", text);

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testWebhook();
