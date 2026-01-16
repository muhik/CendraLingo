require('dotenv').config();
const { createClient } = require('@libsql/client');

async function testConnection() {
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    console.log("Testing Connection to:", url);
    console.log("Token Length:", authToken ? authToken.length : 0);

    const client = createClient({
        url: url.trim(),
        authToken: authToken ? authToken.trim() : undefined
    });

    try {
        const result = await client.execute("SELECT 1 as val");
        console.log("SUCCESS! Connection Working.");
        console.log("Result:", result.rows);
    } catch (err) {
        console.error("CONNECTION FAILED:");
        console.error(err);
    }
}

testConnection();
