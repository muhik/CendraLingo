import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");

// GET config for admin
export async function GET() {
    let db;
    try {
        db = new Database(dbPath);
        const ad = db.prepare("SELECT * FROM ad_settings WHERE id = 1").get();
        db.close();
        return NextResponse.json(ad || {});
    } catch (error) {
        if (db) db.close();
        return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
    }
}

// POST update config
export async function POST(req: Request) {
    let db;
    try {
        const body = await req.json();
        const { type, script_code, image_url, target_url, is_active } = body;

        db = new Database(dbPath);
        db.prepare(`
            UPDATE ad_settings 
            SET type = ?, script_code = ?, image_url = ?, target_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `).run(type, script_code || "", image_url || "", target_url || "", is_active ? 1 : 0);

        db.close();
        return NextResponse.json({ success: true });
    } catch (error) {
        if (db) db.close();
        return NextResponse.json({ error: "Failed to update ads" }, { status: 500 });
    }
}
