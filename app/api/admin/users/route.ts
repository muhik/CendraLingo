import { db } from "@/db/drizzle";
export const runtime = "edge";
import { userProgress } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const users = await db.select().from(userProgress);
        return NextResponse.json(users);
    } catch (error) {
        console.error("Admin users fetch error:", error);
        return NextResponse.json([], { status: 500 });
    }
}

