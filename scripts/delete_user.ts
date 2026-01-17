// Delete user script
import { tursoQuery, tursoExecute } from './db/turso-http';

async function deleteUser() {
    const email = 'muhikmu@gmail.com';

    try {
        const users = await tursoQuery('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            console.log('User not found with email:', email);
            return;
        }

        const userId = users[0].id;
        console.log('Found user:', userId);

        // Delete user_progress first (foreign key constraint)
        await tursoExecute('DELETE FROM user_progress WHERE user_id = ?', [userId]);
        console.log('Deleted user_progress');

        // Delete user
        await tursoExecute('DELETE FROM users WHERE id = ?', [userId]);
        console.log('Deleted user successfully!');

    } catch (error) {
        console.error('Error:', error);
    }
}

deleteUser();
