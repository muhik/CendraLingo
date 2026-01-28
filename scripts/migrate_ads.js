const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
        env[key] = val;
    }
});

const url = env.TURSO_CONNECTION_URL;
const token = env.TURSO_AUTH_TOKEN;

if (!url || !token) {
    console.error("Missing TURSO credentials");
    process.exit(1);
}

async function execute(sql) {
    console.log(`Executing: ${sql}`);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            statements: [{ q: sql, params: [] }]
        })
    });

    if (!response.ok) {
        console.error(`HTTP Error: ${response.status}`);
        return;
    }

    const data = await response.json();
    if (data[0]?.error) {
        console.warn(`Error (likely already exists): ${data[0].error.message}`);
    } else {
        console.log("Success");
    }
}

async function run() {
    try {
        console.log("Starting Ad Settings Migration...");
        await execute("ALTER TABLE ad_settings ADD COLUMN title TEXT DEFAULT 'New Ad'");
        await execute("ALTER TABLE ad_settings ADD COLUMN placement TEXT DEFAULT 'banner'");
        await execute("ALTER TABLE ad_settings ADD COLUMN weight INTEGER DEFAULT 50");
        await execute("ALTER TABLE ad_settings ADD COLUMN frequency INTEGER DEFAULT 0");
        console.log("Migration complete");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

run();
