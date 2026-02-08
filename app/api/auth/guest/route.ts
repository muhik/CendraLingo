import { NextResponse } from "next/server";
import { tursoQuery, tursoExecute } from "@/db/turso-http";
import { v4 as uuidv4 } from "uuid";
import { cookies, headers } from "next/headers";

export const POST = async (req: Request) => {
    try {
        const cookieStore = await cookies();
        const headersList = await headers();

        // 1. CHECK EXISTING COOKIE - Resume old session (NO NEW RESOURCES)
        const existingGuestId = cookieStore.get("guest_session_id")?.value;
        if (existingGuestId) {
            const existingGuests = await tursoQuery(
                "SELECT id, name FROM users WHERE id = ?",
                [existingGuestId]
            );

            if (existingGuests.length > 0) {
                return NextResponse.json({
                    success: true,
                    userId: existingGuestId,
                    name: existingGuests[0].name,
                    isGuest: true,
                    resumed: true,
                    message: "Melanjutkan sesi sebelumnya"
                });
            }
        }

        // 2. CHECK FRONTEND FINGERPRINT (sent as header)
        const frontendFingerprint = headersList.get("x-guest-fingerprint");
        if (frontendFingerprint) {
            const fingerprintGuests = await tursoQuery(
                "SELECT id, name FROM users WHERE email = ?",
                [`fp_${frontendFingerprint}@guest.com`]
            );

            if (fingerprintGuests.length > 0) {
                const existingId = fingerprintGuests[0].id;
                cookieStore.set("guest_session_id", existingId, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 365,
                    httpOnly: true,
                    sameSite: "lax"
                });

                return NextResponse.json({
                    success: true,
                    userId: existingId,
                    name: fingerprintGuests[0].name,
                    isGuest: true,
                    resumed: true,
                    message: "Sesi ditemukan berdasarkan perangkat"
                });
            }
        }

        // 3. CREATE NEW GUEST (Fresh user, gets initial resources)
        const guestId = uuidv4();
        const guestName = "Guest Learner";
        const guestEmail = frontendFingerprint
            ? `fp_${frontendFingerprint}@guest.com`
            : `guest_${guestId}@cendralingo.com`;
        const guestPassword = `guest_${guestId}_secret`;

        // Create Shadow User
        await tursoExecute(
            "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [guestId, guestName, guestEmail, guestPassword, "user", new Date().toISOString()]
        );

        // Initialize User Progress with STINGY resources
        await tursoExecute(
            `INSERT INTO user_progress (user_id, user_name, user_image, active_course_id, hearts, points, is_guest, has_active_subscription) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [guestId, guestName, "/mascot.svg", 1, 2, 3, 1, 0]
        );

        // Set cookie for future visits
        cookieStore.set("guest_session_id", guestId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            httpOnly: true,
            sameSite: "lax"
        });

        return NextResponse.json({
            success: true,
            userId: guestId,
            name: guestName,
            isGuest: true,
            resumed: false,
        });

    } catch (error) {
        console.error("[GUEST_AUTH_ERROR]", error);
        return NextResponse.json({
            success: false,
            message: "Failed to create guest session"
        }, { status: 500 });
    }
};
