import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Verify password helper using Web Crypto API (Edge Compatible)
const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    const [saltHex, originalHashHex] = storedHash.split(":");
    if (!saltHex || !originalHashHex) return false;

    // Convert hex salt to Uint8Array
    const saltMatch = saltHex.match(/.{1,2}/g);
    if (!saltMatch) return false;
    const salt = new Uint8Array(saltMatch.map(byte => parseInt(byte, 16)));

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );

    const derivedHashHex = Array.from(new Uint8Array(derivedKey)).map(b => b.toString(16).padStart(2, "0")).join("");
    return derivedHashHex === originalHashHex;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

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
