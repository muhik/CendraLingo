
import { NextResponse } from "next/server";
import db from "better-sqlite3";
import path from "path";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const dbPath = path.join(process.cwd(), "local.db");

// Helper for password hashing
const hashPassword = (password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString("hex"));
        });
    });
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, guestId, guestPoints, guestHearts } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const database = new db(dbPath);

        // Check if user exists
        const existingUser = database.prepare("SELECT * FROM users WHERE email = ?").get(email);
        if (existingUser) {
            return NextResponse.json({ message: "Email already registered" }, { status: 409 });
        }

        // Hash Password
        const hashedPassword = await hashPassword(password);
        const userId = uuidv4();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 Days

        const runTransaction = database.transaction(() => {
            // SCENARIO 1: UPGRADE EXISTING GUEST (Server-Side Guest)
            if (guestId) {
                // Check if guest exists first
                const guestUser = database.prepare("SELECT * FROM users WHERE id = ? AND role = 'guest'").get(guestId);

                if (guestUser) {
                    // Update the EXISTING user record
                    database.prepare(`
                        UPDATE users 
                        SET name = ?, email = ?, password = ?, role = 'user'
                        WHERE id = ?
                    `).run(name, email, hashedPassword, guestId);

                    // Update User Progress (Merge logic)
                    // If guest had progress, we keep it. We just update the name/image if needed.
                    // If we want to give bonus, we update points.
                    const finalPoints = (guestPoints || 0) + 1000;
                    const finalHearts = (guestHearts !== undefined) ? guestHearts : 5;

                    database.prepare(`
                        UPDATE user_progress 
                        SET user_name = ?, points = ?, hearts = ?, is_guest = 0, has_active_subscription = 1, subscription_ends_at = ?
                        WHERE user_id = ?
                    `).run(name, finalPoints, finalHearts, expiresAt.getTime(), guestId);

                    return; // Done
                }
            }

            // SCENARIO 2: NEW USER (Normal Register)
            // Insert into users table
            database.prepare(`
                INSERT INTO users (id, name, email, password, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(userId, name, email, hashedPassword, "user", new Date().getTime());

            // Initialize user_progress
            database.prepare(`
                INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription, subscription_ends_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                userId,
                name,
                "/mascot.svg",
                5,
                1000, // Bonus 1000 gems
                0, // is_guest = false
                1, // Bonus Subscription
                expiresAt.getTime()
            );
        });

        runTransaction();

        return NextResponse.json({
            success: true,
            userId,
            name,
            message: "Account created! 1000 Gems Bonus Added!"
        });

    } catch (error) {
        console.error("[REGISTER_ERROR]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
