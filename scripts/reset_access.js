// Script untuk reset akses harta karun semua user
// Agar bisa test flow Paid4Link dari awal

// Credentials hardcoded
const TURSO_URL = "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

async function tursoExecute(sql, args = []) {
    const response = await fetch(`${TURSO_URL}/v2/pipeline`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TURSO_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requests: [
                { type: "execute", stmt: { sql, args } },
                { type: "close" },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`Database Error: ${response.status}`);
    }

    return await response.json();
}

async function main() {
    console.log("🔄 Resetting ALL user treasure access logs...");

    try {
        const result = await tursoExecute("UPDATE user_treasure_log SET has_treasure_access = 0");
        console.log("✅ Execute Success.");
        console.log("   Affected rows:", result.results?.[0]?.response?.result?.affectedRowCount || "Unknown");
        console.log("\n👉 Please refresh the website and try clicking the Treasure Widget again.");
        console.log("   It should now redirect to the Paid4Link URL.");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();
