const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');
        const [result] = await db.promise().query('SELECT 1 as test');
        console.log('✅ Database connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function createTestUsers() {
    try {
        console.log('\nCreating test users...');
        
        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await db.promise().query(
            'INSERT IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@magenta.com', adminPassword, 'admin']
        );
        console.log('✅ Admin user created/verified');

        // Create test customer user
        const customerPassword = await bcrypt.hash('password123', 10);
        await db.promise().query(
            'INSERT IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['testuser', 'user@magenta.com', customerPassword, 'customer']
        );
        
        // Get the customer user ID
        const [users] = await db.promise().query(
            'SELECT id FROM users WHERE email = ?',
            ['user@magenta.com']
        );
        
        if (users.length > 0) {
            // Create customer profile
            await db.promise().query(
                'INSERT IGNORE INTO customers (user_id, first_name, last_name) VALUES (?, ?, ?)',
                [users[0].id, 'Test', 'User']
            );
        }
        
        console.log('✅ Test customer user created/verified');
        
        return true;
    } catch (error) {
        console.error('❌ Error creating test users:', error.message);
        return false;
    }
}

async function createSampleCategories() {
    try {
        console.log('\nCreating sample categories...');
        
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
        
        console.log('✅ Sample categories created/verified');
        return true;
    } catch (error) {
        console.error('❌ Error creating categories:', error.message);
        return false;
    }
}

async function main() {
    console.log('🧪 Testing Magenta Bookstore Backend Setup\n');
    
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
        console.log('\n❌ Setup failed. Please check your database configuration.');
        process.exit(1);
    }
    
    // Create test users
    const usersCreated = await createTestUsers();
    if (!usersCreated) {
        console.log('\n❌ Failed to create test users.');
        process.exit(1);
    }
    
    // Create sample categories
    const categoriesCreated = await createSampleCategories();
    if (!categoriesCreated) {
        console.log('\n❌ Failed to create sample categories.');
        process.exit(1);
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Admin Login:                            │');
    console.log('│   Username: admin                       │');
    console.log('│   Email: admin@magenta.com              │');
    console.log('│   Password: admin123                    │');
    console.log('│                                         │');
    console.log('│ Customer Login:                         │');
    console.log('│   Email: user@magenta.com               │');
    console.log('│   Password: password123                 │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Open the frontend in your browser');
    console.log('3. Test login at: pages/login.html');
    console.log('4. Test admin panel at: pages/admin-login.html');
    
    process.exit(0);
}

main().catch(console.error); 