const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCategories() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ecommerce_db',
            port: process.env.DB_PORT || 3306
        });

        const newCategories = [
            ['Computers', 'Laptops, desktops, and accessories'],
            ['Home & Kitchen', 'Appliances and home decor'],
            ['Fashion', 'Clothing, shoes, and accessories'],
            ['Beauty', 'Skincare, makeup, and health products'],
            ['Sports', 'Fitness gear and outdoor equipment'],
            ['Books', 'Physical books and e-books'],
            ['Toys', 'Games and toys for all ages']
        ];

        console.log('--- Current Categories ---');
        const [existing] = await connection.execute('SELECT name FROM categories');
        const existingNames = existing.map(c => c.name);
        console.log(existingNames.join(', ') || 'No categories found');

        let addedCount = 0;
        for (const [name, desc] of newCategories) {
            if (!existingNames.includes(name)) {
                await connection.execute('INSERT INTO categories (name, description) VALUES (?, ?)', [name, desc]);
                addedCount++;
                console.log(`✅ Added category: ${name}`);
            }
        }

        if (addedCount === 0) {
            console.log('ℹ️ All specified categories already exist.');
        } else {
            console.log(`🚀 Successfully added ${addedCount} new categories!`);
        }

    } catch (error) {
        console.error('❌ Error updating categories:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

addCategories();
