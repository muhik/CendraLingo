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

// Helper to map snake_case DB result to CamelCase (optional) or just use as is
function mapRows(res: any) {
    if (!res?.rows?.length) return [];
    const cols = res.cols.map((c: any) => c.name);
    return res.rows.map((row: any) => {
        const obj: any = {};
        row.forEach((cell: any, i: number) => {
            // Map snake_case to camelCase manually if needed by frontend
            // Frontend expects: id, title, type, placement, weight, frequency, scriptCode, imageUrl, targetUrl, isActive
            const col = cols[i];
            if (col === 'script_code') obj.scriptCode = cell.value;
            else if (col === 'image_url') obj.imageUrl = cell.value;
            else if (col === 'target_url') obj.targetUrl = cell.value;
            else if (col === 'is_active') obj.isActive = cell.value;
            else if (col === 'updated_at') obj.updatedAt = cell.value;
            else obj[col] = cell.value;
        });
        return obj;
    });
}

export async function GET() {
    try {
        const res = await tursoExecute("SELECT * FROM ad_settings ORDER BY updated_at DESC");
        const ads = mapRows(res);
        return NextResponse.json(ads);
    } catch (error) {
        console.error("Error fetching ads:", error);
        return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Handle DELETE
        if (body.action === "delete" && body.id) {
            await tursoExecute("DELETE FROM ad_settings WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true, message: "Ad deleted" });
        }

        // Handle CREATE/UPDATE
        const { id, title, type, placement, weight, frequency, scriptCode, imageUrl, targetUrl, isActive } = body;

        // Map camelCase body to snake_case DB columns
        const payload = [
            title,
            type || 'image',
            placement || 'banner',
            Number(weight) || 50,
            Number(frequency) || 0,
            scriptCode || '',
            imageUrl || '',
            targetUrl || '',
            isActive ? 1 : 0,
            new Date().toISOString()
        ];

        if (id) {
            // Update
            const sql = `
                UPDATE ad_settings 
                SET title=?, type=?, placement=?, weight=?, frequency=?, script_code=?, image_url=?, target_url=?, is_active=?, updated_at=?
                WHERE id = ?
            `;
            await tursoExecute(sql, [...payload, id]);
            return NextResponse.json({ success: true, message: "Ad updated" });
        } else {
            // Insert
            const sql = `
                INSERT INTO ad_settings (title, type, placement, weight, frequency, script_code, image_url, target_url, is_active, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await tursoExecute(sql, payload);
            return NextResponse.json({ success: true, message: "Ad created" });
        }

    } catch (error) {
        console.error("Error saving ad:", error);
        return NextResponse.json({ error: "Failed to save ad" }, { status: 500 });
    }
}
