import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET() {
    let url: string | undefined;
    let token: string | undefined;
    let source = "unknown";

    try {
        // Try Cloudflare runtime context
        const { getRequestContext } = require("@cloudflare/next-on-pages");
        const ctx = getRequestContext();
        url = ctx.env.TURSO_CONNECTION_URL;
        token = ctx.env.TURSO_AUTH_TOKEN;
        source = "cloudflare_context";
    } catch {
        // Fallback to process.env
        url = process.env.TURSO_CONNECTION_URL;
        token = process.env.TURSO_AUTH_TOKEN;
        source = "process_env";
    }

    return NextResponse.json({
        source,
        url_status: url ? (url.includes("placeholder") ? "PLACEHOLDER" : "VALID") : "MISSING",
        token_status: token ? "SET" : "MISSING",
        timestamp: new Date().toISOString()
    });
}
