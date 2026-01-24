import { NextResponse } from "next/server";

export const runtime = "edge";

// Extremely minimal API - just return success immediately
export async function POST(req: Request) {
    return NextResponse.json({
        success: true,
        message: "API is working",
        timestamp: Date.now()
    });
}

// Also add GET for easy browser testing
export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Manual Purchase API is alive",
        timestamp: Date.now()
    });
}
