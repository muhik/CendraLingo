import fs from 'fs';
import path from 'path';

async function migrateSecurity() {
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
    }

    const { createClient } = await import("@libsql/client");
    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!
    });

    console.log("🛡️  MIGRATING SECURITY TABLES...\n");

    try {
        await client.execute(`
            CREATE TABLE IF NOT EXISTS security_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                user_name TEXT,
                event_type TEXT,
                description TEXT,
                severity TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_resolved INTEGER DEFAULT 0
            )
        `);
        console.log("   ✅ Created table: security_logs");

        // Optional: Create a separate table for rate limiting if we want to be fancy, 
        // but for now we might handle it in logs or memory/KV (KV not available easily here without wrangler binding setup, so DB table is safer).
        await client.execute(`
            CREATE TABLE IF NOT EXISTS rate_limits (
                key TEXT PRIMARY KEY,
                count INTEGER DEFAULT 1,
                last_request INTEGER,
                blocked_until INTEGER
            )
        `);
        console.log("   ✅ Created table: rate_limits");

    } catch (e: any) {
        console.log(`   ❌ Error: ${e.message}`);
    }

    console.log("\n🔒 SECURITY MIGRATION COMPLETE!\n");
    client.close();
}

migrateSecurity();
