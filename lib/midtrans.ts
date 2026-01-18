export interface CreateTransactionParams {
    orderId: string;
    amount: number;
    description: string;
    customerDetails?: {
        firstName?: string;
        email?: string;
        phone?: string;
    };
}

export class Midtrans {
    // Sandbox Base URL
    private static BASE_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Toggle this to true for Production
    private static IS_PRODUCTION = false;

    static getBaseUrl() {
        // Smart Detection: Check key prefix
        const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
        const isSandboxKey = serverKey.startsWith("SB-");

        // If it starts with SB-, force Sandbox. Otherwise, assume Production (or user error, but try Prod).
        // Overrides the static IS_PRODUCTION flag if needed.
        return isSandboxKey
            ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
            : "https://app.midtrans.com/snap/v1/transactions";
    }

    static async createTransaction(params: CreateTransactionParams) {
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is missing");

        const auth = btoa(serverKey + ":"); // Basic Auth

        const body = {
            transaction_details: {
                order_id: params.orderId,
                gross_amount: params.amount,
            },
            credit_card: {
                secure: true,
            },
            customer_details: {
                first_name: params.customerDetails?.firstName || "Customer",
                email: params.customerDetails?.email || "customer@example.com",
                phone: params.customerDetails?.phone || "08123456789",
            },
            item_details: [
                {
                    id: params.orderId,
                    price: params.amount,
                    quantity: 1,
                    name: params.description.substring(0, 50), // Max 50 chars
                }
            ]
        };

        const response = await fetch(this.getBaseUrl(), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Midtrans Error:", response.status, errorText);
            throw new Error(`Midtrans API Failed: ${response.status}`);
        }

        const data = await response.json();
        // data contains { token, redirect_url }
        return data;
    }
}
