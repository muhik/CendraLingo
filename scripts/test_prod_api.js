// Test multiple production endpoints
async function testAllAPIs() {
    console.log("🔧 Testing PRODUCTION APIs...\n");

    // Test 1: Health check
    console.log("--- Test 1: /api/health ---");
    try {
        const res1 = await fetch("https://cendralingo.my.id/api/health");
        console.log("Status:", res1.status);
        const text1 = await res1.text();
        console.log("Response:", text1.substring(0, 200));
    } catch (err) {
        console.error("Error:", err.message);
    }

    // Test 2: Manual purchase
    console.log("\n--- Test 2: /api/manual-purchase ---");
    try {
        const res2 = await fetch("https://cendralingo.my.id/api/manual-purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "test-user",
                customAmount: 10000
            })
        });
        console.log("Status:", res2.status);
        const text2 = await res2.text();
        console.log("Response:", text2.substring(0, 500));
    } catch (err) {
        console.error("Error:", err.message);
    }

    // Test 3: Check homepage to verify site is up
    console.log("\n--- Test 3: Homepage check ---");
    try {
        const res3 = await fetch("https://cendralingo.my.id/");
        console.log("Status:", res3.status);
        console.log("Content-Type:", res3.headers.get("content-type"));
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testAllAPIs();
