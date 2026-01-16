// Script to check guest users in database
const db = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "local.db");
const database = new db(dbPath);

console.log("\n=== GUEST USERS (role='guest') ===");
const guests = database.prepare("SELECT id, name, email, role, created_at FROM users WHERE role = 'guest' ORDER BY created_at DESC LIMIT 10").all();
console.table(guests);

console.log("\n=== GUEST PROGRESS ===");
const guestProgress = database.prepare("SELECT user_id, user_name, hearts, points, is_guest FROM user_progress WHERE is_guest = 1 ORDER BY user_id DESC LIMIT 10").all();
console.table(guestProgress);

console.log("\n=== ALL USERS (latest 10) ===");
const allUsers = database.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10").all();
console.table(allUsers);

database.close();
console.log("\nDone!");
