
import { NextResponse } from "next/server";
import db from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const dbPath = path.join(process.cwd(), "local.db");

// Verify password helper
const verifyPassword = (password: string, hash: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key === derivedKey.toString("hex"));
        });
    });
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const database = new db(dbPath);
        const user = database.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

        if (!user) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            userId: user.id,
            name: user.name,
        });

    } catch (error) {
        console.error("[LOGIN_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
