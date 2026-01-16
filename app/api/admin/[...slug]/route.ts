import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { adSettings, vouchers, userProgress, feedbacks, redeemRequests, treasureSettings } from "@/db/schema";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";

// HELPER: Configs & Routes
// Defines which sub-paths exist in this consolidated route.

// --------------------------------------------------------------------------------
// GET HANDLERS
// --------------------------------------------------------------------------------

async function getAds() {
    try {
        const ad = await db.select().from(adSettings).where(eq(adSettings.id, 1)).get();
        return NextResponse.json(ad || {});
    } catch {
        return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
    }
}

async function getClaims(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const offset = (page - 1) * limit;

        const conditions = [eq(vouchers.isClaimed, true)];
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            conditions.push(gte(vouchers.claimedAt, start));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            conditions.push(lte(vouchers.claimedAt, end));
        }

        const whereClause = and(...conditions);

        const claims = await db.select({
            code: vouchers.code,
            claimedBy: vouchers.claimedBy,
            userName: userProgress.userName,
            valueRp: vouchers.valueRp,
            cashbackAmount: vouchers.cashbackAmount,
            claimedAt: vouchers.claimedAt,
        })
            .from(vouchers)
            .leftJoin(userProgress, eq(vouchers.claimedBy, userProgress.userId))
            .where(whereClause)
            .orderBy(desc(vouchers.claimedAt))
            .limit(limit)
            .offset(offset);

        // Simple count
        const allClaims = await db.select({ id: vouchers.id }).from(vouchers).where(whereClause);
        const totalItems = allClaims.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const totalCashback = claims.reduce((sum: number, c: any) => sum + (c.cashbackAmount || 0), 0);

        return NextResponse.json({
            data: claims,
            pagination: { page, limit, totalItems, totalPages },
            summary: { totalCashback }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ data: [] }, { status: 500 });
    }
}

async function getFeedback(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const offset = (page - 1) * limit;

        const filters = [];
        if (startDate) filters.push(gte(sql`date(${feedbacks.createdAt})`, startDate));
        if (endDate) filters.push(lte(sql`date(${feedbacks.createdAt})`, endDate));

        const [totalResult] = await db.select({ total: count() }).from(feedbacks).where(and(...filters));
        const total = totalResult ? totalResult.total : 0;
        const totalPages = Math.ceil(total / limit);

        const data = await db.select().from(feedbacks).where(and(...filters)).orderBy(desc(feedbacks.createdAt)).limit(limit).offset(offset);

        return NextResponse.json({
            data,
            pagination: { total, page, totalPages, limit }
        });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

async function getRedeem(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const requests = await db.select().from(redeemRequests).orderBy(desc(redeemRequests.createdAt));
        const filteredRequests = status ? requests.filter((r: any) => r.status === status) : requests;
        const pendingCount = requests.filter((r: any) => r.status === "pending").length;

        return NextResponse.json({ requests: filteredRequests, pendingCount, total: requests.length });
    } catch {
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}

async function getTreasureSettings() {
    try {
        const settings = await db.select().from(treasureSettings).limit(1);
        if (settings.length === 0) {
            return NextResponse.json({ id: null, paid4linkUrl: null, isEnabled: true, requirePaid4link: false });
        }
        return NextResponse.json(settings[0]);
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

async function getUsers() {
    try {
        const users = await db.select().from(userProgress);
        return NextResponse.json(users);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}

async function getVouchers(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const offset = (page - 1) * limit;

        const conditions = [];
        if (startDate) conditions.push(gte(vouchers.createdAt, new Date(startDate)));
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            conditions.push(lte(vouchers.createdAt, end));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const data = await db.select().from(vouchers).where(whereClause).orderBy(desc(vouchers.createdAt)).limit(limit).offset(offset);
        const allVouchers = await db.select({ id: vouchers.id }).from(vouchers).where(whereClause);
        const totalItems = allVouchers.length;
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            data,
            pagination: { page, limit, totalItems, totalPages }
        });
    } catch {
        return NextResponse.json({ data: [] }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// POST HANDLERS
// --------------------------------------------------------------------------------

async function postAds(req: Request) {
    try {
        const body = await req.json();
        const { type, script_code, image_url, target_url, is_active } = body;
        await db.update(adSettings).set({
            type, scriptCode: script_code || "", imageUrl: image_url || "", targetUrl: target_url || "",
            isActive: is_active ? 1 : 0, updatedAt: new Date().toISOString()
        }).where(eq(adSettings.id, 1));
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

async function postRedeemUpdate(req: Request) {
    try {
        const body = await req.json();
        const { id, status, adminNotes } = body;
        if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const request_data = await db.select().from(redeemRequests).where(eq(redeemRequests.id, id)).get();
        if (!request_data) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (status === "rejected" && request_data.status !== "rejected") {
            await db.run(sql`UPDATE user_progress SET cashback_balance = cashback_balance + ${request_data.rupiahAmount} WHERE user_id = ${request_data.userId}`);
        }

        await db.update(redeemRequests).set({
            status, adminNotes: adminNotes || null, processedAt: status !== "pending" ? new Date() : null
        }).where(eq(redeemRequests.id, id));

        return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    } catch {
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}

async function postTreasureSettings(req: Request) {
    try {
        const body = await req.json();
        const { paid4linkUrl, isEnabled, requirePaid4link } = body;
        const existing = await db.select().from(treasureSettings).limit(1);

        if (existing.length > 0) {
            await db.update(treasureSettings).set({
                paid4linkUrl: paid4linkUrl || null, isEnabled: isEnabled ?? true, requirePaid4link: requirePaid4link ?? false, updatedAt: new Date()
            }).where(eq(treasureSettings.id, existing[0].id));
        } else {
            await db.insert(treasureSettings).values({
                paid4linkUrl: paid4linkUrl || null, isEnabled: isEnabled ?? true, requirePaid4link: requirePaid4link ?? false, updatedAt: new Date()
            });
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}

async function postUsersUpdate(req: Request) {
    try {
        const body = await req.json();
        const { userId, hasActiveSubscription } = body;
        await db.update(userProgress).set({ hasActiveSubscription }).where(eq(userProgress.userId, userId));
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// MAIN DISPATCHER
// --------------------------------------------------------------------------------

export async function GET(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const slug = (await params).slug;
    const path = slug.join("/");

    switch (path) {
        case "ads": return getAds();
        case "claims": return getClaims(req);
        case "feedback": return getFeedback(req);
        case "redeem": return getRedeem(req); // List
        case "treasure-settings": return getTreasureSettings();
        case "users": return getUsers();
        case "vouchers": return getVouchers(req);
        default: return new NextResponse("Not Found", { status: 404 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const slug = (await params).slug;
    const path = slug.join("/");

    switch (path) {
        case "ads": return postAds(req);
        case "redeem/update": return postRedeemUpdate(req);
        case "treasure-settings": return postTreasureSettings(req);
        case "users/update": return postUsersUpdate(req);
        default: return new NextResponse("Not Found", { status: 404 });
    }
}
