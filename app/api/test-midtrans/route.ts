import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
    try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY || "NO_KEY";
        const authString = btoa(serverKey + ":");
        const orderId = "TEST_" + Date.now();

        const payload = {
            transaction_details: { order_id: orderId, gross_amount: 10000 },
            credit_card: { secure: true },
            customer_details: { first_name: "Test", email: "test@example.com", phone: "08123456789" }
        };

        const tryUrl = async (url: string, label: string) => {
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": `Basic ${authString}`
                    },
                    body: JSON.stringify(payload)
                });
                const text = await res.text();
                let json = null;
                try { json = JSON.parse(text); } catch (e) { }
                return { label, status: res.status, body: json || text };
            } catch (e) {
                return { label, error: String(e) };
            }
        };

        // Probe both environments
        const sandboxResult = await tryUrl("https://app.sandbox.midtrans.com/snap/v1/transactions", "SANDBOX_URL");
        const prodResult = await tryUrl("https://app.midtrans.com/snap/v1/transactions", "PRODUCTION_URL");

        return NextResponse.json({
            key_used: serverKey.substring(0, 5) + "...",
            results: [sandboxResult, prodResult]
        }, {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
