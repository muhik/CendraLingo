// Xendit API Helper (Fetch implementation to reduce bundle size)

export interface CreateInvoiceParams {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description?: string;
    successRedirectUrl?: string;
}

export const createInvoice = async ({ externalId, amount, payerEmail, description, successRedirectUrl }: CreateInvoiceParams) => {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey) {
        console.warn("⚠️ XENDIT_SECRET_KEY is missing");
        throw new Error("Xendit API Key missing");
    }

    const auth = btoa(secretKey + ":"); // Native btoa for Edge

    const response = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            external_id: externalId,
            amount: amount,
            payer_email: payerEmail,
            description: description,
            invoice_duration: 86400,
            success_redirect_url: successRedirectUrl,
            currency: "IDR"
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Xendit Invoice Error:", response.status, errorBody);
        throw new Error(`Xendit API Failed: ${response.status}`);
    }

    const data = await response.json();

    // Return adapted response to match previous SDK usage
    return {
        invoiceUrl: data.invoice_url,
        id: data.id,
        status: data.status
    };
};
