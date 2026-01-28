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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, id, title, type, placement, weight, frequency, script_code, image_url, target_url, is_active } = body;

        console.log("[ADS MANAGE] Action:", action, "Body:", JSON.stringify(body));

        if (action === "delete" && id) {
            await tursoExecute("DELETE FROM ad_settings WHERE id = ?", [{ type: "integer", value: String(id) }]);
            return NextResponse.json({ success: true, message: "Ad deleted" });
        }

        // Build args for Turso Pipeline (typed)
        const nowISO = new Date().toISOString();

        if (action === "update" && id) {
            const sql = `
                UPDATE ad_settings 
                SET title=?, type=?, placement=?, weight=?, frequency=?, script_code=?, image_url=?, target_url=?, is_active=?, updated_at=?
                WHERE id = ?
            `;
            const args = [
                { type: "text", value: title || "New Ad" },
                { type: "text", value: type || "image" },
                { type: "text", value: placement || "banner" },
                { type: "integer", value: String(Number(weight) || 50) },
                { type: "integer", value: String(Number(frequency) || 0) },
                { type: "text", value: script_code || "" },
                { type: "text", value: image_url || "" },
                { type: "text", value: target_url || "" },
                { type: "integer", value: (is_active === true || is_active === 1 || is_active === "1") ? "1" : "0" },
                { type: "text", value: nowISO },
                { type: "integer", value: String(id) }
            ];
            await tursoExecute(sql, args);
            return NextResponse.json({ success: true, message: "Ad updated" });
        }

        if (action === "create") {
            const sql = `
                INSERT INTO ad_settings (title, type, placement, weight, frequency, script_code, image_url, target_url, is_active, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const args = [
                { type: "text", value: title || "New Ad" },
                { type: "text", value: type || "image" },
                { type: "text", value: placement || "banner" },
                { type: "integer", value: String(Number(weight) || 50) },
                { type: "integer", value: String(Number(frequency) || 0) },
                { type: "text", value: script_code || "" },
                { type: "text", value: image_url || "" },
                { type: "text", value: target_url || "" },
                { type: "integer", value: (is_active === true || is_active === 1 || is_active === "1") ? "1" : "0" },
                { type: "text", value: nowISO }
            ];
            await tursoExecute(sql, args);
            return NextResponse.json({ success: true, message: "Ad created" });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("[ADS MANAGE] Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
