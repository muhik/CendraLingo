import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { redeemRequests } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET: Fetch all redeem requests for admin
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // Optional filter

        let query = db.select().from(redeemRequests).orderBy(desc(redeemRequests.createdAt));

        const requests = await query;

        // Filter by status if provided
        // Filter by status if provided
        const filteredRequests = status
            ? requests.filter((r: any) => r.status === status)
            : requests;

        // Count pending for notification badge
        const pendingCount = requests.filter((r: any) => r.status === "pending").length;

        return NextResponse.json({
            requests: filteredRequests,
            pendingCount,
            total: requests.length,
        });

    } catch (error) {
        console.error("Get redeem requests error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
