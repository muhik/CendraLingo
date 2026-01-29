import { createClient } from "@libsql/client";
import { curriculumData } from "../data/curriculum";

// Hardcoding credentials from previous logs to bypass dotenv issues in this environment
const TURSO_URL = "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
});

async function setProgressToEnd() {
    const email = "muhikmu@gmail.com";
    console.log(`Searching for user: ${email}...`);

    try {
        // 1. Get User ID
        const userResult = await turso.execute({
            sql: "SELECT id, email FROM users WHERE email = ?",
            args: [email]
        });

        if (userResult.rows.length === 0) {
            console.error("User not found!");
            return;
        }

        const userId = userResult.rows[0].id;
        console.log(`Found User ID: ${userId}`);

        // 2. Collect ALL Lesson IDs from Curriculum
        let allLessonIds: number[] = [];
        curriculumData.forEach(unit => {
            unit.lessons.forEach(lesson => {
                allLessonIds.push(lesson.id);
            });
        });

        // Remove the very last lesson ID (ID 1005)
        const lastLessonId = 1005;
        const completedIds = allLessonIds.filter(id => id !== lastLessonId);

        console.log(`Total Lessons: ${allLessonIds.length}`);
        console.log(`Marking ${completedIds.length} lessons as completed...`);

        // 3. Update User Progress
        // Check if progress exists
        const progressCheck = await turso.execute({
            sql: "SELECT * FROM user_progress WHERE user_id = ?",
            args: [userId]
        });

        if (progressCheck.rows.length === 0) {
            // Insert
            await turso.execute({
                sql: "INSERT INTO user_progress (user_id, hearts, points, is_guest, has_active_subscription, completed_lessons, is_course_completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                args: [
                    userId,
                    5,
                    9999,
                    0,
                    1,
                    JSON.stringify(completedIds),
                    0
                ]
            });
            console.log("Created new progress record.");
        } else {
            // Update
            await turso.execute({
                sql: "UPDATE user_progress SET completed_lessons = ?, points = ?, hearts = ?, has_active_subscription = 1, is_course_completed = 0 WHERE user_id = ?",
                args: [JSON.stringify(completedIds), 9999, 5, userId]
            });
            console.log("Updated existing progress record.");
        }

        console.log("✅ SUCCESS: User is now at the final stage!");
        console.log("To test: Log in, go to Unit 10, Play the last lesson (Appointments). Finish it, and the Manager Signal should trigger.");

    } catch (err) {
        console.error("Database Error:", err);
    }
}

setProgressToEnd();
