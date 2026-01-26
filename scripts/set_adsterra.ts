
import "dotenv/config";

const dbUrl = process.env.TURSO_CONNECTION_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !dbToken) {
    console.error("Missing TURSO env vars");
    process.exit(1);
}

const finalUrl = dbUrl.startsWith("libsql://") ? dbUrl.replace("libsql://", "https://") : dbUrl;

async function tursoExecute(sql, args = []) {
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
        const txt = await response.text();
        throw new Error(`Database Error: ${response.status} - ${txt}`);
    }

    const data = await response.json();
    return data.results[0]?.response?.result;
}

async function main() {
    console.log("Setting up Adsterra Script via Raw Fetch...");

    const scriptCode = `
<script>
  atOptions = {
    'key' : '1a207cd775f2c2cd48de53d771f6f575',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/1a207cd775f2c2cd48de53d771f6f575/invoke.js"></script>
    `.trim();

    try {
        // 1. Check existing
        const checkRes = await tursoExecute("SELECT id FROM ad_settings LIMIT 1");

        if (checkRes.rows.length > 0) {
            const id = checkRes.rows[0].row[0].value; // Turso result format might vary, being safe?
            // Actually Turso v2 JSON: rows: [ { type: "text", value: "..." } ]?
            // No, standard is rows: [ [ {type, value}, ... ] ]?
            // Let's just run UPDATE without WHERE if we assume singleton or ID=1
            // Or just UPDATE where is_active is anything.

            console.log("Updating existing ad settings...");
            await tursoExecute(
                "UPDATE ad_settings SET type = 'script', script_code = ?, is_active = 1, updated_at = ? WHERE id = ?",
                [
                    { type: "text", value: scriptCode },
                    { type: "text", value: new Date().toISOString() },
                    { type: "integer", value: id?.value || id }
                ]
            );
        } else {
            console.log("Inserting new ad settings...");
            await tursoExecute(
                "INSERT INTO ad_settings (type, script_code, is_active, updated_at) VALUES ('script', ?, 1, ?)",
                [
                    { type: "text", value: scriptCode },
                    { type: "text", value: new Date().toISOString() }
                ]
            );
        }

        console.log("Success! Adsterra script installed.");
    } catch (error) {
        console.error("Error setting ad:", error);
    }
}

main();
