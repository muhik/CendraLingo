// Test admin page
async function testAdmin() {
    console.log("Testing Admin APIs...\n");

    // Test transactions API
    console.log("--- /api/admin/transactions ---");
    const res1 = await fetch("https://cendralingo.my.id/api/admin/transactions");
    console.log("Status:", res1.status);
    const data1 = await res1.json();
    console.log("Transactions count:", data1.data?.length);
    console.log("First transaction:", JSON.stringify(data1.data?.[0], null, 2));

    // Test admin page HTML
    console.log("\n--- /admin page ---");
    const res2 = await fetch("https://cendralingo.my.id/admin");
    console.log("Status:", res2.status);
    console.log("Content-Type:", res2.headers.get("content-type"));
}

testAdmin();
