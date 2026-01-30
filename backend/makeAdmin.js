const mysql = require('mysql2/promise');
require('dotenv').config();

async function makeAdmin(email) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ecommerce_db',
            port: process.env.DB_PORT || 3306
        });

        const [users] = await connection.execute('SELECT id, name, role FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            console.error(`❌ User with email ${email} not found.`);
            return;
        }

        const user = users[0];
        if (user.role === 'admin') {
            console.log(`ℹ️ User ${user.name} is already an admin.`);
            return;
        }

        await connection.execute('UPDATE users SET role = "admin" WHERE id = ?', [user.id]);
        console.log(`✅ User ${user.name} (${email}) has been elevated to admin!`);

    } catch (error) {
        console.error('❌ Error updating user role:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node makeAdmin.js <email>');
} else {
    makeAdmin(email);
}
