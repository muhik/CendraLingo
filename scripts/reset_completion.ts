
import { createClient } from "@libsql/client";

const TURSO_CONNECTION_URL = process.env.TURSO_CONNECTION_URL || "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const client = createClient({
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("🔄 Resetting User Progress for Simulation...");

    // 1. Generate All Lesson IDs
    const allLessonIds: number[] = [];
    for (let unit = 1; unit <= 10; unit++) {
        for (let block = 1; block <= 5; block++) {
            allLessonIds.push(unit * 100 + block);
        }
    }

    // 2. Remove the LAST one (Unit 10, Block 5 -> 1005)
    // The array is sorted by generation, so pop() works, or filter.
    const lastId = 1005;
    const completedLessons = allLessonIds.filter(id => id !== lastId);

    console.log(`Generated ${completedLessons.length} completed lessons (All except ${lastId})`);

    // 3. Find User
    // We look for a user who completed the course OR has high points
    const userRes = await client.execute("SELECT * FROM user_progress WHERE is_course_completed = 1 LIMIT 1");
    let user = userRes.rows[0];

    if (!user) {
        console.log("No user found with is_course_completed = 1. Searching by points...");
        const highPointUser = await client.execute("SELECT * FROM user_progress ORDER BY points DESC LIMIT 1");
        user = highPointUser.rows[0];
    }

    if (!user) {
        console.error("❌ No user found to reset!");
        return;
    }

    const userId = user.user_id;
    console.log(`👤 Target User: ${user.user_name} (${userId})`);

    // 4. Update Database
    try {
        await client.execute({
            sql: `UPDATE user_progress SET 
                    is_course_completed = 0,
                    completed_lessons = ?,
                    has_active_subscription = 0,
                    hearts = 5
                  WHERE user_id = ?`,
            args: [JSON.stringify(completedLessons), userId]
        });
        console.log("✅ User Progress RESET success!");
        console.log("- is_course_completed: 0");
        console.log("- has_active_subscription: 0 (Free)");
        console.log("- hearts: 5");
        console.log(`- completed_lessons: [${completedLessons.length} items] (Last one missing)`);
        console.log("\nREADY FOR SIMULATION! 🚀");
    } catch (e) {
        console.error("❌ Failed to update DB:", e);
    }
}

main();
