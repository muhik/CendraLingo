import { NextResponse } from "next/server";
import { tursoQuery, tursoQueryOne, tursoExecute } from "@/db/turso-http";
import { cookies } from "next/headers";



// --------------------------------------------------------------------------------
// HELPERS
// --------------------------------------------------------------------------------

const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    const [saltHex, originalHashHex] = storedHash.split(":");
    if (!saltHex || !originalHashHex) return false;
    const saltMatch = saltHex.match(/.{1,2}/g);
    if (!saltMatch) return false;
    const salt = new Uint8Array(saltMatch.map(byte => parseInt(byte, 16)));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
    const derivedKey = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
    const derivedHashHex = Array.from(new Uint8Array(derivedKey)).map(b => b.toString(16).padStart(2, "0")).join("");
    return derivedHashHex === originalHashHex;
};

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
    const derivedKey = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
    const hashHex = Array.from(new Uint8Array(derivedKey)).map(b => b.toString(16).padStart(2, "0")).join("");
    return `${saltHex}:${hashHex}`;
};

// --------------------------------------------------------------------------------
// HANDLERS
// --------------------------------------------------------------------------------

async function handleReset() {
    const cookieStore = await cookies();
    cookieStore.delete("guest_session_id");
    return NextResponse.json({ message: "Guest session reset successfully" });
}

async function handleGuest() {
    try {
        const cookieStore = await cookies();
        const existingGuestId = cookieStore.get("guest_session_id")?.value;
        if (existingGuestId) {
            const users = await tursoQuery("SELECT * FROM users WHERE id = ? AND role = 'guest'", [existingGuestId]);
            if (users.length > 0) return NextResponse.json({ success: true, userId: existingGuestId, message: "Resuming existing guest session" });
        }

        const userId = crypto.randomUUID();
        const now = Date.now();
        const defaultName = `Guest-${userId.substring(0, 6)}`;
        const guestEmail = `${userId}@guest.com`;

        await tursoExecute("INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, defaultName, guestEmail, "guest_pass", "guest", now]);
        await tursoExecute("INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, defaultName, "/mascot.svg", 5, 0, 1, 0]);

        cookieStore.set("guest_session_id", userId, { path: "/", maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: "lax" });
        return NextResponse.json({ success: true, userId, message: "New guest session created" });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function handleLogin(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) return new NextResponse("Missing fields", { status: 400 });

        const users = await tursoQuery("SELECT * FROM users WHERE email = ?", [email]);
        const user = users[0];
        if (!user) return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });

        return NextResponse.json({ success: true, userId: user.id, name: user.name });
    } catch (e) {
        return NextResponse.json({ message: String(e) }, { status: 500 });
    }
}

async function handleRegister(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, guestId, guestPoints, guestHearts } = body;
        if (!name || !email || !password) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

        const existingUsers = await tursoQuery("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) return NextResponse.json({ message: "Email already registered" }, { status: 409 });

        const hashedPassword = await hashPassword(password);
        const userId = crypto.randomUUID();
        const now = Date.now();
        const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

        if (guestId) {
            const guestUsers = await tursoQuery("SELECT * FROM users WHERE id = ? AND role = 'guest'", [guestId]);
            if (guestUsers.length > 0) {
                await tursoExecute("UPDATE users SET name = ?, email = ?, password = ?, role = 'user' WHERE id = ?", [name, email, hashedPassword, guestId]);
                await tursoExecute("UPDATE user_progress SET user_name = ?, points = points + 10, hearts = ?, is_guest = 0, has_active_subscription = 0, subscription_ends_at = NULL WHERE user_id = ?",
                    [name, guestHearts !== undefined ? guestHearts : 5, guestId]);
                return NextResponse.json({ success: true, userId: guestId, name, message: "Account created! 10 Gems Bonus Added!" });
            }
        }

        await tursoExecute("INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, name, email, hashedPassword, "user", now]);
        await tursoExecute("INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription, subscription_ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, name, "/mascot.svg", 5, 10, 0, 0, null]);

        return NextResponse.json({ success: true, userId, name, message: "Account created! 10 Gems Bonus Added!" });
    } catch (e) {
        return NextResponse.json({ message: String(e) }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// DISPATCHER
// --------------------------------------------------------------------------------

export async function GET(req: Request, context: { params: Promise<{ slug: string[] }> }) {
    const slug = (await context.params).slug;
    const path = slug.join("/");
    if (path === "reset") return handleReset();
    return new NextResponse("Not Found", { status: 404 });
}

export async function POST(req: Request, context: { params: Promise<{ slug: string[] }> }) {
    const slug = (await context.params).slug;
    const path = slug.join("/");
    switch (path) {
        case "guest": return handleGuest();
        case "login": return handleLogin(req);
        case "register": return handleRegister(req);
        default: return new NextResponse("Not Found", { status: 404 });
    }
}
