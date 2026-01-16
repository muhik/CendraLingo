import fs from 'fs';
import path from 'path';

async function checkTables() {
    // Load .env
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const firstEq = line.indexOf('=');
            if (firstEq > 0) {
                const key = line.slice(0, firstEq).trim();
                const value = line.slice(firstEq + 1).trim();
                if (key && value) process.env[key] = value;
            }
        });
    } catch (e) {
        console.log(".env not found");
        return;
    }

    const { createClient } = await import("@libsql/client");

    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!
    });

    console.log("Connected to Turso. Checking tables...\n");

    // List all tables
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables in database:");
    result.rows.forEach(row => console.log(" -", row.name));

    // Try a simple query on user_progress
    try {
        const rows = await client.execute("SELECT COUNT(*) as count FROM user_progress");
        console.log("\nuser_progress row count:", rows.rows[0].count);
    } catch (e: any) {
        console.log("\nuser_progress query error:", e.message);
    }

    client.close();
}

checkTables();
