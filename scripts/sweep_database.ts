import fs from 'fs';
import path from 'path';

async function sweepDatabase() {
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

    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║           DATABASE SWEEPING - TURSO CENDRALINGO              ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");

    // Get all tables
    const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const tables = tablesResult.rows.map(r => r.name as string);

    console.log(`📊 Found ${tables.length} tables:\n`);

    for (const table of tables) {
        console.log(`\n┌─────────────────────────────────────────────────────────────┐`);
        console.log(`│ TABLE: ${table.toUpperCase().padEnd(52)} │`);
        console.log(`└─────────────────────────────────────────────────────────────┘`);

        try {
            // Get row count
            const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
            const count = countResult.rows[0]?.count || 0;
            console.log(`  Total rows: ${count}`);

            if (count > 0) {
                // Get sample data (up to 5 rows)
                const dataResult = await client.execute(`SELECT * FROM ${table} LIMIT 5`);

                if (dataResult.rows.length > 0) {
                    console.log(`  Sample data:`);
                    dataResult.rows.forEach((row, i) => {
                        console.log(`\n  [${i + 1}]`, JSON.stringify(row, null, 2).split('\n').join('\n      '));
                    });
                }

                if (Number(count) > 5) {
                    console.log(`\n  ... and ${Number(count) - 5} more rows`);
                }
            } else {
                console.log(`  (empty table)`);
            }
        } catch (e: any) {
            console.log(`  Error reading table: ${e.message}`);
        }
    }

    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("                     SWEEPING COMPLETE");
    console.log("═══════════════════════════════════════════════════════════════\n");

    client.close();
}

sweepDatabase();
