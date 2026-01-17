import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET() {
    const url = process.env.TURSO_CONNECTION_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    return NextResponse.json({
        source: "process_env",
        url_status: url ? (url.includes("placeholder") ? "PLACEHOLDER" : "VALID") : "MISSING",
        token_status: token ? "SET" : "MISSING",
        timestamp: new Date().toISOString()
    });
}
