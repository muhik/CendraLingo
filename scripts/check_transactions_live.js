const url = "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

async function run() {
    try {
        const finalUrl = url.replace("libsql://", "https://");
        console.log("Fetching from:", finalUrl);

        const response = await fetch(`${finalUrl}/v2/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                requests: [
                    {
                        type: "execute",
                        stmt: { sql: "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5" }
                    },
                    { type: "close" }
                ]
            })
        });

        if (!response.ok) {
            console.error("Response Error:", response.status, await response.text());
            return;
        }

        const data = await response.json();
        const result = data.results[0]?.response?.result;

        if (!result) {
            console.log("No results found.");
            console.log(JSON.stringify(data, null, 2));
            return;
        }

        const columns = result.cols.map(c => c.name);
        const rows = result.rows.map(row => {
            const obj = {};
            row.forEach((cell, idx) => obj[columns[idx]] = cell.value);
            return obj;
        });

        console.log("Recent Transactions:");
        console.log(JSON.stringify(rows, null, 2));

    } catch (error) {
        console.error("Script Error:", error);
    }
}

run();
