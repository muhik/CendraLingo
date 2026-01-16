import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { users, userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

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

// GET: /api/auth/reset
async function handleReset() {
    const cookieStore = await cookies();
    cookieStore.delete("guest_session_id");
    return NextResponse.json({ message: "Guest session reset successfully" });
}

// POST: /api/auth/guest
async function handleGuest() {
    try {
        const cookieStore = await cookies();
        const existingGuestId = cookieStore.get("guest_session_id")?.value;
        if (existingGuestId) {
            const existingUser = await db.query.users.findFirst({ where: and(eq(users.id, existingGuestId), eq(users.role, "guest")) });
            if (existingUser) return NextResponse.json({ success: true, userId: existingGuestId, message: "Resuming existing guest session" });
        }
        const userId = uuidv4();
        const now = new Date();
        const defaultName = `Guest-${userId.substring(0, 6)}`;
        const guestEmail = `${userId}@guest.com`;

        await db.transaction(async (tx) => {
            await tx.insert(users).values({ id: userId, name: defaultName, email: guestEmail, password: "guest_pass", role: "guest", createdAt: now });
            await tx.insert(userProgress).values({ userId: userId, userName: defaultName, userImage: "/mascot.svg", hearts: 5, points: 0, isGuest: true, hasActiveSubscription: false });
        });

        cookieStore.set("guest_session_id", userId, { path: "/", maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: "lax" });
        return NextResponse.json({ success: true, userId, message: "New guest session created" });
    } catch {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: /api/auth/login
async function handleLogin(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) return new NextResponse("Missing fields", { status: 400 });

        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });

        return NextResponse.json({ success: true, userId: user.id, name: user.name });
    } catch {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: /api/auth/register
async function handleRegister(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, guestId, guestPoints, guestHearts } = body;
        if (!name || !email || !password) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

        const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (existingUser) return NextResponse.json({ message: "Email already registered" }, { status: 409 });

        const hashedPassword = await hashPassword(password);
        const userId = uuidv4();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await db.transaction(async (tx) => {
            if (guestId) {
                const guestUser = await tx.query.users.findFirst({ where: and(eq(users.id, guestId), eq(users.role, "guest")) });
                if (guestUser) {
                    await tx.update(users).set({ name, email, password: hashedPassword, role: "user" }).where(eq(users.id, guestId));
                    await tx.update(userProgress).set({
                        userName: name, points: (guestPoints || 0) + 1000, hearts: (guestHearts !== undefined) ? guestHearts : 5,
                        isGuest: false, hasActiveSubscription: true, subscriptionEndsAt: expiresAt
                    }).where(eq(userProgress.userId, guestId));
                    return;
                }
            }
            await tx.insert(users).values({ id: userId, name, email, password: hashedPassword, role: "user", createdAt: now });
            await tx.insert(userProgress).values({
                userId, userName: name, userImage: "/mascot.svg", hearts: 5, points: 1000,
                isGuest: false, hasActiveSubscription: true, subscriptionEndsAt: expiresAt
            });
        });

        return NextResponse.json({ success: true, userId, name, message: "Account created! 1000 Gems Bonus Added!" });
    } catch {
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
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
