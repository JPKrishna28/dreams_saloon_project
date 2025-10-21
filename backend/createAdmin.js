const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('./src/models/Admin');

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            
            // Update password to ensure it's correct
            const hashedPassword = await bcrypt.hash('admin123', 12);
            await Admin.findOneAndUpdate(
                { username: 'admin' },
                { 
                    password: hashedPassword,
                    isActive: true 
                }
            );
            console.log('✅ Admin password updated');
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            const admin = new Admin({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@dreamssaloon.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                permissions: {
                    customers: { read: true, write: true, delete: true },
                    employees: { read: true, write: true, delete: true },
                    appointments: { read: true, write: true, delete: true },
                    billing: { read: true, write: true, delete: true },
                    reports: { read: true, write: true, delete: false }
                },
                isActive: true
            });

            await admin.save();
            console.log('✅ Admin user created successfully');
        }

        // Test authentication
        const admin = await Admin.findOne({ username: 'admin' });
        const isValidPassword = await bcrypt.compare('admin123', admin.password);
        
        console.log('🔐 Password validation test:', isValidPassword ? '✅ PASSED' : '❌ FAILED');
        
        console.log('\n📋 Admin User Details:');
        console.log('Username:', admin.username);
        console.log('Email:', admin.email);
        console.log('Active:', admin.isActive);
        console.log('Role:', admin.role);

        await mongoose.disconnect();
        console.log('\n🎉 Admin setup completed successfully!');
        console.log('🔑 Login credentials: admin / admin123');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();