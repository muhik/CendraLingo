import { Xendit } from 'xendit-node';

// Initialize Xendit Client
// Note: This relies on the XENDIT_SECRET_KEY environment variable
export const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || "",
});

// Helper Types for our app
export interface CreateInvoiceParams {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description?: string;
    successRedirectUrl?: string; // New param
}

/**
 * Helper to create an invoice (Payment Link)
 */
export const createInvoice = async ({ externalId, amount, payerEmail, description, successRedirectUrl }: CreateInvoiceParams) => {
    try {
        const response = await xenditClient.Invoice.createInvoice({
            data: {
                externalId,
                amount,
                payerEmail,
                description,
                invoiceDuration: 86400, // 24 Hours
                currency: "IDR",
                successRedirectUrl, // Pass to Xendit
            }
        });
        return response;
    } catch (error) {
        console.error("Xendit Invoice Error:", error);
        throw error;
    }
};
