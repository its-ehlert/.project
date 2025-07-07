const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function setupAdmin() {
    try {
        console.log('Setting up admin user...');
        
        // Check if admin already exists
        const [existingAdmins] = await db.promise().query(
            'SELECT id FROM users WHERE role = "admin"'
        );

        if (existingAdmins.length > 0) {
            console.log('Admin user already exists!');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await db.promise().query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@magenta.com', hashedPassword, 'admin']
        );

        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Email: admin@magenta.com');
        console.log('Password: admin123');
        console.log('\nPlease change the password after first login!');

    } catch (error) {
        console.error('Error setting up admin:', error);
    }
}

async function setupSampleData() {
    try {
        console.log('Setting up sample data...');

        // Add sample categories
        const categories = [
            { name: 'Fiction', description: 'Fictional literature and novels' },
            { name: 'Non-Fiction', description: 'Non-fictional books and reference materials' },
            { name: 'Mystery', description: 'Mystery and thriller books' },
            { name: 'Romance', description: 'Romance novels and love stories' },
            { name: 'Science Fiction', description: 'Science fiction and fantasy books' },
            { name: 'Biography', description: 'Biographies and autobiographies' },
            { name: 'History', description: 'Historical books and accounts' },
            { name: 'Self-Help', description: 'Self-help and personal development books' }
        ];

        for (const category of categories) {
            await db.promise().query(
                'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
                [category.name, category.description]
            );
        }

        console.log('Sample categories added!');

        // Add sample publishers
        const publishers = [
            { name: 'Penguin Random House', email: 'info@penguin.com' },
            { name: 'HarperCollins', email: 'info@harpercollins.com' },
            { name: 'Simon & Schuster', email: 'info@simonandschuster.com' },
            { name: 'Macmillan', email: 'info@macmillan.com' }
        ];

        for (const publisher of publishers) {
            await db.promise().query(
                'INSERT IGNORE INTO publishers (name, email) VALUES (?, ?)',
                [publisher.name, publisher.email]
            );
        }

        console.log('Sample publishers added!');

    } catch (error) {
        console.error('Error setting up sample data:', error);
    }
}

async function main() {
    console.log('Starting Magenta Bookstore setup...\n');
    
    await setupAdmin();
    console.log('');
    await setupSampleData();
    
    console.log('\nSetup completed!');
    console.log('You can now start the server with: npm run dev');
    
    process.exit(0);
}

main().catch(console.error); 