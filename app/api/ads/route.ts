import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Raw Turso Executor to bypass Cloudflare/OpenNext driver bundling issues
async function tursoExecute(sql: string, args: any[] = []) {
    const dbUrl = process.env.TURSO_CONNECTION_URL!;
    const dbToken = process.env.TURSO_AUTH_TOKEN!;

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
        // Fetch all active ads
        const res = await tursoExecute("SELECT * FROM ad_settings WHERE is_active = 1 ORDER BY updated_at DESC");

        if (!res?.rows?.length) {
            return NextResponse.json([]);
        }

        const cols = res.cols.map((c: any) => c.name);
        const ads = res.rows.map((row: any) => {
            const obj: any = {};
            row.forEach((cell: any, i: number) => {
                const col = cols[i];
                if (col === 'script_code') obj.script_code = cell.value;
                else if (col === 'image_url') obj.image_url = cell.value;
                else if (col === 'target_url') obj.target_url = cell.value;
                else if (col === 'is_active') obj.is_active = cell.value;
                else obj[col] = cell.value;
            });
            // Ensure compatibility with frontend expectations
            return {
                ...obj,
                is_active: obj.is_active === 1,
                // Frontend might expect snake_case or camelCase depending on usage.
                // AdManager uses: placement, weight, is_active. 
                // The DB columns are snake_case but AdManager usage in `filter(a => a.placement === ...)` matches.
            };
        });

        return NextResponse.json(ads);

    } catch (error) {
        console.error("[ADS API] Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
