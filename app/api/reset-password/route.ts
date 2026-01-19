import { NextResponse } from "next/server";
import { tursoExecute } from "@/db/turso-http";

// Temporary endpoint to reset password using server-side hashing
// DELETE THIS AFTER USE FOR SECURITY

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
    const derivedKey = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
    const hashHex = Array.from(new Uint8Array(derivedKey)).map(b => b.toString(16).padStart(2, "0")).join("");
    return `${saltHex}:${hashHex}`;
};

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const email = url.searchParams.get("email");
        const password = url.searchParams.get("password");

        if (!email || !password) {
            return NextResponse.json({
                error: "Missing email or password parameter",
                usage: "/api/reset-password?email=xxx@xxx.com&password=newpassword"
            }, { status: 400 });
        }

        // Hash the password using server-side crypto (same as auth route)
        const hashedPassword = await hashPassword(password);

        // Update the database
        const result = await tursoExecute(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email]
        );

        return NextResponse.json({
            success: true,
            email: email,
            password_set_to: password,
            hash_preview: hashedPassword.substring(0, 30) + "...",
            message: "Password updated! Try logging in now."
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
