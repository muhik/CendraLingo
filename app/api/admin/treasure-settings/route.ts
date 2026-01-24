import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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
        const result = await tursoExecute("SELECT * FROM treasure_settings ORDER BY id DESC LIMIT 1");

        if (result?.rows?.length > 0) {
            // Parse columns robustly
            const cols = result.cols.map((c: any) => c.name.toLowerCase());
            const row = result.rows[0]; // array of cells
            const data: any = {};

            // Map values to lowercased column names
            row.forEach((cell: any, i: number) => {
                if (cols[i]) {
                    data[cols[i]] = cell.value;
                }
            });

            // "data" now uses lowercased keys. We check multiple variants to be safe.
            return NextResponse.json({
                paid4linkUrl: data["paid4link_url"] || data["paid4linkurl"] || data["paid4linkUrl"] || "",
                isEnabled: (data["is_enabled"] == 1) || (data["isenabled"] == 1),
                requirePaid4link: (data["require_paid4link"] == 1) || (data["requirepaid4link"] == 1)
            });
        }

        // Default if no settings
        return NextResponse.json({
            paid4linkUrl: "",
            isEnabled: true,
            requirePaid4link: false
        });

    } catch (error: any) {
        console.error("GET Settings Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { paid4linkUrl, isEnabled, requirePaid4link } = body;

        // Ensure at least one row exists, otherwise insert
        // SQLite doesn't have UPSERT in generic way easily without unique constraint on single row table,
        // so we check count or just insert new one (taking latest).
        // Better: Update if exists, else insert.

        const check = await tursoExecute("SELECT id FROM treasure_settings ORDER BY id DESC LIMIT 1");

        if (check?.rows?.length > 0) {
            const id = check.rows[0][0].value;
            await tursoExecute(
                "UPDATE treasure_settings SET paid4link_url = ?, is_enabled = ?, require_paid4link = ?, updated_at = ? WHERE id = ?",
                [
                    { type: "text", value: paid4linkUrl || "" },
                    { type: "integer", value: isEnabled ? "1" : "0" },
                    { type: "integer", value: requirePaid4link ? "1" : "0" },
                    { type: "integer", value: String(Date.now()) },
                    { type: "integer", value: String(id) }
                ]
            );
        } else {
            await tursoExecute(
                "INSERT INTO treasure_settings (paid4link_url, is_enabled, require_paid4link, updated_at) VALUES (?, ?, ?, ?)",
                [
                    { type: "text", value: paid4linkUrl || "" },
                    { type: "integer", value: isEnabled ? "1" : "0" },
                    { type: "integer", value: requirePaid4link ? "1" : "0" },
                    { type: "integer", value: String(Date.now()) }
                ]
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Save Settings Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
