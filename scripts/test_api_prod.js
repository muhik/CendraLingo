// Script to test Production API Endpoint
// Run with: node scripts/test_api_prod.js

const API_URL = "https://cendralingo.my.id/api/treasure/access";
const USER_ID = "debug_test_123";

async function testApi() {
    console.log(`🚀 Testing POST ${API_URL}...`);

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: USER_ID,
                action: "setAccess"
            })
        });

        console.log(`📡 Status: ${res.status} ${res.statusText}`);

        const text = await res.text();
        console.log("📄 Response Body Preview (first 500 chars):");
        console.log(text.substring(0, 500));

        if (!res.ok) {
            console.log("\n❌ Request FAILED!");
        } else {
            console.log("\n✅ Request SUCCESS!");
        }

    } catch (error) {
        console.error("💥 Network Error:", error.message);
    }
}

testApi();
