import fs from 'fs';
import path from 'path';

async function resetPassword() {
    // 1. Load .env manually FIRST
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const firstEq = line.indexOf('=');
            if (firstEq > 0) {
                const key = line.slice(0, firstEq).trim();
                const value = line.slice(firstEq + 1).trim();
                // Ensure we handle quotes if present (simple)
                // Cloudflare often doesn't need quotes but .env might have them.
                const cleanValue = value.replace(/^"|"$/g, '');
                if (key && cleanValue) process.env[key] = cleanValue;
            }
        });
        console.log("Environment loaded.");
    } catch (e) {
        console.log(".env not found or error reading");
        return;
    }

    // 2. Dynamic Import Drizzle (AFTER env is loaded)
    const { db } = await import("../db/drizzle");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    // 3. Hash Helper
    const hashPassword = async (password: string): Promise<string> => {
        const cryptoSubtle = globalThis.crypto?.subtle;
        if (!cryptoSubtle) throw new Error("Web Crypto API not available");
        const encoder = new TextEncoder();
        const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
        const keyMaterial = await cryptoSubtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
        const derivedKey = await cryptoSubtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
        const hashHex = Array.from(new Uint8Array(derivedKey)).map(b => b.toString(16).padStart(2, "0")).join("");
        return `${saltHex}:${hashHex}`;
    };

    console.log("Searching for user 'ikbal'...");
    try {
        const allUsers = await db.select().from(users).all();
        const targetUser = allUsers.find(u =>
            u.name.toLowerCase().includes('ikbal') ||
            u.email.toLowerCase().includes('ikbal')
        );

        if (!targetUser) {
            console.log("User 'ikbal' not found!");
            return;
        }

        console.log(`Found user: ${targetUser.name} (${targetUser.email})`);
        const newPassword = "123456";
        const hashedPassword = await hashPassword(newPassword);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, targetUser.id));

        console.log(`PASSWORD SUCCESSFULLY RESET TO: ${newPassword}`);
    } catch (e) {
        console.error("Error resetting password:", e);
    }
}

resetPassword();
