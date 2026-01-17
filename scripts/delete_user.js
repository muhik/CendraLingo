// Delete user script - with correct env loading
require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function deleteUser() {
    const email = 'muhikmu@gmail.com';

    try {
        console.log('Looking for user with email:', email);
        const result = await client.execute({
            sql: 'SELECT id FROM users WHERE email = ?',
            args: [email]
        });

        if (result.rows.length === 0) {
            console.log('User not found with email:', email);
            return;
        }

        const userId = result.rows[0].id;
        console.log('Found user:', userId);

        // Delete user_progress first (foreign key constraint)
        await client.execute({
            sql: 'DELETE FROM user_progress WHERE user_id = ?',
            args: [userId]
        });
        console.log('Deleted user_progress');

        // Delete user
        await client.execute({
            sql: 'DELETE FROM users WHERE id = ?',
            args: [userId]
        });
        console.log('Deleted user successfully!');

    } catch (error) {
        console.error('Error:', error);
    }
}

deleteUser();
