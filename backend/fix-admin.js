const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdmin() {
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const email = 'admin@eshop.com';
        const newPassword = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`Updating password for ${email}...`);

        const res = await client.query(
            "UPDATE users SET password = $1 WHERE email = $2",
            [hashedPassword, email]
        );

        if (res.rowCount > 0) {
            console.log('✅ Admin password updated successfully!');
        } else {
            console.log('❌ User not found. Creating user...');
            await client.query(
                "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
                ['Admin User', email, hashedPassword, 'admin']
            );
            console.log('✅ Admin user created successfully!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

fixAdmin();
