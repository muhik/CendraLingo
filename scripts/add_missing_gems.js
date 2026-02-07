// Script to add missing 10 gems from failed polling transaction
// Run with: node scripts/add_missing_gems.js

require("dotenv").config();

const TURSO_URL = process.env.TURSO_CONNECTION_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function tursoExecute(sql, args = []) {
    const res = await fetch(`${TURSO_URL}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TURSO_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            requests: [
                { type: "execute", stmt: { sql, args: args.map(a => ({ type: "text", value: String(a) })) } },
                { type: "close" }
            ]
        })
    });
    return res.json();
}

async function tursoQuery(sql, args = []) {
    const data = await tursoExecute(sql, args);
    if (data.results && data.results[0] && data.results[0].response && data.results[0].response.result) {
        const result = data.results[0].response.result;
        const cols = result.cols.map(c => c.name);
        return result.rows.map(row => {
            const obj = {};
            row.forEach((cell, i) => {
                obj[cols[i]] = cell.value;
            });
            return obj;
        });
    }
    return [];
}

async function main() {
    console.log("--- Adding Missing 10 Gems ---\n");

    // First, find the last transaction with orderId c638b149...
    const txs = await tursoQuery("SELECT user_id, order_id, gross_amount FROM transactions ORDER BY created_at DESC LIMIT 5");
    console.log("Recent transactions:");
    txs.forEach(tx => console.log(`  ${tx.order_id} -> userId: ${tx.user_id}, amount: ${tx.gross_amount}`));

    // Find all users in user_progress
    const users = await tursoQuery("SELECT user_id, points FROM user_progress LIMIT 5");
    console.log("\nUsers in database:");
    users.forEach(u => console.log(`  ${u.user_id}: ${u.points} gems`));

    // If we found a user, add 10 gems
    if (users.length > 0) {
        const targetUser = users[0].user_id;
        console.log(`\nAdding 10 gems to user: ${targetUser}`);

        await tursoExecute("UPDATE user_progress SET points = points + 10 WHERE user_id = ?", [targetUser]);

        // Verify
        const updated = await tursoQuery("SELECT points FROM user_progress WHERE user_id = ?", [targetUser]);
        console.log(`New gems count: ${updated[0]?.points}`);
        console.log("\n✅ Done!");
    } else {
        console.log("No users found!");
    }
}

main().catch(console.error);
