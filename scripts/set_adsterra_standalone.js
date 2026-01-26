
const fs = require('fs');
const path = require('path');

// Manually parse .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) { }

const dbUrl = process.env.TURSO_CONNECTION_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN;

console.log("DB URL Host:", dbUrl ? dbUrl.split('@')[1] || dbUrl : "MISSING"); // Masked

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

    const data = await response.json();
    return data; // Return full response
}

async function main() {
    console.log("Querying DB...");
    try {
        const res = await tursoExecute("SELECT * FROM ad_settings");
        console.log("Raw Response:", JSON.stringify(res, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
