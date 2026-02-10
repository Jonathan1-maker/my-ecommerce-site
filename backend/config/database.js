const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool using connection string (best for Neon/Vercel)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : (process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false)
});

// Compatibility wrapper to match mysql2 promise behavior
const promisePool = {
    query: async (text, params = [], client = null) => {
        // Convert ? to $1, $2, etc.
        let count = 0;
        const pgText = text.replace(/\?/g, () => `$${++count}`);

        const isInsert = pgText.trim().toUpperCase().startsWith('INSERT INTO');
        const isUpdate = pgText.trim().toUpperCase().startsWith('UPDATE');
        const isDelete = pgText.trim().toUpperCase().startsWith('DELETE');

        // For inserts, we need to return the ID to match mysql2's insertId
        let finalQuery = pgText;
        if (isInsert && !pgText.toUpperCase().includes('RETURNING')) {
            finalQuery += ' RETURNING id';
        }

        try {
            // Use the provided client if in a connection/transaction, otherwise use the pool
            const executor = client || pool;
            const result = await executor.query(finalQuery, params);

            if (isInsert || isUpdate || isDelete) {
                const resultObject = {
                    insertId: result.rows[0]?.id,
                    affectedRows: result.rowCount,
                    affectedRowsCount: result.rowCount
                };
                return [resultObject, result.fields];
            }

            return [result.rows, result.fields];
        } catch (error) {
            console.error('Database Query Error:', error.message);
            console.error('Query:', finalQuery);
            throw error;
        }
    },
    // Add execute if needed
    execute: async (text, params = []) => {
        return promisePool.query(text, params);
    },
    getConnection: async () => {
        const client = await pool.connect();
        return {
            query: (text, params) => promisePool.query(text, params, client),
            beginTransaction: () => client.query('BEGIN'),
            commit: () => client.query('COMMIT'),
            rollback: () => client.query('ROLLBACK'),
            release: () => client.release()
        };
    }
};

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ PostgreSQL/Neon connected successfully');
    release();
});

module.exports = promisePool;

