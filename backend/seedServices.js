const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Service = require('./src/models/Service');

const defaultServices = [
    {
        name: 'Classic Hair Cut',
        description: 'Professional haircut with consultation, wash, cut, and styling. Perfect for maintaining your regular look with precision and style.',
        price: 150,
        duration: 30,
        category: 'Hair Care',
        requirements: ['Hair should be clean', 'Bring reference photo if desired'],
        benefits: ['Professional styling', 'Personalized consultation', 'Modern techniques'],
        tags: ['haircut', 'styling', 'popular', 'classic'],
        specialInstructions: 'Please arrive 5 minutes early for consultation',
        isActive: true
    },
    {
        name: 'Premium Hair Cut & Styling',
        description: 'Luxurious hair cutting experience with premium products, detailed styling, and finishing touches for special occasions.',
        price: 250,
        duration: 45,
        category: 'Hair Care',
        requirements: ['Hair consultation required', 'Book in advance for special events'],
        benefits: ['Premium products', 'Detailed styling', 'Photo session ready', 'Lifetime touch-up tips'],
        tags: ['premium', 'styling', 'special', 'luxury'],
        specialInstructions: 'Includes complimentary hair wash and conditioning treatment',
        isActive: true
    },
    {
        name: 'Beard Trim & Shape',
        description: 'Expert beard trimming and shaping to enhance your facial features. Includes beard oil treatment and styling.',
        price: 80,
        duration: 20,
        category: 'Beard Care',
        requirements: ['Beard should be at least 1 week growth'],
        benefits: ['Professional shaping', 'Beard oil treatment', 'Styling tips'],
        tags: ['beard', 'trim', 'grooming', 'quick'],
        specialInstructions: 'We use premium beard oils and balms',
        isActive: true
    },
    {
        name: 'Traditional Wet Shave',
        description: 'Authentic wet shaving experience with hot towels, premium shaving cream, and precision blade work.',
        price: 120,
        duration: 25,
        category: 'Beard Care',
        requirements: ['No recent shaving (minimum 2 days growth)', 'Skin sensitivity check'],
        benefits: ['Hot towel treatment', 'Premium products', 'Smooth finish', 'Relaxing experience'],
        tags: ['shave', 'traditional', 'luxury', 'relaxing'],
        specialInstructions: 'Includes pre-shave oil and aftershave balm application',
        isActive: true
    },
    {
        name: 'Hair Wash & Conditioning',
        description: 'Refreshing hair wash service with deep conditioning treatment using premium products.',
        price: 50,
        duration: 15,
        category: 'Hair Care',
        requirements: [],
        benefits: ['Deep cleansing', 'Conditioning treatment', 'Scalp massage'],
        tags: ['wash', 'conditioning', 'quick', 'refreshing'],
        specialInstructions: 'Includes scalp massage and towel dry',
        isActive: true
    },
    {
        name: 'Facial Treatment',
        description: 'Professional facial treatment for men including cleansing, exfoliation, and moisturizing for healthy skin.',
        price: 300,
        duration: 60,
        category: 'Skin Care',
        requirements: ['Skin consultation required', 'No recent sun exposure'],
        benefits: ['Deep cleansing', 'Blackhead removal', 'Moisturizing', 'Anti-aging treatment'],
        tags: ['facial', 'skincare', 'cleansing', 'relaxing'],
        specialInstructions: 'Includes steam treatment and face mask',
        isActive: true
    },
    {
        name: 'Head & Shoulder Massage',
        description: 'Relaxing massage therapy focusing on head, neck, and shoulder areas to relieve stress and tension.',
        price: 200,
        duration: 30,
        category: 'Skin Care',
        requirements: ['No recent injuries in massage areas'],
        benefits: ['Stress relief', 'Improved circulation', 'Relaxation', 'Tension release'],
        tags: ['massage', 'relaxation', 'therapy', 'wellness'],
        specialInstructions: 'Uses aromatic oils for enhanced relaxation',
        isActive: true
    },
    {
        name: 'Complete Grooming Package',
        description: 'Comprehensive grooming experience including haircut, beard trim, shave, facial, and styling - the ultimate men\'s package.',
        price: 500,
        duration: 90,
        category: 'Complete Package',
        requirements: ['Book appointment in advance', 'Allow sufficient time'],
        benefits: ['Complete transformation', 'All services included', 'Premium products', 'Styling consultation'],
        tags: ['package', 'complete', 'premium', 'transformation'],
        specialInstructions: 'Includes consultation, all treatments, and styling tips for maintenance',
        isActive: true
    },
    {
        name: 'Hair Styling for Events',
        description: 'Special occasion hair styling for weddings, parties, or business events. Includes consultation and trial if needed.',
        price: 350,
        duration: 60,
        category: 'Styling',
        requirements: ['Book 1 week in advance', 'Bring reference photos', 'Trial session recommended'],
        benefits: ['Event-specific styling', 'Long-lasting hold', 'Photo-ready finish', 'Touch-up tips'],
        tags: ['events', 'wedding', 'styling', 'special'],
        specialInstructions: 'Includes hair products for maintaining the style throughout the event',
        isActive: true
    },
    {
        name: 'Mustache Trim & Style',
        description: 'Precise mustache trimming and styling to complement your facial features and personal style.',
        price: 60,
        duration: 15,
        category: 'Beard Care',
        requirements: ['Sufficient mustache growth'],
        benefits: ['Precision trimming', 'Style consultation', 'Wax application'],
        tags: ['mustache', 'trim', 'styling', 'quick'],
        specialInstructions: 'Includes mustache wax application for hold',
        isActive: true
    }
];

const seedServices = async () => {
    try {
        console.log('🌱 Starting service seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing services (optional - remove this if you want to keep existing services)
        await Service.deleteMany({});
        console.log('🗑️ Cleared existing services');

        // Insert default services
        const createdServices = await Service.insertMany(defaultServices);
        console.log(`✅ Created ${createdServices.length} default services`);

        // Display created services
        console.log('\n📋 Services Created:');
        createdServices.forEach((service, index) => {
            console.log(`${index + 1}. ${service.name} - ₹${service.price} (${service.duration}min)`);
        });

        // Get service statistics
        const serviceStats = await Service.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        console.log('\n📊 Service Statistics by Category:');
        serviceStats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} services (Avg: ₹${Math.round(stat.averagePrice)})`);
        });

        console.log('\n🎉 Service seeding completed successfully!');
        console.log('\n🔗 Available API Endpoints:');
        console.log('GET    /api/services - Get all services');
        console.log('POST   /api/services - Create new service (Admin only)');
        console.log('PUT    /api/services/:id - Update service (Admin only)');
        console.log('DELETE /api/services/:id - Delete service (Admin only)');
        console.log('PATCH  /api/services/:id/toggle-status - Toggle active status (Admin only)');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error seeding services:', error);
        process.exit(1);
    }
};

seedServices();