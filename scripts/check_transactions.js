const { createClient } = require("@libsql/client");

const client = createClient({
    url: "https://cendralingo-muhik.aws-ap-northeast-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ",
});

async function checkTransactions() {
    try {
        console.log("Checking last 10 transactions...");
        const result = await client.execute("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10");

        if (result.rows.length === 0) {
            console.log("No transactions found.");
        } else {
            result.rows.forEach(row => {
                console.log(`[${row.created_at}] ID: ${row.order_id} | Amt: ${row.gross_amount} | Sts: ${row.status}`);
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

checkTransactions();
