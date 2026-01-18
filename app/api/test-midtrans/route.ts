import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
    try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const authString = btoa(serverKey + ":");

        // Test Data
        const orderId = "TEST_" + Date.now();
        const payload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: 10000
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                first_name: "Test",
                email: "test@example.com",
                phone: "08123456789"
            }
        };

        const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Basic ${authString}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            key_used_prefix: serverKey ? serverKey.substring(0, 10) + "..." : "NONE",
            is_sandbox_url: true,
            midtrans_response: data
        });

    } catch (e) {
        return NextResponse.json({
            error: String(e)
        }, { status: 500 });
    }
}
