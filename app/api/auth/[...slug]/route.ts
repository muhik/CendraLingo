import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { tursoQuery, tursoQueryOne, tursoExecute } from "@/db/turso-http";
import { cookies } from "next/headers";



// --------------------------------------------------------------------------------
// HELPERS
// --------------------------------------------------------------------------------

const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    if (!storedHash || typeof storedHash !== 'string') return false;
    // Check if it's the new format (starts with SIMPLE_SHA256)
    if (storedHash.startsWith("SIMPLE_SHA256:")) {
        const parts = storedHash.split(":");
        if (parts.length !== 3) return false;
        const salt = parts[1];
        const originalHash = parts[2];

        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const derivedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        return derivedHash === originalHash;
    }

    // Fallback for old PBKDF2 (if any still exist/work)
    try {
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
    } catch (e) {
        return false;
    }
};

const hashPassword = async (password: string): Promise<string> => {
    const salt = Math.random().toString(36).substring(2, 15); // Simple random string
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return `SIMPLE_SHA256:${salt}:${hashHex}`;
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
            [userId, defaultName, "/mascot.svg", 3, 0, 1, 0]);

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

        // BLOCKED DOMAINS (Disposable/Temp Email Providers)
        // Expanded List to prevent "Nuyul" (Account Farming)
        const DISPOSABLE_DOMAINS = [
            // Major Providers
            "temp-mail.org", "10minutemail.com", "guerrillamail.com", "yopmail.com", "mailinator.com",
            "throwawaymail.com", "maildrop.cc", "getnada.com", "dispostable.com", "sharklasers.com",
            "tempmail.com", "mm.st", "moakt.com", "trashmail.com", "jetable.org",

            // Yopmail Variants
            "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf", "nospam.ze.tc", "nomail.xl.cx",
            "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",

            // Guerrilla Mail Variants
            "guerrillamailblock.com", "guerrillamail.net", "guerrillamail.biz", "guerrillamail.org",
            "grr.la", "pokemail.net", "spam4.me",

            // Mailinator Variants
            "superrito.com", "teleworm.us", "jourrapide.com", "veryrealemail.com", "zippymail.info",
            "chammy.info", "trbvm.com", "larmon.com", "ce.ms", "gawab.com",

            // 10MinuteMail & Others
            "10minutemail.net", "10minutemail.co.uk", "10minutemail.ca", "10mail.org",
            "20minutemail.com", "30minutemail.com", "33mail.com", "4email.net",

            // TrashMail
            "trashmail.net", "trashmail.me", "trashmail.at", "rcpt.at", "kurzepost.de", "wegwerfmail.de",
            "trashmail.io", "trashmail.org", "trash-mail.com",

            // Other Common Disposable Domains
            "0-mail.com", "0815.ru", "0clickemail.com", "0wnd.net", "0wnd.org",
            "5ymail.com", "9ox.net", "a-bc.net", "anonbox.net", "antichef.com", "antichef.net",
            "baxomail.com", "beefmilk.com", "bigstring.com", "binkmail.com", "bio-mimicry.org",
            "bitebull.com", "bodhi.law", "bofthew.com", "boun.cr", "bouncr.com", "boximail.com",
            "bugmenot.com", "bwn2.org", "cachedot.net", "cashflow35.com", "card2brain.org",
            "chogmail.com", "choi.one", "chtrash.com", "ciphermail.com", "citizencorp.com",
            "clrmail.com", "contact-novus.com", "cortef.com", "covbase.com", "dandikmail.com",
            "deadaddress.com", "despam.it", "despam.us", "devnullmail.com", "dfgh.net",
            "digitalsafe.com", "discard.email", "discardmail.com", "discardmail.de",
            "dodgit.com", "drdrb.com", "e4ward.com", "email-temp.com", "email60.com",
            "emailconf.com", "emailfreedom.com", "emailim.com", "emaill.net",
            "emailn.de", "emailnya.com", "emailproxsy.com", "emailtemporaneo.it",
            "eml.cc", "emlhub.com", "emltmp.com", "etemp.com", "eternity-mail.com",
            "fast-email.com", "fastmail.ca", "fastmail.cn", "fastmail.co.uk", "fastmail.com",
            "tempmailo.com", "tempr.email", "mailpoof.com", "mailsac.com", "mailnesia.com",
            "mintemail.com", "mytrashmail.com", "spambox.us", "spamgourmet.com"
        ];

        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
            return NextResponse.json({ message: "Penggunaan Temporary Email/Akun Palsu tidak diizinkan. Mohon gunakan email pribadi yang valid (Gmail, Yahoo, iCloud, dll)." }, { status: 400 });
        }

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
                await tursoExecute("UPDATE user_progress SET user_name = ?, points = 10, hearts = 3, is_guest = 0, has_active_subscription = 0, subscription_ends_at = NULL WHERE user_id = ?",
                    [name, guestId]);
                return NextResponse.json({ success: true, userId: guestId, name, message: "Account created! 10 Gems Bonus Added!" });
            }
        }

        await tursoExecute("INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, name, email, hashedPassword, "user", now]);
        await tursoExecute("INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription, subscription_ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, name, "/mascot.svg", 3, 10, 0, 0, null]);

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
