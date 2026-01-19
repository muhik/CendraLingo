import { NextResponse } from "next/server";
import { tursoExecute } from "@/db/turso-http";

// Temporary endpoint to reset password using server-side hashing
// DELETE THIS AFTER USE FOR SECURITY

const hashPassword = async (password: string): Promise<string> => {
    const salt = Math.random().toString(36).substring(2, 15);
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return `SIMPLE_SHA256:${salt}:${hashHex}`;
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
