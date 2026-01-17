import fs from 'fs';
import path from 'path';

async function seedDatabase() {
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

    console.log("🌱 SEEDING DATABASE WITH SAMPLE DATA...\n");

    const now = Date.now();

    // 1. Sample Users
    console.log("📝 Creating sample users...");
    const users = [
        { id: "user-ikbal-001", name: "Ikbal", email: "ikbal@example.com", password: "hashed123", role: "user" },
        { id: "user-budi-002", name: "Budi Santoso", email: "budi@example.com", password: "hashed123", role: "user" },
        { id: "user-siti-003", name: "Siti Rahayu", email: "siti@example.com", password: "hashed123", role: "user" },
        { id: "user-admin-000", name: "Admin", email: "admin@cendralingo.com", password: "hashed123", role: "admin" },
    ];
    for (const u of users) {
        await client.execute({
            sql: "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            args: [u.id, u.name, u.email, u.password, u.role, now]
        });
    }
    console.log(`   ✅ ${users.length} users created`);

    // 2. Sample User Progress
    console.log("📊 Creating user progress...");
    const progress = [
        { userId: "user-ikbal-001", userName: "Ikbal", points: 1500, hearts: 5 },
        { userId: "user-budi-002", userName: "Budi Santoso", points: 2300, hearts: 3 },
        { userId: "user-siti-003", userName: "Siti Rahayu", points: 890, hearts: 5 },
        { userId: "user-admin-000", userName: "Admin", points: 9999, hearts: 100 },
    ];
    for (const p of progress) {
        await client.execute({
            sql: "INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [p.userId, p.userName, "/mascot.svg", p.hearts, p.points, 0, 1]
        });
    }
    console.log(`   ✅ ${progress.length} user progress created`);

    // 3. Sample Vouchers
    console.log("🎟️ Creating sample vouchers...");
    const vouchers = [
        { code: "SAMPLE-AAA111", valueRp: 10000, gems: 100 },
        { code: "SAMPLE-BBB222", valueRp: 25000, gems: 250 },
        { code: "SAMPLE-CCC333", valueRp: 50000, gems: 500 },
    ];
    for (const v of vouchers) {
        await client.execute({
            sql: "INSERT INTO vouchers (code, value_rp, gems_amount, cashback_amount, is_claimed, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            args: [v.code, v.valueRp, v.gems, Math.floor(v.valueRp * 0.01), 0, now]
        });
    }
    console.log(`   ✅ ${vouchers.length} vouchers created`);

    // 4. Sample Ad Settings
    console.log("📢 Creating ad settings...");
    await client.execute({
        sql: "INSERT INTO ad_settings (id, type, script_code, image_url, target_url, is_active, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [1, "image", "", "https://placehold.co/728x90/png?text=Sample+Ad", "https://example.com", 1, new Date().toISOString()]
    });
    console.log(`   ✅ Ad settings created`);

    // 5. Sample Treasure Settings
    console.log("🎰 Creating treasure settings...");
    await client.execute({
        sql: "INSERT INTO treasure_settings (paid4link_url, is_enabled, require_paid4link, updated_at) VALUES (?, ?, ?, ?)",
        args: ["https://paid4link.com/sample", 1, 0, now]
    });
    console.log(`   ✅ Treasure settings created`);

    // 6. Sample Feedback
    console.log("💬 Creating sample feedback...");
    await client.execute({
        sql: "INSERT INTO feedbacks (user_id, user_name, message, type, created_at) VALUES (?, ?, ?, ?, ?)",
        args: ["user-ikbal-001", "Ikbal", "Aplikasi ini sangat membantu belajar!", "pujian", new Date().toISOString()]
    });
    await client.execute({
        sql: "INSERT INTO feedbacks (user_id, user_name, message, type, created_at) VALUES (?, ?, ?, ?, ?)",
        args: ["user-budi-002", "Budi Santoso", "Tolong tambahkan materi matematika lebih banyak", "saran", new Date().toISOString()]
    });
    console.log(`   ✅ 2 feedbacks created`);

    console.log("\n🎉 DATABASE SEEDING COMPLETE!\n");
    console.log("Data yang ditambahkan:");
    console.log("- 4 users (termasuk 1 admin)");
    console.log("- 4 user progress records");
    console.log("- 3 vouchers (belum diklaim)");
    console.log("- 1 ad setting");
    console.log("- 1 treasure setting");
    console.log("- 2 feedbacks");

    client.close();
}

seedDatabase();
