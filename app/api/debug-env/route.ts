import { NextResponse } from "next/server";


export async function GET() {
    try {


        return NextResponse.json({
            status: "ok",
            source: "process_env",
            url_status: process.env.TURSO_CONNECTION_URL ? "VALID" : "MISSING",
            token_status: process.env.TURSO_AUTH_TOKEN ? "SET" : "MISSING",
            midtrans_server_status: process.env.MIDTRANS_SERVER_KEY ? "SET" : "MISSING",
            midtrans_client_status: process.env.MIDTRANS_CLIENT_KEY ? "SET" : "MISSING",
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
