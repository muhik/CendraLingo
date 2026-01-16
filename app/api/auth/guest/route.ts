import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { users, userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const existingGuestId = cookieStore.get("guest_session_id")?.value;

        // CHECK 1: If cookie exists, verify if user is really in DB (and is GUEST)
        if (existingGuestId) {
            const existingUser = await db.query.users.findFirst({
                where: and(eq(users.id, existingGuestId), eq(users.role, "guest"))
            });

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
        const guestEmail = `${userId}@guest.com`;

        // Use a transaction (Drizzle)
        await db.transaction(async (tx) => {
            await tx.insert(users).values({
                id: userId,
                name: defaultName,
                email: guestEmail,
                password: "guest_pass",
                role: "guest",
                createdAt: now
            });

            await tx.insert(userProgress).values({
                userId: userId,
                userName: defaultName,
                userImage: "/mascot.svg",
                hearts: 5,
                points: 0,
                isGuest: true,
                hasActiveSubscription: false
            });
        });

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
