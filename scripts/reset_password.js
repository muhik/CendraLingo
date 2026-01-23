// Script to reset password for a user
// Run: node scripts/reset_password.js

const https = require('https');
const crypto = require('crypto');

const TURSO_URL = 'https://cendralingo-muhik.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg1MjU4NDUsImlkIjoiNTZmNzk1ZTYtZWYwYy00Y2E3LTgxM2YtZWQ5MTU1NGMzMTdkIiwicmlkIjoiYmNhMDM4NTYtMjgzMi00NzQ0LWI5NzYtMzFkNWQ1NTA2YzcyIn0.JfTIbsJkwl7biSkVEA4rIJlxBayKk3VAOoSy5sNS94L-SMyxZCe9OKU38-2s4XavpMdjPBenYAXNugKiB6y_CQ';

const EMAIL = 'muhikmu@gmail.com';
const NEW_PASSWORD = '12345';

async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            const saltHex = salt.toString('hex');
            const hashHex = derivedKey.toString('hex');
            resolve(`${saltHex}:${hashHex}`);
        });
    });
}

async function query(sql, args = []) {
    const body = JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql, args: args.map(v => ({ type: 'text', value: String(v) })) } }]
    });

    return new Promise((resolve, reject) => {
        const url = new URL('/v2/pipeline', TURSO_URL);
        const req = https.request({
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TURSO_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    // First, check if user exists
    console.log('Looking for user:', EMAIL);
    const findResult = await query(`SELECT id, name, email, password FROM users WHERE email = '${EMAIL}'`);
    console.log('User lookup result:', JSON.stringify(findResult, null, 2));

    // Check if user was found
    const rows = findResult?.results?.[0]?.response?.result?.rows || [];
    if (rows.length === 0) {
        console.log('❌ User NOT FOUND! Email does not exist in database.');
        console.log('Creating new user...');

        const userId = crypto.randomUUID();
        const hashedPassword = await hashPassword(NEW_PASSWORD);
        const now = Date.now();

        await query(`INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, 'Admin', EMAIL, hashedPassword, 'admin', now]);
        await query(`INSERT INTO user_progress (user_id, user_name, user_image, hearts, points, is_guest, has_active_subscription) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, 'Admin', '/mascot.svg', 5, 1000, 0, 1]);

        console.log('✅ New user created!');
        console.log('   Email:', EMAIL);
        console.log('   Password:', NEW_PASSWORD);
        return;
    }

    console.log('✅ User found!');

    console.log('\nHashing new password:', NEW_PASSWORD);
    const hashedPassword = await hashPassword(NEW_PASSWORD);
    console.log('New password hash:', hashedPassword.substring(0, 30) + '...');

    console.log('\nUpdating password in database...');
    const result = await query(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, EMAIL]);
    console.log('Update result:', JSON.stringify(result, null, 2));

    console.log('\n✅ Done! You can now login with:');
    console.log('   Email:', EMAIL);
    console.log('   Password:', NEW_PASSWORD);
}

main().catch(console.error);
