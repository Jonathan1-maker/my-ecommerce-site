const { Client } = require('pg');
require('dotenv').config();

async function addCategories() {
    const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

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
        const { rows: existing } = await client.query('SELECT name FROM categories');
        const existingNames = existing.map(c => c.name);
        console.log(existingNames.join(', ') || 'No categories found');

        let addedCount = 0;
        for (const [name, desc] of newCategories) {
            if (!existingNames.includes(name)) {
                await client.query('INSERT INTO categories (name, description) VALUES ($1, $2)', [name, desc]);
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
        await client.end();
    }
}

addCategories();

