const { Client } = require('pg');
require('dotenv').config();

async function makeAdmin(email) {
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const { rows: users } = await client.query('SELECT id, name, role FROM users WHERE email = $1', [email]);

        if (users.length === 0) {
            console.error(`❌ User with email ${email} not found.`);
            return;
        }

        const user = users[0];
        if (user.role === 'admin') {
            console.log(`ℹ️ User ${user.name} is already an admin.`);
            return;
        }

        await client.query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
        console.log(`✅ User ${user.name} (${email}) has been elevated to admin!`);

    } catch (error) {
        console.error('❌ Error updating user role:', error.message);
    } finally {
        await client.end();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node makeAdmin.js <email>');
} else {
    makeAdmin(email);
}

