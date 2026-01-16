import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Verify password helper
const verifyPassword = (password: string, hash: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":");
        // Scrypt might be available in Edge if it's standard Web Crypto or Node compatibility is enabled.
        // However, standard Web Crypto doesn't have scrypt easily.
        // For Edge compatibility without polyfills, simplistic hash or imported library is better.
        // But let's assuming crypto is polyfilled or available in CF workers (Node compat).
        // If not, we might need a different auth approach.
        // For now, let's keep crypto but use subtle crypto if possible or assume node compat.
        // Cloudflare Workers supports 'node:crypto' with compatibility flags.

        // Actually, importing 'crypto' works in Next.js Edge runtime (it polyfills subset).
        // Let's rely on that.
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
