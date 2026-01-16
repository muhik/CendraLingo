import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { adSettings, feedbacks, userProgress, vouchers, treasureSettings, userTreasureLog, redeemRequests } from "@/db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { createInvoice } from "@/lib/xendit";

// --------------------------------------------------------------------------------
// LOGIC: ADS
// --------------------------------------------------------------------------------
async function getAds() {
    try {
        const ad = await db.select().from(adSettings).where(and(eq(adSettings.id, 1), eq(adSettings.isActive, 1))).get();
        return NextResponse.json(ad || null);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// LOGIC: FEEDBACK
// --------------------------------------------------------------------------------
async function postFeedback(req: Request) {
    try {
        const body = await req.json();
        const { userId, userName, message, type } = body;
        if (!userId || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        await db.insert(feedbacks).values({ userId, userName: userName || "Anonymous", message, type: type || 'saran', createdAt: new Date().toISOString() });
        return NextResponse.json({ success: true, message: "Feedback submitted" });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// LOGIC: PURCHASE (Xendit)
// --------------------------------------------------------------------------------
async function postPurchase(req: Request) {
    try {
        const body = await req.json();
        const { userId, planType, customAmount, customDescription } = body;
        if (!userId) return new NextResponse("User ID required", { status: 400 });

        let amount = 0;
        let description = "";
        let externalIdPrefix = "";

        if (planType === "PRO_MONTHLY") { amount = 49000; description = "Upgrade Jawara PRO (1 Month)"; externalIdPrefix = "PRO"; }
        else if (planType === "GEMS_TOPUP") { amount = customAmount; description = customDescription || "Top Up Gems"; externalIdPrefix = "GEMS"; }
        else { return new NextResponse("Invalid Plan Type", { status: 400 }); }

        const externalId = `${externalIdPrefix}-${userId}-${Date.now()}`;
        let invoiceUrl = "";

        if (process.env.XENDIT_SECRET_KEY) {
            const invoice = await createInvoice({
                externalId, amount, description, payerEmail: "user@example.com",
                successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005"}/shop?payment=success`,
            });
            invoiceUrl = invoice.invoiceUrl;
        } else {
            console.log("No Xendit Key, Mocking");
            invoiceUrl = "https://checkout-staging.xendit.co/web/mock-payment";
        }
        return NextResponse.json({ url: invoiceUrl, externalId });
    } catch (e) {
        return new NextResponse(JSON.stringify({ error: String(e) }), { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// LOGIC: REDEEM
// --------------------------------------------------------------------------------
async function postRedeemRequest(req: Request) {
    try {
        const body = await req.json();
        const { userId, userName, rupiahAmount, paymentMethod, accountNumber } = body;
        if (!userId || !rupiahAmount || !paymentMethod || !accountNumber) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        if (rupiahAmount < 1) return NextResponse.json({ error: "Minimum penarikan Rp 1" }, { status: 400 });
        if (paymentMethod.toUpperCase() !== "DANA") return NextResponse.json({ error: "Hanya DANA" }, { status: 400 });

        await db.insert(redeemRequests).values({ userId, userName: userName || "User", gemsAmount: 0, rupiahAmount, paymentMethod: paymentMethod.toUpperCase(), accountNumber, accountName: null, status: "pending", createdAt: new Date() });
        return NextResponse.json({ success: true, message: "Request sent", rupiahAmount });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function getRedeemStatus(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    try {
        const completedRequests = await db.select().from(redeemRequests).where(and(eq(redeemRequests.userId, userId), eq(redeemRequests.status, "completed")));
        return NextResponse.json({ hasCompleted: completedRequests.length > 0, requests: completedRequests });
    } catch (e) {
        return NextResponse.json({ hasCompleted: false, error: String(e) });
    }
}

async function postRedeemStatus(req: Request) {
    try {
        const { requestId } = await req.json();
        if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });
        await db.update(redeemRequests).set({ status: "notified" }).where(eq(redeemRequests.id, requestId));
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// LOGIC: TREASURE
// --------------------------------------------------------------------------------
async function getTreasureAccess(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const settings = await db.select().from(treasureSettings).limit(1).get();
        const config = settings || { isEnabled: 1, requirePaid4link: 0, paid4linkUrl: null };
        const userLog = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();
        const today = new Date().toISOString().split("T")[0];
        const hasAccess = userLog?.hasTreasureAccess === true && userLog?.treasureAccessDate === today;
        const alreadySpunToday = userLog?.lastSpinDate === today;
        const canSpin = hasAccess && !alreadySpunToday;

        return NextResponse.json({ hasAccess, alreadySpunToday, canSpin, settings: { isEnabled: config.isEnabled, requirePaid4link: config.requirePaid4link, paid4linkUrl: config.paid4linkUrl } });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

async function postTreasureAccess(req: Request) {
    try {
        const body = await req.json();
        const { userId, action } = body;
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
        const today = new Date().toISOString().split("T")[0];

        if (action === "setAccess") {
            const existing = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();
            if (existing) await db.update(userTreasureLog).set({ hasTreasureAccess: true, treasureAccessDate: today }).where(eq(userTreasureLog.userId, userId));
            else await db.insert(userTreasureLog).values({ userId, hasTreasureAccess: true, treasureAccessDate: today, lastSpinDate: null, createdAt: new Date() });
            return NextResponse.json({ success: true, message: "Access granted" });
        } else if (action === "recordSpin") {
            const existing = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();
            if (existing) await db.update(userTreasureLog).set({ lastSpinDate: today }).where(eq(userTreasureLog.userId, userId));
            else await db.insert(userTreasureLog).values({ userId, hasTreasureAccess: false, lastSpinDate: today, createdAt: new Date() });
            return NextResponse.json({ success: true, message: "Spin recorded" });
        } else if (action === "clearAccess") {
            await db.update(userTreasureLog).set({ hasTreasureAccess: false, treasureAccessDate: null }).where(eq(userTreasureLog.userId, userId));
            return NextResponse.json({ success: true, message: "Access cleared" });
        }
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}

const SEGMENTS = [
    { label: "Rp 5", rp: 5, gems: 0, weight: 10 }, { label: "ZONK", rp: 0, gems: 0, weight: 10 },
    { label: "5 Gems", rp: 0, gems: 5, weight: 10 }, { label: "ZONK", rp: 0, gems: 0, weight: 10 },
    { label: "Rp 15", rp: 15, gems: 0, weight: 8 }, { label: "ZONK", rp: 0, gems: 0, weight: 10 },
    { label: "10 Gems", rp: 0, gems: 10, weight: 8 }, { label: "ZONK", rp: 0, gems: 0, weight: 10 },
    { label: "Rp 25", rp: 25, gems: 0, weight: 4 }, { label: "ZONK", rp: 0, gems: 0, weight: 10 },
    { label: "25 Gems", rp: 0, gems: 25, weight: 10 },
];

async function postSpin(req: Request) {
    try {
        const body = await req.json();
        const { userId } = body;
        if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });
        const today = new Date().toISOString().split("T")[0];
        const treasureLog = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();
        if (treasureLog && treasureLog.lastSpinDate === today) return NextResponse.json({ error: "Already spun today", alreadySpun: true }, { status: 429 });

        // Spin
        const totalWeight = SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
        let random = Math.random() * totalWeight;
        let segmentIndex = 0;
        for (let i = 0; i < SEGMENTS.length; i++) {
            random -= SEGMENTS[i].weight;
            if (random <= 0) { segmentIndex = i; break; }
        }
        const segment = SEGMENTS[segmentIndex];

        if (treasureLog) await db.update(userTreasureLog).set({ lastSpinDate: today }).where(eq(userTreasureLog.userId, userId));
        else await db.insert(userTreasureLog).values({ userId, hasTreasureAccess: true, lastSpinDate: today, createdAt: new Date() });

        if (segment.rp === 0 && segment.gems === 0) {
            return NextResponse.json({ segmentIndex, gemsWon: 0, cashbackWon: 0, voucherCode: null, message: "Zonk!" });
        }

        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "SPIN-";
        for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

        await db.insert(vouchers).values({ code, valueRp: segment.rp, gemsAmount: segment.gems, cashbackAmount: segment.rp, isClaimed: false, createdAt: new Date() });
        return NextResponse.json({ segmentIndex, gemsWon: segment.gems, cashbackWon: segment.rp, voucherCode: code, message: "You won!" });
    } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}

// --------------------------------------------------------------------------------
// LOGIC: USER
// --------------------------------------------------------------------------------
async function getUserSync(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) return NextResponse.json({ success: false }, { status: 400 });
        const user = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).get();
        return user ? NextResponse.json({ success: true, user }) : NextResponse.json({ success: false }, { status: 404 });
    } catch { return NextResponse.json({ success: false }, { status: 500 }); }
}

async function postUserSync(req: Request) {
    try {
        const body = await req.json();
        const { userId, hearts, points, isGuest, hasActiveSubscription, cashbackBalance } = body;
        if (!userId) return NextResponse.json({ success: false }, { status: 400 });
        const existing = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).get();
        if (existing) {
            const newCashback = cashbackBalance > 0 ? cashbackBalance : (existing.cashbackBalance || 0);
            await db.update(userProgress).set({ hearts, points, isGuest, hasActiveSubscription, cashbackBalance: newCashback }).where(eq(userProgress.userId, userId));
        } else {
            await db.insert(userProgress).values({ userId, hearts, points, isGuest, hasActiveSubscription, cashbackBalance: cashbackBalance || 0, userName: "New User", userImage: "/mascot.svg" });
        }
        return NextResponse.json({ success: true });
    } catch { return NextResponse.json({ success: false }, { status: 500 }); }
}

async function getUsersRecent() {
    try {
        const recent = await db.select({ name: userProgress.userName }).from(userProgress).orderBy(desc(userProgress.points)).limit(4);
        return NextResponse.json([]);
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

// --------------------------------------------------------------------------------
// LOGIC: VOUCHERS
// --------------------------------------------------------------------------------
async function postVouchersGenerate(req: Request) {
    try {
        const body = await req.json();
        const { qty, valueRp } = body;
        const gems = Math.floor(valueRp / 100); // Simplified logic
        const newVouchers = [];
        for (let i = 0; i < qty; i++) {
            let code = "CN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            newVouchers.push({ code, valueRp, gemsAmount: gems, cashbackAmount: Math.floor(valueRp * 0.01), isClaimed: false, createdAt: new Date() });
        }
        const result = await db.insert(vouchers).values(newVouchers).returning();
        return NextResponse.json({ success: true, vouchers: result });
    } catch { return NextResponse.json({ success: false }, { status: 500 }); }
}

async function postVouchersRedeem(req: Request) {
    try {
        const body = await req.json();
        const { code, userId } = body;
        const voucher = await db.select().from(vouchers).where(eq(vouchers.code, code)).get();
        if (!voucher) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        if (voucher.isClaimed) return NextResponse.json({ success: false, message: "Used" }, { status: 400 });

        await db.update(vouchers).set({ isClaimed: true, claimedBy: userId, claimedAt: new Date() }).where(and(eq(vouchers.id, voucher.id), eq(vouchers.isClaimed, false)));
        await db.update(userProgress).set({ points: sql`points + ${voucher.gemsAmount}`, cashbackBalance: sql`cashback_balance + ${voucher.cashbackAmount}` }).where(eq(userProgress.userId, userId));
        return NextResponse.json({ success: true, gems: voucher.gemsAmount, cashback: voucher.cashbackAmount });
    } catch { return NextResponse.json({ success: false }, { status: 500 }); }
}

// --------------------------------------------------------------------------------
// LOGIC: WEBHOOKS
// --------------------------------------------------------------------------------
async function postWebhookXendit(req: Request) {
    try {
        const body = await req.json();
        const { status, external_id, amount } = body;
        if (status === "PAID") {
            const parts = external_id.split("-");
            const userId = parts[1];
            if (parts[0] === "PRO") {
                await db.update(userProgress).set({ hasActiveSubscription: true, points: sql`points + 1000`, hearts: 100 }).where(eq(userProgress.userId, userId));
            } else if (parts[0] === "GEMS") {
                await db.update(userProgress).set({ points: sql`points + ${Math.floor(amount / 100)}` }).where(eq(userProgress.userId, userId));
            }
        }
        return NextResponse.json({ received: true });
    } catch { return new NextResponse("Error", { status: 500 }); }
}

// --------------------------------------------------------------------------------
// DISPATCHER
// --------------------------------------------------------------------------------
export async function GET(req: Request, context: { params: Promise<{ slug: string[] }> }) {
    const slug = (await context.params).slug;
    const path = slug.join("/");
    switch (path) {
        case "ads": return getAds();
        case "redeem/status": return getRedeemStatus(req);
        case "treasure/access": return getTreasureAccess(req);
        case "user/sync": return getUserSync(req);
        case "users/recent": return getUsersRecent();
        default: return new NextResponse("Not Found", { status: 404 });
    }
}

export async function POST(req: Request, context: { params: Promise<{ slug: string[] }> }) {
    const slug = (await context.params).slug;
    const path = slug.join("/");
    switch (path) {
        case "feedback": return postFeedback(req);
        case "purchase": return postPurchase(req);
        case "redeem/request": return postRedeemRequest(req);
        case "redeem/status": return postRedeemStatus(req);
        case "treasure/access": return postTreasureAccess(req);
        case "treasure/spin": return postSpin(req);
        case "user/sync": return postUserSync(req);
        case "vouchers/generate": return postVouchersGenerate(req);
        case "vouchers/redeem": return postVouchersRedeem(req);
        case "webhooks/xendit": return postWebhookXendit(req);
        default: return new NextResponse("Not Found", { status: 404 });
    }
}
