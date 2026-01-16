import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { redeemRequests, userProgress } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// POST: Update redeem request status (approve/reject/complete)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, status, adminNotes } = body;

        // Validate
        if (!id || !status) {
            return NextResponse.json(
                { error: "ID dan status diperlukan" },
                { status: 400 }
            );
        }

        const validStatuses = ["pending", "approved", "completed", "rejected"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Status tidak valid" },
                { status: 400 }
            );
        }

        // Get the redeem request first to know the amount and userId
        const redeemRequest = await db
            .select()
            .from(redeemRequests)
            .where(eq(redeemRequests.id, id))
            .limit(1);

        if (!redeemRequest || redeemRequest.length === 0) {
            return NextResponse.json(
                { error: "Request tidak ditemukan" },
                { status: 404 }
            );
        }

        const request_data = redeemRequest[0];

        // If rejecting, refund the cashback to user
        if (status === "rejected" && request_data.status !== "rejected") {
            await db.update(userProgress)
                .set({
                    // Add back the rupiah amount to cashback balance
                    // Using raw SQL for increment
                })
                .where(eq(userProgress.userId, request_data.userId));

            // Update cashback balance by adding the amount back
            await db.run(sql`
                UPDATE user_progress 
                SET cashback_balance = cashback_balance + ${request_data.rupiahAmount}
                WHERE user_id = ${request_data.userId}
            `);
        }

        // Update the request status
        await db.update(redeemRequests)
            .set({
                status,
                adminNotes: adminNotes || null,
                processedAt: status !== "pending" ? new Date() : null,
            })
            .where(eq(redeemRequests.id, id));

        return NextResponse.json({
            success: true,
            message: status === "rejected"
                ? `Request ditolak. Rp ${request_data.rupiahAmount?.toLocaleString()} dikembalikan ke saldo user.`
                : `Status berhasil diubah ke ${status}`,
        });

    } catch (error) {
        console.error("Update redeem request error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
