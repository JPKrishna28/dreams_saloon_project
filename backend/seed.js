const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('./src/models/Admin');
const Employee = require('./src/models/Employee');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create default admin user
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const admin = new Admin({
        username: 'admin',
        password: 'admin123', // Will be hashed by pre-save middleware
        name: 'Dreams Saloon Admin',
        email: 'admin@dreamssaloon.com',
        phone: '9963388556',
        role: 'admin',
        permissions: {
          canManageCustomers: true,
          canManageAppointments: true,
          canManageEmployees: true,
          canManageBilling: true,
          canViewReports: true,
          canManageSettings: true
        }
      });
      
      await admin.save();
      console.log('✅ Default admin user created: admin/admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create sample employees
    const employeeData = [
      {
        name: 'Ramesh Kumar',
        phone: '9963388556',
        email: 'ramesh@dreamssaloon.com',
        role: 'Senior Barber',
        specializations: ['Hair Cut', 'Beard Trim', 'Shave', 'Hair Styling'],
        experience: { years: 8, description: 'Expert in traditional and modern hair styling' },
        workingHours: { start: '09:00', end: '18:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        salary: 25000,
        commission: 15
      },
      {
        name: 'Rambabu Singh',
        phone: '9666699201',
        email: 'rambabu@dreamssaloon.com',
        role: 'Senior Barber',
        specializations: ['Hair Cut', 'Beard Trim', 'Facial', 'Massage'],
        experience: { years: 6, description: 'Specialist in grooming and facial treatments' },
        workingHours: { start: '10:00', end: '19:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        salary: 22000,
        commission: 12
      },
      {
        name: 'Suresh Patel',
        phone: '9876543210',
        email: 'suresh@dreamssaloon.com',
        role: 'Junior Barber',
        specializations: ['Hair Cut', 'Hair Wash', 'Beard Trim'],
        experience: { years: 3, description: 'Growing expertise in basic grooming services' },
        workingHours: { start: '09:30', end: '18:30' },
        workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        salary: 18000,
        commission: 10
      }
    ];

    for (const empData of employeeData) {
      const existingEmployee = await Employee.findOne({ phone: empData.phone });
      if (!existingEmployee) {
        const employee = new Employee(empData);
        await employee.save();
        console.log(`✅ Employee created: ${empData.name}`);
      } else {
        console.log(`ℹ️ Employee already exists: ${empData.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n🏪 Sample Employees Added:');
    console.log('- Ramesh Kumar (Senior Barber) - 9963388556');
    console.log('- Rambabu Singh (Senior Barber) - 9666699201');
    console.log('- Suresh Patel (Junior Barber) - 9876543210');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();