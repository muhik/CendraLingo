import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const callbackToken = req.headers.get("x-callback-token");
        // Verify Token (Optional for localhost, Mandatory for Prod)
        // if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
        //     return new NextResponse("Unauthorized", { status: 401 });
        // }

        const body = await req.json();
        const { status, external_id, amount } = body;

        console.log("🔔 Xendit Webhook:", { status, external_id, amount });

        if (status === "PAID") {
            const parts = external_id.split("-");
            const type = parts[0]; // PRO or GEMS
            const userId = parts[1];

            if (!userId) {
                console.error("❌ Invalid External ID format:", external_id);
                return new NextResponse("Invalid ID", { status: 400 });
            }

            // 1. Handle PRO Subscription
            if (type === "PRO") {
                await db.update(userProgress)
                    .set({
                        hasActiveSubscription: true,
                        points: sql`points + 1000`, // Bonus 1000 Gems
                        hearts: 100 // Bonus/Refill 100 Hearts
                    })
                    .where(eq(userProgress.userId, userId));

                console.log(`✅ User ${userId} upgraded to PRO!`);
            }
            // 2. Handle GEMS Top Up
            else if (type === "GEMS") {
                // Determine Gem amount from payment amount 
                // (Rough logic, ideally pass strict IDs or handle dynamic)
                let gemAmount = 0;

                // Map Price to Gems
                if (amount === 1000) gemAmount = 10;
                else if (amount === 5000) gemAmount = 55;
                else if (amount === 10000) gemAmount = 120;
                else {
                    // Fallback: 1 Gem = Rp 100 (Custom)
                    gemAmount = Math.floor(amount / 100);
                }

                await db.update(userProgress)
                    .set({
                        points: sql`points + ${gemAmount}`
                    })
                    .where(eq(userProgress.userId, userId));

                console.log(`✅ User ${userId} topped up ${gemAmount} Gems!`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
