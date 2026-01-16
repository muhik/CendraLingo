import { NextResponse } from "next/server";
import { createInvoice } from "@/lib/xendit";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, planType, customAmount, customDescription } = body;

        if (!userId) {
            return new NextResponse("User ID required", { status: 400 });
        }

        let amount = 0;
        let description = "";
        let externalIdPrefix = "";

        if (planType === "PRO_MONTHLY") {
            amount = 49000;
            description = "Upgrade Jawara PRO (1 Month)";
            externalIdPrefix = "PRO";
        } else if (planType === "GEMS_TOPUP") {
            amount = customAmount;
            description = customDescription || "Top Up Gems";
            externalIdPrefix = "GEMS";
        } else {
            return new NextResponse("Invalid Plan Type", { status: 400 });
        }

        const externalId = `${externalIdPrefix}-${userId}-${Date.now()}`;

        // 1. Create Invoice via Xendit
        // If API Key is missing, this might fail or we can return a mock URL for testing
        let invoiceUrl = "";

        if (process.env.XENDIT_SECRET_KEY) {
            const invoice = await createInvoice({
                externalId,
                amount,
                description,
                payerEmail: "user@example.com",
                successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005"}/shop?payment=success`,
            });
            invoiceUrl = invoice.invoiceUrl;
        } else {
            console.log("⚠️ No Xendit Key found using Mock URL");
            // MOCK URL for Testing if no key provided
            invoiceUrl = "https://checkout-staging.xendit.co/web/mock-payment";
        }

        return NextResponse.json({
            url: invoiceUrl,
            externalId
        });

    } catch (error) {
        console.error("Purchase Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
