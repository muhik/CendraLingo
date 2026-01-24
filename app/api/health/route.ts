import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
    // SUPER MINIMAL: No database, just return static JSON
    return NextResponse.json({
        status: "ALIVE",
        timestamp: new Date().toISOString(),
        message: "If you see this, the endpoint works without DB"
    });
}
