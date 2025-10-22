const express = require('express');
const { body, query, param } = require('express-validator');
const Service = require('../models/Service');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules for service
const serviceValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Service name is required')
        .isLength({ max: 100 })
        .withMessage('Service name cannot exceed 100 characters'),
    
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Service description is required')
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('duration')
        .isInt({ min: 1, max: 480 })
        .withMessage('Duration must be between 1 and 480 minutes'),
    
    body('category')
        .isIn(['Hair Care', 'Beard Care', 'Skin Care', 'Styling', 'Complete Package'])
        .withMessage('Invalid category'),
    
    body('requirements')
        .optional()
        .isArray()
        .withMessage('Requirements must be an array'),
    
    body('benefits')
        .optional()
        .isArray()
        .withMessage('Benefits must be an array'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    
    body('specialInstructions')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Special instructions cannot exceed 1000 characters'),
    
    handleValidationErrors
];

// Get all services with filters and pagination
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isIn(['Hair Care', 'Beard Care', 'Skin Care', 'Styling', 'Complete Package']).withMessage('Invalid category'),
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
], handleValidationErrors, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        
        if (req.query.category) {
            query.category = req.query.category;
        }
        
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }
        
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
        }
        
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { tags: { $in: [new RegExp(req.query.search, 'i')] } }
            ];
        }

        const services = await Service.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalServices = await Service.countDocuments(query);
        const totalPages = Math.ceil(totalServices / limit);

        res.json({
            success: true,
            data: {
                services,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalServices,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching services'
        });
    }
});

// Get service by ID
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid service ID'),
    handleValidationErrors
], async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            data: { service }
        });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching service'
        });
    }
});

// Create new service (Admin only)
router.post('/', authenticateAdmin, serviceValidation, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            duration,
            category,
            requirements = [],
            benefits = [],
            tags = [],
            specialInstructions,
            image
        } = req.body;

        // Check if service with same name already exists
        const existingService = await Service.findOne({ 
            name: new RegExp(`^${name}$`, 'i') 
        });

        if (existingService) {
            return res.status(400).json({
                success: false,
                message: 'Service with this name already exists'
            });
        }

        const service = new Service({
            name,
            description,
            price,
            duration,
            category,
            requirements,
            benefits,
            tags,
            specialInstructions,
            image,
            isActive: true
        });

        await service.save();

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: { service }
        });
    } catch (error) {
        console.error('Create service error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Service with this name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating service'
        });
    }
});

// Update service (Admin only)
router.put('/:id', [
    param('id').isMongoId().withMessage('Invalid service ID'),
    ...serviceValidation.slice(0, -1), // Exclude handleValidationErrors
    handleValidationErrors
], authenticateAdmin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if updating name and if it conflicts with existing service
        if (req.body.name && req.body.name !== service.name) {
            const existingService = await Service.findOne({
                name: new RegExp(`^${req.body.name}$`, 'i'),
                _id: { $ne: service._id }
            });

            if (existingService) {
                return res.status(400).json({
                    success: false,
                    message: 'Service with this name already exists'
                });
            }
        }

        // Update service fields
        const allowedUpdates = [
            'name', 'description', 'price', 'duration', 'category',
            'requirements', 'benefits', 'tags', 'specialInstructions', 
            'image', 'isActive'
        ];

        allowedUpdates.forEach(field => {
            if (req.body.hasOwnProperty(field)) {
                service[field] = req.body[field];
            }
        });

        await service.save();

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: { service }
        });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating service'
        });
    }
});

// Toggle service active status (Admin only)
router.patch('/:id/toggle-status', [
    param('id').isMongoId().withMessage('Invalid service ID'),
    handleValidationErrors
], authenticateAdmin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        service.isActive = !service.isActive;
        await service.save();

        res.json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { service }
        });
    } catch (error) {
        console.error('Toggle service status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating service status'
        });
    }
});

// Delete service (Admin only)
router.delete('/:id', [
    param('id').isMongoId().withMessage('Invalid service ID'),
    handleValidationErrors
], authenticateAdmin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Note: In production, you might want to check if service is used in any appointments
        // before allowing deletion

        await Service.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting service'
        });
    }
});

// Get popular services
router.get('/analytics/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const popularServices = await Service.getPopularServices(limit);

        res.json({
            success: true,
            data: { popularServices }
        });
    } catch (error) {
        console.error('Get popular services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching popular services'
        });
    }
});

// Get services by category
router.get('/category/:category', [
    param('category').isIn(['Hair Care', 'Beard Care', 'Skin Care', 'Styling', 'Complete Package']).withMessage('Invalid category'),
    handleValidationErrors
], async (req, res) => {
    try {
        const services = await Service.getByCategory(req.params.category);

        res.json({
            success: true,
            data: { services }
        });
    } catch (error) {
        console.error('Get services by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching services by category'
        });
    }
});

// Get service statistics
router.get('/analytics/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalServices = await Service.countDocuments();
        const activeServices = await Service.countDocuments({ isActive: true });
        const inactiveServices = totalServices - activeServices;
        
        const servicesByCategory = await Service.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' },
                    averageDuration: { $avg: '$duration' }
                }
            }
        ]);

        const priceStats = await Service.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalServices,
                activeServices,
                inactiveServices,
                servicesByCategory,
                priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, averagePrice: 0 }
            }
        });
    } catch (error) {
        console.error('Get service statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching service statistics'
        });
    }
});

module.exports = router;