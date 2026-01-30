
import { createClient } from "@libsql/client";

const TURSO_CONNECTION_URL = process.env.TURSO_CONNECTION_URL || "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const client = createClient({
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("Creating manager_notifications table...");
    try {
        await client.execute(`
            CREATE TABLE IF NOT EXISTS manager_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                user_name TEXT,
                user_image TEXT,
                type TEXT DEFAULT 'course_completion',
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table created successfully!");
    } catch (e) {
        console.error("Error creating table:", e);
    }
}

main();
