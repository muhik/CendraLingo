import fs from 'fs';
import path from 'path';

async function migrate() {
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
        console.log("Environment loaded.");
    } catch (e) {
        console.log(".env not found");
        return;
    }

    // Import after env loaded
    const { createClient } = await import("@libsql/client");

    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!
    });

    console.log("Connected to Turso. Running migrations...");

    // Create all tables
    const migrations = [
        `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at INTEGER NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS user_progress (
            user_id TEXT PRIMARY KEY,
            user_name TEXT NOT NULL DEFAULT 'User',
            user_image TEXT NOT NULL DEFAULT '/mascot.svg',
            active_course_id INTEGER,
            hearts INTEGER NOT NULL DEFAULT 5,
            points INTEGER NOT NULL DEFAULT 0,
            cashback_balance INTEGER NOT NULL DEFAULT 0,
            is_guest INTEGER NOT NULL DEFAULT 1,
            has_active_subscription INTEGER NOT NULL DEFAULT 0,
            subscription_ends_at INTEGER,
            last_spin_date TEXT,
            is_course_completed INTEGER NOT NULL DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS vouchers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            value_rp INTEGER NOT NULL,
            gems_amount INTEGER NOT NULL,
            cashback_amount INTEGER NOT NULL DEFAULT 0,
            is_claimed INTEGER NOT NULL DEFAULT 0,
            claimed_by TEXT,
            claimed_at INTEGER,
            created_at INTEGER NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS redeem_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            gems_amount INTEGER NOT NULL,
            rupiah_amount INTEGER NOT NULL,
            payment_method TEXT NOT NULL,
            account_number TEXT NOT NULL,
            account_name TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            admin_notes TEXT,
            created_at INTEGER NOT NULL,
            processed_at INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS user_treasure_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL UNIQUE,
            has_treasure_access INTEGER NOT NULL DEFAULT 0,
            treasure_access_date TEXT,
            last_spin_date TEXT,
            created_at INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS treasure_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paid4link_url TEXT,
            is_enabled INTEGER NOT NULL DEFAULT 1,
            require_paid4link INTEGER NOT NULL DEFAULT 0,
            updated_at INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS ad_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT DEFAULT 'image',
            script_code TEXT,
            image_url TEXT,
            target_url TEXT,
            is_active INTEGER DEFAULT 0,
            updated_at TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS feedbacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_name TEXT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'saran',
            created_at TEXT
        )`
    ];

    for (const sql of migrations) {
        try {
            await client.execute(sql);
            console.log("✓ Created table");
        } catch (e: any) {
            console.log("Error:", e.message);
        }
    }

    console.log("\n✅ All migrations complete!");
    client.close();
}

migrate();
