import { createClient } from "@libsql/client";

// Hardcoding credentials from previous logs
const TURSO_URL = "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
});

async function addColumn() {
    console.log("Attempting to add 'completed_lessons' column to 'user_progress' table...");
    try {
        await turso.execute("ALTER TABLE user_progress ADD COLUMN completed_lessons TEXT DEFAULT '[]'");
        console.log("✅ Success: Column added.");
    } catch (err) {
        if (String(err).includes("duplicate column name")) {
            console.log("ℹ️ Column already exists.");
        } else {
            console.error("❌ Error adding column:", err);
        }
    }
}

addColumn();
