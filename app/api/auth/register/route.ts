import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { users, userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

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

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existingUser) {
            return NextResponse.json({ message: "Email already registered" }, { status: 409 });
        }

        // Hash Password
        const hashedPassword = await hashPassword(password);
        const userId = uuidv4();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 Days

        await db.transaction(async (tx) => {
            // SCENARIO 1: UPGRADE EXISTING GUEST (Server-Side Guest)
            if (guestId) {
                // Check if guest exists first
                const guestUser = await tx.query.users.findFirst({
                    where: and(eq(users.id, guestId), eq(users.role, "guest"))
                });

                if (guestUser) {
                    // Update the EXISTING user record
                    await tx.update(users)
                        .set({
                            name,
                            email,
                            password: hashedPassword,
                            role: "user"
                        })
                        .where(eq(users.id, guestId));

                    // Update User Progress (Merge logic)
                    const finalPoints = (guestPoints || 0) + 1000;
                    const finalHearts = (guestHearts !== undefined) ? guestHearts : 5;

                    await tx.update(userProgress)
                        .set({
                            userName: name,
                            points: finalPoints,
                            hearts: finalHearts,
                            isGuest: false,
                            hasActiveSubscription: true,
                            subscriptionEndsAt: expiresAt
                        })
                        .where(eq(userProgress.userId, guestId));

                    return; // Done
                }
            }

            // SCENARIO 2: NEW USER (Normal Register)
            await tx.insert(users).values({
                id: userId,
                name,
                email,
                password: hashedPassword,
                role: "user",
                createdAt: now
            });

            await tx.insert(userProgress).values({
                userId,
                userName: name,
                userImage: "/mascot.svg",
                hearts: 5,
                points: 1000, // Bonus 1000 gems
                isGuest: false,
                hasActiveSubscription: true, // Bonus Subscription
                subscriptionEndsAt: expiresAt
            });
        });

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
