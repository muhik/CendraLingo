import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { userTreasureLog, vouchers } from "@/db/schema";
import { eq } from "drizzle-orm";

// Wheel segments configuration
// User Request: "zonk nya 5 kirakira irisannya ada 11"
// Total 11 Segments: 5 Zonks, 6 Prizes.
// Prizes: Rp 5 (x3), Rp 15 (x2), Rp 25 (x1).
// Weights maintained approx: Rp 5 (30%), Rp 15 (16%), Rp 25 (4%), Zonk (50%)
// Wheel segments configuration
// User Request: Separate Rp and Gems rewards. Total 11 segments.
// 1. Rp 5, 2. Rp 15, 3. Rp 25
// 4. 5 Gems, 5. 10 Gems, 6. 25 Gems
// 7. 5x Zonk
const SEGMENTS = [
    { label: "Rp 5", rp: 5, gems: 0, weight: 10 },               // 1. Rp 5
    { label: "ZONK", rp: 0, gems: 0, weight: 10 },               // Zonk 1
    { label: "5 Gems", rp: 0, gems: 5, weight: 10 },             // 4. 5 Gems
    { label: "ZONK", rp: 0, gems: 0, weight: 10 },               // Zonk 2
    { label: "Rp 15", rp: 15, gems: 0, weight: 8 },              // 2. Rp 15
    { label: "ZONK", rp: 0, gems: 0, weight: 10 },               // Zonk 3
    { label: "10 Gems", rp: 0, gems: 10, weight: 8 },            // 5. 10 Gems
    { label: "ZONK", rp: 0, gems: 0, weight: 10 },               // Zonk 4
    { label: "Rp 25", rp: 25, gems: 0, weight: 4 },              // 3. Rp 25
    { label: "ZONK", rp: 0, gems: 0, weight: 10 },               // Zonk 5
    { label: "25 Gems", rp: 0, gems: 25, weight: 10 },           // 6. 25 Gems (Remainder to 100%)
];

// Calculate weighted random segment
function getRandomSegment(): number {
    const totalWeight = SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < SEGMENTS.length; i++) {
        random -= SEGMENTS[i].weight;
        if (random <= 0) {
            return i;
        }
    }
    return 0; // Fallback
}

// Generate unique voucher code
function generateVoucherCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "SPIN-";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;

        // Validate userId
        if (!userId) {
            return NextResponse.json(
                { error: "User ID diperlukan. Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        const today = getTodayDate();

        // 1. Check if user already spun today using Drizzle
        const treasureLog = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();

        if (treasureLog && treasureLog.lastSpinDate === today) {
            return NextResponse.json({
                error: "Kamu sudah spin hari ini! Coba lagi besok ya. 🎰",
                alreadySpun: true,
            }, { status: 429 });
        }

        // 2. Get random segment
        const segmentIndex = getRandomSegment();
        const segment = SEGMENTS[segmentIndex];

        // 3. Update user's last_spin_date in user_treasure_log
        if (treasureLog) {
            await db.update(userTreasureLog)
                .set({ lastSpinDate: today })
                .where(eq(userTreasureLog.userId, userId));
        } else {
            // Upsert if not exists, grant access
            await db.insert(userTreasureLog).values({
                userId,
                hasTreasureAccess: true,
                lastSpinDate: today,
                createdAt: new Date(),
            });
        }

        if (segment.rp === 0 && segment.gems === 0) {
            // ZONK - no voucher generated
            return NextResponse.json({
                segmentIndex,
                gemsWon: 0,
                cashbackWon: 0,
                voucherCode: null,
                message: "Zonk! Coba lagi besok. 😅",
            });
        }

        // 4. Generate voucher code
        const voucherCode = generateVoucherCode();

        // 5. Insert voucher into database (Dual Reward)
        await db.insert(vouchers).values({
            code: voucherCode,
            valueRp: segment.rp,          // Cashback Value
            gemsAmount: segment.gems,     // Gems Value
            cashbackAmount: segment.rp,   // Redundant but specific
            isClaimed: false,
            createdAt: new Date(),
        });

        return NextResponse.json({
            segmentIndex,
            gemsWon: segment.gems,
            cashbackWon: segment.rp,
            voucherCode,
            message: `Selamat! Dapat Rp ${segment.rp} + ${segment.gems} Gems! 🎉`,
        });

    } catch (error) {
        console.error("Spin error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server: " + String(error) }, // Include error detail for debugging
            { status: 500 }
        );
    }
}
