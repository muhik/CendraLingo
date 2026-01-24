import { NextResponse } from "next/server";

// NOTE: Removed "export const runtime = edge" - testing if this causes the crash

// Minimal test - just return success
export async function POST(req: Request) {
    return NextResponse.json({
        success: true,
        message: "API is working (no edge runtime)",
        timestamp: Date.now()
    });
}

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Manual Purchase API is alive (no edge runtime)",
        timestamp: Date.now()
    });
}
