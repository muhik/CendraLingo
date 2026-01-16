const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local.db');
const db = new Database(dbPath);

console.log(' clearing users and user_progress tables...');

try {
    const deleteUsers = db.prepare('DELETE FROM users');
    const deleteProgress = db.prepare('DELETE FROM user_progress');

    // Optional: Reset User related logs if any, but focusing on user accounts
    // const deleteUserLogs = db.prepare('DELETE FROM user_logs'); 

    const infoUsers = deleteUsers.run();
    console.log(`Deleted ${infoUsers.changes} rows from users table.`);

    const infoProgress = deleteProgress.run();
    console.log(`Deleted ${infoProgress.changes} rows from user_progress table.`);

    console.log('Database cleared successfully!');
} catch (error) {
    console.error('Error clearing database:', error);
}

db.close();
