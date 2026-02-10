const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    console.log('🚀 Initializing PostgreSQL/Neon database...');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const schemaPath = path.join(__dirname, '../../database/schema_pg.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📜 Running schema script...');
        await client.query(schema);
        console.log('✅ Database schema initialized successfully');

    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
    } finally {
        await client.end();
    }
}

initDatabase();
