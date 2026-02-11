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
        const text = await response.text();
        console.error(text);
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
        console.log("Starting Site Settings Migration...");

        await execute(`
            CREATE TABLE IF NOT EXISTS site_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value TEXT,
                updated_at INTEGER
            )
        `);

        // Initialize with empty pixel id if not exists
        await execute(`
            INSERT OR IGNORE INTO site_settings (key, value, updated_at) 
            VALUES ('facebook_pixel_id', '', ${Date.now()})
        `);

        console.log("Migration complete");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

run();
