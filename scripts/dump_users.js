const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');
const fs = require('fs');

try {
    const users = db.prepare("SELECT user_id, user_name, cashback_balance FROM user_progress").all();
    fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
    console.log('Dumped users to users_dump.json');
} catch (error) {
    console.error('Error dumping users:', error);
}
