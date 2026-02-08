import { NextResponse } from "next/server";
import { tursoQuery, tursoExecute } from "@/db/turso-http";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            userId,
            hearts,
            points,
            completedLessons,
            activeCourseId,
            isCourseCompleted,
            cashbackBalance,
            isGuest
        } = body;

        if (!userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Convert completedLessons array to JSON string for storage
        const lessonsJson = completedLessons ? JSON.stringify(completedLessons) : null;

        await tursoExecute(
            `UPDATE user_progress SET 
                hearts = ?, 
                points = ?, 
                cashback_balance = ?, 
                is_course_completed = ?, 
                completed_lessons = ?,
                active_course_id = ?,
                is_guest = ?
             WHERE user_id = ?`,
            [
                hearts,
                points,
                cashbackBalance || 0,
                isCourseCompleted ? 1 : 0,
                lessonsJson,
                activeCourseId,
                isGuest ? 1 : 0,
                userId
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[USER_SYNC_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return new NextResponse("User ID required", { status: 400 });
        }

        const rows = await tursoQuery(
            "SELECT * FROM user_progress WHERE user_id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: true, user: null });
        }

        const row = rows[0];
        // Parse completedLessons from JSON string if present
        let completedLessons = [];
        if (row.completed_lessons) {
            try {
                completedLessons = JSON.parse(row.completed_lessons);
            } catch { }
        }

        const user = {
            userId: row.user_id,
            userName: row.user_name,
            userImage: row.user_image,
            activeCourseId: row.active_course_id,
            hearts: row.hearts,
            points: row.points,
            cashbackBalance: row.cashback_balance,
            isGuest: Boolean(row.is_guest),
            isCourseCompleted: Boolean(row.is_course_completed),
            hasActiveSubscription: Boolean(row.has_active_subscription),
            completedLessons
        };

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("[USER_SYNC_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
