const express = require('express');
const { body, query } = require('express-validator');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const { authenticateAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all customers with pagination and search
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long'),
    query('sortBy').optional().isIn(['name', 'totalVisits', 'totalSpent', 'lastVisit', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], handleValidationErrors, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get customers with pagination
        const customers = await Customer.find(searchQuery)
            .sort({ [sortBy]: sortOrder })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('preferences.preferredEmployee', 'name role')
            .select('-__v');

        // Get total count for pagination
        const totalCustomers = await Customer.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCustomers / limit);

        res.json({
            success: true,
            data: {
                customers,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCustomers,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching customers'
        });
    }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('preferences.preferredEmployee', 'name role specializations')
            .select('-__v');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get customer's recent appointments
        const recentAppointments = await Appointment.find({ customer: customer._id })
            .sort({ appointmentDate: -1 })
            .limit(5)
            .populate('employee', 'name role')
            .select('services appointmentDate appointmentTime status totalAmount');

        res.json({
            success: true,
            data: {
                customer,
                recentAppointments
            }
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching customer'
        });
    }
});

// Create new customer
router.post('/', [
    body('name').trim().notEmpty().withMessage('Customer name is required')
        .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian mobile number'),
    body('email').optional().isEmail().withMessage('Please enter a valid email address'),
    body('dateOfBirth').optional().isISO8601().withMessage('Please enter a valid date'),
    body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot be more than 200 characters')
], handleValidationErrors, async (req, res) => {
    try {
        const { name, phone, email, dateOfBirth, address, preferences } = req.body;

        // Check if customer with phone already exists
        const existingCustomer = await Customer.findOne({ phone });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this phone number already exists'
            });
        }

        // Create new customer
        const customer = new Customer({
            name,
            phone,
            email,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            address,
            preferences: preferences || {}
        });

        await customer.save();

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: {
                customer
            }
        });
    } catch (error) {
        console.error('Create customer error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this phone number already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error creating customer'
        });
    }
});

// Update customer
router.put('/:id', [
    body('name').optional().trim().notEmpty().withMessage('Customer name cannot be empty')
        .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian mobile number'),
    body('email').optional().isEmail().withMessage('Please enter a valid email address'),
    body('dateOfBirth').optional().isISO8601().withMessage('Please enter a valid date'),
    body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot be more than 200 characters')
], handleValidationErrors, async (req, res) => {
    try {
        const { name, phone, email, dateOfBirth, address, preferences } = req.body;

        // Check if customer exists
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // If phone is being updated, check for duplicates
        if (phone && phone !== customer.phone) {
            const existingCustomer = await Customer.findOne({ phone, _id: { $ne: req.params.id } });
            if (existingCustomer) {
                return res.status(400).json({
                    success: false,
                    message: 'Another customer with this phone number already exists'
                });
            }
        }

        // Update customer fields
        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (email !== undefined) customer.email = email;
        if (dateOfBirth) customer.dateOfBirth = new Date(dateOfBirth);
        if (address !== undefined) customer.address = address;
        if (preferences) customer.preferences = { ...customer.preferences, ...preferences };

        await customer.save();

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: {
                customer
            }
        });
    } catch (error) {
        console.error('Update customer error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this phone number already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error updating customer'
        });
    }
});

// Delete customer (soft delete - deactivate)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Check if customer has pending appointments
        const pendingAppointments = await Appointment.countDocuments({
            customer: customer._id,
            status: { $in: ['pending', 'confirmed'] },
            appointmentDate: { $gte: new Date() }
        });

        if (pendingAppointments > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete customer with pending appointments'
            });
        }

        // Soft delete by setting isActive to false
        customer.isActive = false;
        await customer.save();

        res.json({
            success: true,
            message: 'Customer deactivated successfully'
        });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting customer'
        });
    }
});

// Get customer statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get appointment statistics
        const appointmentStats = await Appointment.aggregate([
            { $match: { customer: customer._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Get service preferences
        const serviceStats = await Appointment.aggregate([
            { $match: { customer: customer._id, status: 'completed' } },
            { $unwind: '$services' },
            {
                $group: {
                    _id: '$services.name',
                    count: { $sum: 1 },
                    totalSpent: { $sum: '$services.price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                customer: {
                    id: customer._id,
                    name: customer.name,
                    totalVisits: customer.totalVisits,
                    totalSpent: customer.totalSpent,
                    loyaltyPoints: customer.loyaltyPoints,
                    isEligibleForFreeService: customer.isEligibleForFreeService()
                },
                appointmentStats,
                serviceStats
            }
        });
    } catch (error) {
        console.error('Get customer stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching customer statistics'
        });
    }
});

module.exports = router;