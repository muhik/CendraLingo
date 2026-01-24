// Script untuk set Paid4Link URL langsung ke database Turso
// Jalankan dengan: node scripts/set_paid4link.js

// Credentials dari .env (hardcoded agar bisa jalan tanpa dotenv)
const TURSO_URL = "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

// ========================================
// GANTI URL INI DENGAN URL PAID4LINK ANDA
// ========================================
const PAID4LINK_URL = "https://go.paid4link.com/9oTXGnN";
// ========================================

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
        throw new Error(`Database Error: ${response.status} - ${await response.text()}`);
    }

    return await response.json();
}

async function main() {
    console.log("🔧 Setting Paid4Link URL directly in database...\n");
    console.log(`📍 URL to set: ${PAID4LINK_URL}\n`);

    try {
        // 1. Buat tabel jika belum ada
        console.log("1️⃣ Ensuring table exists...");
        await tursoExecute(`
            CREATE TABLE IF NOT EXISTS treasure_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paid4link_url TEXT,
                is_enabled INTEGER DEFAULT 1,
                require_paid4link INTEGER DEFAULT 0,
                updated_at INTEGER
            )
        `);
        console.log("   ✅ Table ready\n");

        // 2. Cek apakah sudah ada row
        console.log("2️⃣ Checking existing data...");
        const checkResult = await tursoExecute("SELECT * FROM treasure_settings LIMIT 1");
        const rows = checkResult.results?.[0]?.response?.result?.rows || [];

        if (rows.length > 0) {
            console.log("   📋 Found existing row, will update\n");

            // Update
            console.log("3️⃣ Updating paid4link_url...");
            await tursoExecute(
                "UPDATE treasure_settings SET paid4link_url = ?, is_enabled = 1, require_paid4link = 1, updated_at = ?",
                [
                    { type: "text", value: PAID4LINK_URL },
                    { type: "integer", value: String(Date.now()) }
                ]
            );
        } else {
            console.log("   📋 No existing row, will insert\n");

            // Insert
            console.log("3️⃣ Inserting new row with paid4link_url...");
            await tursoExecute(
                "INSERT INTO treasure_settings (paid4link_url, is_enabled, require_paid4link, updated_at) VALUES (?, 1, 1, ?)",
                [
                    { type: "text", value: PAID4LINK_URL },
                    { type: "integer", value: String(Date.now()) }
                ]
            );
        }
        console.log("   ✅ Done!\n");

        // 4. Verifikasi
        console.log("4️⃣ Verifying...");
        const verifyResult = await tursoExecute("SELECT * FROM treasure_settings");
        const verifyRows = verifyResult.results?.[0]?.response?.result?.rows || [];
        const columns = verifyResult.results?.[0]?.response?.result?.cols || [];

        console.log("\n📦 Current treasure_settings table:");
        console.log("Columns:", columns.map(c => c.name).join(", "));
        console.log("Data:", JSON.stringify(verifyRows, null, 2));

        console.log("\n🎉 SUCCESS! Paid4Link URL has been set in the database.");
        console.log("   The treasure widget should now use this URL.\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();
