import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        // Get last 4 users to show overlap
        const recentUsers = await db.select({
            name: users.name,
            email: users.email
        })
            .from(users)
            .orderBy(desc(users.createdAt))
            .limit(4);

        return NextResponse.json(recentUsers);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
