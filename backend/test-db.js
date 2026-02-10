const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    console.log('Testing connection to database...');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL/Neon successfully');

        const res = await client.query('SELECT current_database(), current_user, version()');
        console.log('Database details:', res.rows[0]);

        await client.end();
    } catch (error) {
        console.error('❌ Error testing connection:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.log('💡 Tip: Check your DB_USER and DB_PASSWORD or DATABASE_URL');
        }
    }
}

testConnection();

