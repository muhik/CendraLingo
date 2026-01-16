import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    cookieStore.delete("guest_session_id");

    return NextResponse.json({ message: "Guest session reset successfully" });
}
