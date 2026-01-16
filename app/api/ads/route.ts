import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");

// GET active ad for frontend
export async function GET() {
    let db;
    try {
        db = new Database(dbPath);
        // Only fetch if active
        const ad = db.prepare("SELECT * FROM ad_settings WHERE id = 1 AND is_active = 1").get();
        db.close();

        // If no active ad, return null/empty
        if (!ad) return NextResponse.json(null);

        return NextResponse.json(ad);
    } catch (error) {
        if (db) db.close();
        return NextResponse.json(null, { status: 500 });
    }
}
