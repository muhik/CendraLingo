require('dotenv').config();

async function tursoExecute(sql, args = []) {
    const dbUrl = process.env.TURSO_CONNECTION_URL;
    const dbToken = process.env.TURSO_AUTH_TOKEN;

    const finalUrl = dbUrl.startsWith("libsql://") ? dbUrl.replace("libsql://", "https://") : dbUrl;

    const response = await fetch(`${finalUrl}/v2/pipeline`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${dbToken}`,
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

    const data = await response.json();
    return data.results[0]?.response?.result;
}

async function main() {
    console.log("🔍 Checking ad_settings table in Turso DB...\n");

    try {
        const res = await tursoExecute("SELECT * FROM ad_settings ORDER BY id DESC");

        if (!res?.rows?.length) {
            console.log("⚠️ No records found in ad_settings table!");
            console.log("The table is either empty or the save is not working.");
            return;
        }

        const cols = res.cols.map(c => c.name);
        console.log("📊 Columns:", cols.join(", "));
        console.log("📈 Total Records:", res.rows.length);
        console.log("-".repeat(80));

        res.rows.forEach((row, idx) => {
            console.log(`\n📌 Record ${idx + 1}:`);
            row.forEach((cell, i) => {
                console.log(`   ${cols[i]}: ${cell.value}`);
            });
        });

        console.log("\n" + "-".repeat(80));
        console.log("✅ Check complete.");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();
