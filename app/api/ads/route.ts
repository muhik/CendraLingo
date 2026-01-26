import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Raw Turso Executor to bypass Cloudflare/OpenNext driver bundling issues
async function tursoExecute(sql: string, args: any[] = []) {
    const dbUrl = process.env.TURSO_CONNECTION_URL!;
    const dbToken = process.env.TURSO_AUTH_TOKEN!;

    // Ensure URL format
    const finalUrl = dbUrl.startsWith("libsql://") ? dbUrl.replace("libsql://", "https://") : dbUrl;

    const response = await fetch(`${finalUrl}/v2/pipeline`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${dbToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requests: [
                { type: "execute", stmt: { sql, args } },
                { type: "close" },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`Database Error: ${response.status}`);
    }

    const data = await response.json();
    return data.results[0]?.response?.result;
}

export async function GET() {
    try {
        // Fetch active ad settings
        const res = await tursoExecute("SELECT * FROM ad_settings WHERE is_active = 1 LIMIT 1");

        if (!res?.rows?.length) {
            return NextResponse.json({ is_active: false });
        }

        // Map columns to object (Turso returns cols/rows separate)
        const cols = res.cols.map((c: any) => c.name.toLowerCase());

        const row = res.rows[0]; // standard rows array
        const data: any = {};
        row.forEach((cell: any, i: number) => {
            data[cols[i]] = cell.value;
        });

        // Use snake_case keys (drizzle schema default) or try mapping to what we need
        const result = {
            is_active: (data["is_active"] === 1) || (data["isactive"] === 1),
            type: data["type"] || "image",
            image_url: data["image_url"] || data["imageurl"] || "",
            target_url: data["target_url"] || data["targeturl"] || "",
            script_code: data["script_code"] || data["scriptcode"] || "",
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error("[ADS API] Error:", error);
        return NextResponse.json({ is_active: false }, { status: 500 });
    }
}
