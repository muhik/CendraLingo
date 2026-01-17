import fs from 'fs';
import path from 'path';

async function clearDatabase() {
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

    console.log("🗑️  CLEARING ALL DATA FROM DATABASE...\n");

    const tables = [
        "feedbacks",
        "user_treasure_log",
        "redeem_requests",
        "vouchers",
        "user_progress",
        "users",
        "treasure_settings",
        "ad_settings"
    ];

    for (const table of tables) {
        try {
            await client.execute(`DELETE FROM ${table}`);
            console.log(`   ✅ Cleared: ${table}`);
        } catch (e: any) {
            console.log(`   ⚠️  Error clearing ${table}: ${e.message}`);
        }
    }

    console.log("\n🧹 DATABASE CLEARED!\n");
    console.log("Semua data sudah dihapus. Database kembali kosong.");

    client.close();
}

clearDatabase();
