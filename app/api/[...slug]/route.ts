import { NextResponse } from "next/server";
import { tursoQuery, tursoExecute } from "@/db/turso-http";

import { Security, SecurityEvent, SecuritySeverity } from "@/lib/security";

export const runtime = "edge";

// --------------------------------------------------------------------------------
// LOGIC: ADS
// --------------------------------------------------------------------------------
async function getAds() {
    try {
        const rows = await tursoQuery("SELECT * FROM ad_settings WHERE id = 1 AND is_active = 1 LIMIT 1");
        const ad = rows[0] || null;
        return NextResponse.json(ad);
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

        // Rate limit feedback: 1 per minute
        const allowed = await Security.checkRateLimit(`FEEDBACK:${userId}`, 1, 60);
        if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

        await tursoExecute(
            "INSERT INTO feedbacks (user_id, user_name, message, type, created_at) VALUES (?, ?, ?, ?, ?)",
            [userId, userName || "Anonymous", message, type || 'saran', new Date().toISOString()]
        );
        return NextResponse.json({ success: true, message: "Feedback submitted" });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// --------------------------------------------------------------------------------
// LOGIC: PURCHASE (Xendit)
// --------------------------------------------------------------------------------
import { Midtrans } from "@/lib/midtrans";

// ... (other imports remain, but remove xendit)

// --------------------------------------------------------------------------------
// LOGIC: PURCHASE (Midtrans)
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// LOGIC: PURCHASE (Midtrans)
// --------------------------------------------------------------------------------
async function postPurchase(req: Request) {
    try {
        const body = await req.json();
        const { userId, planType, customAmount, customDescription } = body;
        if (!userId) return new NextResponse("User ID required", { status: 400 });

        let amount = 0;
        let description = "";
        let typeCode = ""; // P=Pro, G=Gems

        if (planType === "PRO_MONTHLY") { amount = 49000; description = "Upgrade Jawara PRO (1 Month)"; typeCode = "P"; }
        else if (planType === "GEMS_TOPUP") { amount = customAmount; description = customDescription || "Top Up Gems"; typeCode = "G"; }
        else { return new NextResponse("Invalid Plan Type", { status: 400 }); }

        // Security: Order ID Max 50 chars.
        // Format: TYPE_UUID_TIMESTAMP(base36)
        // UUID=36 chars, TYPE=1, TIME=~8. Total ~47 chars.
        // using '_' separator because UUID has '-'
        const timestamp = Date.now().toString(36).toUpperCase();
        const orderId = `${typeCode}_${userId}_${timestamp}`;

        // Use Midtrans Snap
        const transaction = await Midtrans.createTransaction({
            orderId,
            amount,
            description,
            customerDetails: {
                firstName: "User",
                email: "user@cendralingo.id", // Dummy email needed
                phone: "08123456789"
            }
        });

        // Midtrans returns { token, redirect_url }
        return NextResponse.json({ url: transaction.redirect_url, externalId: orderId });

    } catch (e) {
        return new NextResponse(JSON.stringify({ error: String(e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// ... (Redeem Logic remains same)

// --------------------------------------------------------------------------------
// LOGIC: WEBHOOKS
// --------------------------------------------------------------------------------
async function postWebhookMidtrans(req: Request) {
    try {
        const body = await req.json();
        const { order_id, status_code, gross_amount, transaction_status, signature_key } = body;

        // 1. Signature Verification
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey) return NextResponse.json({ error: "Server Key missing" }, { status: 500 });

        const rawString = order_id + status_code + gross_amount + serverKey;
        const encoder = new TextEncoder();
        const data = encoder.encode(rawString);
        const hashBuffer = await crypto.subtle.digest("SHA-512", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const computedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (computedSignature !== signature_key) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        // 2. Handle Status
        if (transaction_status === "capture" || transaction_status === "settlement") {
            const parts = order_id.split("_");
            // format: TYPE_userId_timestamp

            if (parts.length < 3) return NextResponse.json({ received: true });

            const typeCode = parts[0];
            const userId = parts[1];

            if (typeCode === "P") {
                // Jawara PRO
                await tursoExecute("UPDATE user_progress SET has_active_subscription = 1, points = points + 1000, hearts = 5 WHERE user_id = ?", [userId]);
            } else if (typeCode === "G") {
                // Gems Topup
                const paidRp = Math.floor(Number(gross_amount));
                let gemsToAdd = 0;
                if (paidRp >= 10000) gemsToAdd = 120;
                else if (paidRp >= 5000) gemsToAdd = 55;
                else gemsToAdd = 10;

                await tursoExecute("UPDATE user_progress SET points = points + ? WHERE user_id = ?", [gemsToAdd, userId]);
            }
        }

        return NextResponse.json({ received: true });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
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
        case "webhooks/midtrans": return postWebhookMidtrans(req);
        default: return new NextResponse("Not Found", { status: 404 });
    }
}
