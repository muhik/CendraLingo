import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET() {
    const url = process.env.TURSO_CONNECTION_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 500 });
    }

    try {
        // Direct Turso HTTP API call
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                statements: [
                    { q: "SELECT name FROM sqlite_master WHERE type='table'" }
                ]
            })
        });

        const data = await response.json();

        return NextResponse.json({
            status: "Direct Turso HTTP API test",
            response_status: response.status,
            data: data
        });
    } catch (e: any) {
        return NextResponse.json({
            error: "Direct HTTP failed",
            message: e.message
        }, { status: 500 });
    }
}
