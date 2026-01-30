
import { createClient } from "@libsql/client";

const TURSO_CONNECTION_URL = process.env.TURSO_CONNECTION_URL || "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const client = createClient({
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("Checking user_progress for completion status...");
    try {
        const res = await client.execute("SELECT user_id, user_name, is_course_completed FROM user_progress WHERE is_course_completed = 1");
        console.log(`Found ${res.rows.length} completed users.`);
        res.rows.forEach(row => {
            console.log(`- ${row.user_name} (${row.user_id}): COMPLETED`);
        });

        // Also check raw columns of one user to be sure
        const one = await client.execute("SELECT * FROM user_progress LIMIT 1");
        console.log("Columns present:", Object.keys(one.rows[0] || {}));
    } catch (e) {
        console.error("Error checking table:", e);
    }
}

main();
