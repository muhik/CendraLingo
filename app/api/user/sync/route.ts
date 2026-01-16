import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
        }

        const user = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).get();

        if (user) {
            return NextResponse.json({ success: true, user });
        } else {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

    } catch (error) {
        console.error("Fetch User Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, hearts, points, isGuest, hasActiveSubscription, cashbackBalance } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
        }

        const existingUser = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).get();

        if (existingUser) {
            // Update
            // Safety: Don't overwrite cashback if client sends 0 but DB has money
            const newCashback = cashbackBalance > 0 ? cashbackBalance : (existingUser.cashbackBalance || 0);

            await db.update(userProgress).set({
                hearts,
                points,
                isGuest,
                hasActiveSubscription,
                cashbackBalance: newCashback,
            }).where(eq(userProgress.userId, userId));
        } else {
            // Insert
            await db.insert(userProgress).values({
                userId,
                hearts,
                points,
                isGuest,
                hasActiveSubscription,
                cashbackBalance: cashbackBalance || 0,
                userName: "New User", // Default
                userImage: "/mascot.svg"
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sync Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
