import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { redeemRequests } from "@/db/schema";

// No minimum - even Rp 1 is allowed
const MIN_REDEEM_RUPIAH = 1;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, userName, rupiahAmount, paymentMethod, accountNumber } = body;

        // Validate required fields
        if (!userId || !rupiahAmount || !paymentMethod || !accountNumber) {
            return NextResponse.json(
                { error: "Data tidak lengkap" },
                { status: 400 }
            );
        }

        // Validate minimum amount
        if (rupiahAmount < MIN_REDEEM_RUPIAH) {
            return NextResponse.json(
                { error: `Minimum penarikan adalah Rp ${MIN_REDEEM_RUPIAH}` },
                { status: 400 }
            );
        }

        // Validate payment method (only DANA for now)
        if (paymentMethod.toUpperCase() !== "DANA") {
            return NextResponse.json(
                { error: "Saat ini hanya mendukung DANA" },
                { status: 400 }
            );
        }

        // Create redeem request
        await db.insert(redeemRequests).values({
            userId,
            userName: userName || "User",
            gemsAmount: 0, // Not using gems anymore
            rupiahAmount,
            paymentMethod: paymentMethod.toUpperCase(),
            accountNumber,
            accountName: null,
            status: "pending",
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: "Permintaan berhasil dikirim! Admin akan segera memproses.",
            rupiahAmount,
        });

    } catch (error) {
        console.error("Redeem request error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
