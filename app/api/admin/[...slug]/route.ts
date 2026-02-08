import { NextResponse } from "next/server";
import { tursoQuery, tursoExecute } from "@/db/turso-http";
export const runtime = "nodejs";

// --------------------------------------------------------------------------------
// GET HANDLERS
// --------------------------------------------------------------------------------

async function getAds() {
    try {
        const rows = await tursoQuery("SELECT * FROM ad_settings WHERE id = 1");
        return NextResponse.json(rows[0] || {});
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function getClaims(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        const claims = await tursoQuery(`
            SELECT v.code, v.claimed_by, p.user_name, v.value_rp, v.cashback_amount, v.claimed_at
            FROM vouchers v
            LEFT JOIN user_progress p ON v.claimed_by = p.user_id
            WHERE v.is_claimed = 1
            ORDER BY v.claimed_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const countResult = await tursoQuery("SELECT COUNT(*) as total FROM vouchers WHERE is_claimed = 1");
        const totalItems = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const totalCashback = claims.reduce((sum: number, c: any) => sum + (c.cashback_amount || 0), 0);

        return NextResponse.json({
            data: claims,
            pagination: { page, limit, totalItems, totalPages },
            summary: { totalCashback }
        });
    } catch (e) {
        return NextResponse.json({ data: [], error: String(e) }, { status: 500 });
    }
}

async function getFeedback(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        const countResult = await tursoQuery("SELECT COUNT(*) as total FROM feedbacks");
        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        const data = await tursoQuery("SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);

        return NextResponse.json({
            data,
            pagination: { total, page, totalPages, limit }
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function getRedeem(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let requests;
        if (status) {
            requests = await tursoQuery("SELECT * FROM redeem_requests WHERE status = ? ORDER BY created_at DESC", [status]);
        } else {
            requests = await tursoQuery("SELECT * FROM redeem_requests ORDER BY created_at DESC");
        }

        const pendingResult = await tursoQuery("SELECT COUNT(*) as count FROM redeem_requests WHERE status = 'pending'");
        const pendingCount = pendingResult[0]?.count || 0;

        return NextResponse.json({ requests, pendingCount, total: requests.length });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function getTreasureSettings() {
    try {
        const settings = await tursoQuery("SELECT * FROM treasure_settings LIMIT 1");
        if (settings.length === 0) {
            return NextResponse.json({ id: null, paid4link_url: null, is_enabled: 1, require_paid4link: 0 });
        }
        return NextResponse.json(settings[0]);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function getUsers(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const offset = (page - 1) * limit;

        let query = `
            SELECT up.*, u.email 
            FROM user_progress up 
            LEFT JOIN users u ON up.user_id = u.id
        `;
        const args: any[] = [];

        if (search) {
            query += " WHERE up.user_name LIKE ? OR u.email LIKE ? OR up.user_id LIKE ?";
            args.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += " ORDER BY up.hearts DESC LIMIT ? OFFSET ?";
        args.push(limit, offset);

        const rows = await tursoQuery(query, args);

        // Count Total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM user_progress up 
            LEFT JOIN users u ON up.user_id = u.id
        `;
        const countArgs: any[] = [];
        if (search) {
            countQuery += " WHERE up.user_name LIKE ? OR u.email LIKE ? OR up.user_id LIKE ?";
            countArgs.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const countResult = await tursoQuery(countQuery, countArgs);
        const totalItems = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // Map to camelCase
        const users = rows.map((u: any) => ({
            userId: u.user_id,
            userName: u.user_name,
            email: u.email,
            userImage: u.user_image,
            hearts: u.hearts,
            points: u.points,
            isCourseCompleted: Boolean(u.is_course_completed),
            hasActiveSubscription: Boolean(u.has_active_subscription),
            subscriptionEndsAt: u.subscription_ends_at,
            isGuest: Boolean(u.is_guest),
            cashbackBalance: u.cashback_balance || 0
        }));

        return NextResponse.json({
            data: users,
            pagination: { page, limit, totalItems, totalPages }
        });
    } catch (e) {
        return NextResponse.json({ data: [], error: String(e) }, { status: 500 });
    }
}

async function getVouchers(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = (page - 1) * limit;

        const data = await tursoQuery("SELECT * FROM vouchers ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
        const countResult = await tursoQuery("SELECT COUNT(*) as total FROM vouchers");
        const totalItems = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            data,
            pagination: { page, limit, totalItems, totalPages }
        });
    } catch (e) {
        return NextResponse.json({ data: [], error: String(e) }, { status: 500 });
    }
}

async function getSecurityLogs(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        const logs = await tursoQuery("SELECT * FROM security_logs ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
        const countResult = await tursoQuery("SELECT COUNT(*) as total FROM security_logs");
        const totalItems = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            data: logs,
            pagination: { page, limit, totalItems, totalPages }
        });
    } catch (e) {
        return NextResponse.json({ data: [], error: String(e) }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// POST HANDLERS
// --------------------------------------------------------------------------------

async function postAds(req: Request) {
    try {
        const body = await req.json();
        const { type, script_code, image_url, target_url, is_active } = body;
        await tursoExecute(
            "UPDATE ad_settings SET type = ?, script_code = ?, image_url = ?, target_url = ?, is_active = ?, updated_at = ? WHERE id = 1",
            [type, script_code || "", image_url || "", target_url || "", is_active ? 1 : 0, new Date().toISOString()]
        );
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function postRedeemUpdate(req: Request) {
    try {
        const body = await req.json();
        const { id, status, adminNotes } = body;
        if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const requests = await tursoQuery("SELECT * FROM redeem_requests WHERE id = ?", [id]);
        const request_data = requests[0];
        if (!request_data) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (status === "rejected" && request_data.status !== "rejected") {
            await tursoExecute("UPDATE user_progress SET cashback_balance = cashback_balance + ? WHERE user_id = ?",
                [request_data.rupiah_amount, request_data.user_id]);
        }

        const processedAt = status !== "pending" ? Date.now() : null;
        await tursoExecute(
            "UPDATE redeem_requests SET status = ?, admin_notes = ?, processed_at = ? WHERE id = ?",
            [status, adminNotes || null, processedAt, id]
        );

        return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function postTreasureSettings(req: Request) {
    try {
        const body = await req.json();
        const { paid4linkUrl, isEnabled, requirePaid4link } = body;
        const existing = await tursoQuery("SELECT * FROM treasure_settings LIMIT 1");

        if (existing.length > 0) {
            await tursoExecute(
                "UPDATE treasure_settings SET paid4link_url = ?, is_enabled = ?, require_paid4link = ?, updated_at = ? WHERE id = ?",
                [paid4linkUrl || null, isEnabled ? 1 : 0, requirePaid4link ? 1 : 0, Date.now(), existing[0].id]
            );
        } else {
            await tursoExecute(
                "INSERT INTO treasure_settings (paid4link_url, is_enabled, require_paid4link, updated_at) VALUES (?, ?, ?, ?)",
                [paid4linkUrl || null, isEnabled ? 1 : 0, requirePaid4link ? 1 : 0, Date.now()]
            );
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function postUsersUpdate(req: Request) {
    try {
        const body = await req.json();
        const { userId, hasActiveSubscription } = body;

        let query = "UPDATE user_progress SET has_active_subscription = ? WHERE user_id = ?";
        let args: any[] = [hasActiveSubscription ? 1 : 0, userId];

        // If Upgrading to PRO (GRANT)
        if (hasActiveSubscription) {
            // Set Expiration to 30 Days from now
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            const expiresAt = Date.now() + thirtyDaysMs;

            query = "UPDATE user_progress SET has_active_subscription = 1, hearts = 5, points = points + 1000, subscription_ends_at = ? WHERE user_id = ?";
            args = [expiresAt, userId];
        } else {
            // If Revoking PRO (Remove access)
            query = "UPDATE user_progress SET has_active_subscription = 0, subscription_ends_at = NULL WHERE user_id = ?";
            args = [userId];
        }

        await tursoExecute(query, args);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

async function deleteUser(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        await tursoExecute("DELETE FROM user_progress WHERE user_id = ?", [userId]);
        // Also clean up related data if needed (vouchers, redemptions) - strictly speaking we should cascade,
        // but for now deleting the user progress is the main goal.
        // Optional: DELETE FROM vouchers WHERE claimed_by = ?

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
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
        case "redeem": return getRedeem(req);
        case "treasure-settings": return getTreasureSettings();
        case "users": return getUsers(req);
        case "vouchers": return getVouchers(req);
        case "security/logs": return getSecurityLogs(req);
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

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const slug = (await params).slug;
    const path = slug.join("/");

    switch (path) {
        case "users": return deleteUser(req);
        default: return new NextResponse("Not Found", { status: 404 });
    }
}
