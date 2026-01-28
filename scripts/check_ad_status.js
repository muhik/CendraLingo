const { createClient } = require("@libsql/client");

const url = "https://cendralingo-muhik.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ";

const client = createClient({ url, authToken });

async function checkAds() {
    try {
        const res = await client.execute("SELECT id, title, is_active, type FROM ad_settings ORDER BY id DESC");
        console.log("Current Ads in DB:");
        console.table(res.rows);
    } catch (e) {
        console.error("Error:", e);
    }
}

checkAds();
