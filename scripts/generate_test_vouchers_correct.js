const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

// Generate Random Code
function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "TEST-";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const codeRp = generateCode();
const codeGems = generateCode();
const now = Date.now();

try {
    // 1. Insert Rp Voucher (Rp 25)
    db.prepare(`
        INSERT INTO vouchers (code, value_rp, gems_amount, cashback_amount, is_claimed, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(codeRp, 25, 0, 25, 0, now);

    // 2. Insert Gems Voucher (10 Gems)
    db.prepare(`
        INSERT INTO vouchers (code, value_rp, gems_amount, cashback_amount, is_claimed, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(codeGems, 0, 10, 0, 0, now);

    console.log("VOUCHER GENERATED SUCCESSFULLY!");
    console.log("--------------------------------");
    console.log(`1. VOUCHER CASHBACK (Rp 25)  : ${codeRp}`);
    console.log(`2. VOUCHER GEMS (10 Gems)    : ${codeGems}`);
    console.log("--------------------------------");

} catch (err) {
    console.error("Error generating vouchers:", err);
} finally {
    db.close();
}
