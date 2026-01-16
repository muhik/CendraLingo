import { NextResponse } from "next/server";
import db from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");

export async function GET() {
    try {
        const database = new db(dbPath);
        // Get last 4 users to show overlap
        const users = database.prepare("SELECT name, email FROM users ORDER BY created_at DESC LIMIT 4").all();

        return NextResponse.json(users);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
