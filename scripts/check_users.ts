import fs from 'fs';
import path from 'path';

async function listUsers() {
    // 1. Load .env manually FIRST
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const firstEq = line.indexOf('=');
            if (firstEq > 0) {
                const key = line.slice(0, firstEq).trim();
                const value = line.slice(firstEq + 1).trim();
                const cleanValue = value.replace(/^"|"$/g, '');
                if (key && cleanValue) process.env[key] = cleanValue;
            }
        });
        console.log("Environment loaded.");
    } catch (e) {
        console.log(".env not found or error reading");
        return;
    }

    // 2. Dynamic Import
    const { db } = await import("../db/drizzle");
    const { users } = await import("../db/schema");

    // 3. Query
    try {
        const allUsers = await db.select().from(users).all();
        console.log(`\n=== FOUND ${allUsers.length} USERS ===`);
        if (allUsers.length === 0) {
            console.log("No users found.");
        } else {
            allUsers.forEach(u => {
                console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u.id}`);
            });
        }
        console.log("==========================\n");
    } catch (e) {
        console.error("Error listing users:", e);
    }
}

listUsers();
