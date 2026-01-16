import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET() {
    const processEnv = process.env.TURSO_CONNECTION_URL;
    const isPlaceholder = processEnv?.includes("placeholder");
    const processEnvToken = process.env.TURSO_AUTH_TOKEN ? "HasToken" : "NoToken";

    return NextResponse.json({
        message: "Environment Variable Debug",
        processEnv_URL: processEnv ? (isPlaceholder ? "IS_PLACEHOLDER" : "IS_SET_AND_NOT_PLACEHOLDER") : "UNDEFINED",
        processEnv_Token: processEnvToken,
        timestamp: new Date().toISOString()
    });
}
