// Test ALL methods on manual-purchase endpoint
async function testAllMethods() {
    console.log("🔧 Testing ALL HTTP methods on /api/manual-purchase...\n");

    const methods = ["GET", "POST", "OPTIONS"];

    for (const method of methods) {
        console.log(`--- ${method} ---`);
        try {
            const opts = { method };
            if (method === "POST") {
                opts.headers = { "Content-Type": "application/json" };
                opts.body = JSON.stringify({ userId: "test", customAmount: 10000 });
            }

            const res = await fetch("https://cendralingo.my.id/api/manual-purchase", opts);
            console.log("Status:", res.status);
            const text = await res.text();
            console.log("Response:", text.substring(0, 300));
        } catch (err) {
            console.error("Error:", err.message);
        }
        console.log();
    }
}

testAllMethods();
