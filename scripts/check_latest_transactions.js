const { createClient } = require("@libsql/client");
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    url: "https://cendralingo-muhik.aws-ap-northeast-1.turso.io",
    authToken: "eyJhIjoiZTBjZTUxMjgxM2I5ODdmOGQ1YjcwMTVjZDIxMzI2MmYiLCJ0IjoiY2VuZHJhbGluZ28tbXVoaWsiLCJzIjoiY2VuZHJhbGluZ28tbXVoaWsifQ.yN--2W5lHn8W6G_uGzQfRPjT5yL1T0j1tL2yA_B7Q7k"
});

async function checkRecentTransactions() {
    try {
        console.log("Checking last 5 transactions...");
        const res = await client.execute("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5");

        if (res.rows.length === 0) {
            console.log("No transactions found.");
        } else {
            console.table(res.rows);
        }
    } catch (err) {
        console.error("Error checking DB:", err);
    }
}

checkRecentTransactions();
