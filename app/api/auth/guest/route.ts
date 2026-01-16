import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";

const dbPath = path.join(process.cwd(), "local.db");

export async function POST() {
    try {
        const database = new db(dbPath);
        const cookieStore = await cookies();
        const existingGuestId = cookieStore.get("guest_session_id")?.value;

        // CHECK 1: If cookie exists, verify if user is really in DB (and is GUEST)
        if (existingGuestId) {
            const existingUser = database.prepare("SELECT id FROM users WHERE id = ? AND role = 'guest'").get(existingGuestId);
            if (existingUser) {
                return NextResponse.json({
                    success: true,
                    userId: existingGuestId,
                    message: "Resuming existing guest session"
                });
            }
        }

        // CHECK 2: Create NEW Guest if no valid cookie found
        const userId = uuidv4();
        const now = new Date();
        const defaultName = `Guest-${userId.substring(0, 6)}`;

        // Use a transaction
        const runTransaction = database.transaction(() => {
            const guestEmail = `${userId}@guest.com`;

            database.prepare(`
                INSERT INTO users (id, name, email, password, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(userId, defaultName, guestEmail, "guest_pass", "guest", now.getTime());

            database.prepare(`
                INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                userId,
                defaultName,
                "/mascot.svg",
                5,
                0,
                1,
                0
            );
        });

        runTransaction();

        // SET COOKIE (Persistent for 1 year)
        cookieStore.set("guest_session_id", userId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 Year
            httpOnly: true, // Secure, JS cannot access (good)
            sameSite: "lax"
        });

        return NextResponse.json({
            success: true,
            userId,
            message: "New guest session created"
        });

    } catch (error) {
        console.error("[GUEST_AUTH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
