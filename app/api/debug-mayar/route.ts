// Debug endpoint to see raw Mayar response structure
// DELETE AFTER USE
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const mayarApiKey = process.env.MAYAR_API_KEY;
        const mayarApiUrl = "https://api.mayar.id/hl/v1";

        if (!mayarApiKey) {
            return NextResponse.json({ error: "MAYAR_API_KEY missing" }, { status: 500 });
        }

        // Fetch latest invoices from Mayar
        const response = await fetch(`${mayarApiUrl}/invoice?limit=5`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${mayarApiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            return NextResponse.json({ error: "Mayar API Error", status: response.status, details: errText }, { status: 500 });
        }

        const mayarData = await response.json();

        // Return raw response for debugging
        return NextResponse.json({
            responseKeys: Object.keys(mayarData),
            data: mayarData,
            firstTxKeys: mayarData.data?.[0] ? Object.keys(mayarData.data[0]) : [],
            firstTxFull: mayarData.data?.[0] || null
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
