import { NextResponse } from "next/server";
import { tursoQuery } from "@/db/turso-http";

export const runtime = 'edge';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const email = url.searchParams.get("email");
        const password = url.searchParams.get("password");

        if (!email || !password) {
            return NextResponse.json({ error: "Missing email or password" });
        }

        // 1. Get User
        const users = await tursoQuery("SELECT * FROM users WHERE email = ?", [email]);
        const user = users[0];

        if (!user) {
            return NextResponse.json({ error: "User not found" });
        }

        const storedHash = user.password;

        // 2. Manual Verification Logic Debug
        let debugInfo: any = {
            step: "start",
            storedHashPrefix: storedHash.substring(0, 15),
            isSimpleSha256: storedHash.startsWith("SIMPLE_SHA256:"),
        };

        if (storedHash.startsWith("SIMPLE_SHA256:")) {
            const parts = storedHash.split(":");
            const salt = parts[1];
            const originalHash = parts[2];

            debugInfo.salt = salt;
            debugInfo.originalHash = originalHash;

            const encoder = new TextEncoder();
            const inputString = password + salt;
            const data = encoder.encode(inputString);

            debugInfo.inputString = inputString;
            debugInfo.dataLength = data.length;

            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const derivedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

            debugInfo.derivedHash = derivedHash;
            debugInfo.match = (derivedHash === originalHash);
        } else {
            debugInfo.error = "Not a SIMPLE_SHA256 password";
        }

        return NextResponse.json({
            success: true,
            email: user.email,
            debug: debugInfo
        });

    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
