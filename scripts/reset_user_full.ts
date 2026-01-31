
import { createClient } from "@libsql/client";

const TURSO_CONNECTION_URL = process.env.TURSO_CONNECTION_URL || "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const client = createClient({
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function main() {
    const targetEmail = "muhikmu@gmail.com";
    console.log(`🔄 Resetting Full Progress for ${targetEmail}...`);

    // 1. Find User ID from 'users' table
    const userRes = await client.execute({
        sql: "SELECT id, name FROM users WHERE email = ? LIMIT 1",
        args: [targetEmail]
    });

    const user = userRes.rows[0];

    if (!user) {
        console.error(`❌ User with email ${targetEmail} not found in 'users' table!`);
        return;
    }

    const userId = user.id;
    console.log(`👤 Target User: ${user.name} (${userId})`);

    // 2. Reset All Progress Fields
    try {
        await client.execute({
            sql: `UPDATE user_progress SET 
                    is_course_completed = 0,
                    completed_lessons = ?,
                    has_active_subscription = 0,
                    hearts = 5,
                    points = 50,
                    active_course_id = 1
                  WHERE user_id = ?`,
            args: [JSON.stringify([]), userId]
        });
        console.log("✅ User Progress FULLY RESET to Day 1!");
        console.log("- is_course_completed: 0");
        console.log("- completed_lessons: [] (Empty)");
        console.log("- hearts: 5");
        console.log("- points: 50");
        console.log("- PRO: Revoked");
        console.log("\nREADY TO START OVER! 🚀");
    } catch (e) {
        console.error("❌ Failed to update DB:", e);
    }
}

main();
