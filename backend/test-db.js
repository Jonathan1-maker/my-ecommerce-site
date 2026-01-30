const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing connection to:', process.env.DB_HOST);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });
        console.log('✅ Connected to MySQL server successfully');

        // Check if database exists
        const [rows] = await connection.query(`SHOW DATABASES LIKE '${process.env.DB_NAME || 'ecommerce_db'}'`);
        if (rows.length === 0) {
            console.log(`❌ Database '${process.env.DB_NAME || 'ecommerce_db'}' does not exist.`);
            console.log('creating database...');
            await connection.query(`CREATE DATABASE ${process.env.DB_NAME || 'ecommerce_db'}`);
            console.log(`✅ Database '${process.env.DB_NAME || 'ecommerce_db'}' created.`);
        } else {
            console.log(`✅ Database '${process.env.DB_NAME || 'ecommerce_db'}' exists.`);
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error testing connection:', error.message);
    }
}

testConnection();
