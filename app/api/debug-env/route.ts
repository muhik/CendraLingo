import { NextResponse } from "next/server";


export async function GET() {
    try {
        const url = process.env.TURSO_CONNECTION_URL;
        const token = process.env.TURSO_AUTH_TOKEN;

        return NextResponse.json({
            status: "ok",
            source: "process_env",
            url_status: url ? (url.includes("placeholder") ? "PLACEHOLDER" : "VALID") : "MISSING",
            token_status: token ? "SET" : "MISSING",
            token_length: token ? token.length : 0,
            timestamp: new Date().toISOString()
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "error",
            message: e.message,
            stack: e.stack
        }, { status: 200 }); // Return 200 so we can read the body
    }
}
