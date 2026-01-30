
import { createClient } from "@libsql/client";

const TURSO_CONNECTION_URL = process.env.TURSO_CONNECTION_URL || "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const client = createClient({
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function main() {
    console.log("Checking manager_notifications...");
    try {
        const res = await client.execute("SELECT * FROM manager_notifications ORDER BY created_at DESC LIMIT 5");
        console.log(`Found ${res.rows.length} notifications.`);
        res.rows.forEach(row => {
            console.log(`- [${row.is_read ? 'READ' : 'UNREAD'}] ${row.user_name}: ${row.message}`);
        });
    } catch (e) {
        console.error("Error checking table:", e);
    }
}

main();
