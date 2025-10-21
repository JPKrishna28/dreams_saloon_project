const express = require('express');
const { body, query } = require('express-validator');
const Billing = require('../models/Billing');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const DailyIncome = require('../models/DailyIncome');
const { authenticateAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all bills with pagination and filters
router.get('/', [
    authenticateAdmin,
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'paid', 'partial', 'refunded']).withMessage('Invalid payment status'),
    query('method').optional().isIn(['cash', 'card', 'upi', 'online']).withMessage('Invalid payment method'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date')
], handleValidationErrors, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Build query
        let query = {};
        
        if (req.query.status) {
            query.paymentStatus = req.query.status;
        }
        
        if (req.query.method) {
            query.paymentMethod = req.query.method;
        }
        
        if (req.query.startDate || req.query.endDate) {
            query.billingDate = {};
            if (req.query.startDate) {
                query.billingDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.billingDate.$lte = new Date(req.query.endDate);
            }
        }

        const bills = await Billing.find(query)
            .populate('customer', 'name phone email')
            .populate('employee', 'name role')
            .populate('appointment', 'appointmentDate appointmentTime status')
            .sort({ billingDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const totalBills = await Billing.countDocuments(query);
        const totalPages = Math.ceil(totalBills / limit);

        res.json({
            success: true,
            data: {
                bills,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalBills,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bills'
        });
    }
});

// Get bill by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const bill = await Billing.findById(req.params.id)
            .populate('customer', 'name phone email totalVisits')
            .populate('employee', 'name role')
            .populate('appointment', 'appointmentDate appointmentTime services status')
            .select('-__v');

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        res.json({
            success: true,
            data: {
                bill
            }
        });
    } catch (error) {
        console.error('Get bill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bill'
        });
    }
});

// Create bill from appointment
router.post('/create/:appointmentId', [
    authenticateAdmin,
    body('paymentMethod').isIn(['cash', 'card', 'upi', 'online']).withMessage('Invalid payment method'),
    body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be a positive number'),
    body('discount.type').optional().isIn(['loyalty', 'promo', 'manual', 'none']).withMessage('Invalid discount type'),
    body('discount.amount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be positive'),
    body('discount.percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
    body('tax.percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax percentage must be between 0 and 100')
], handleValidationErrors, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { paymentMethod, paidAmount, discount = {}, tax = {}, notes } = req.body;

        // Get appointment details
        const appointment = await Appointment.findById(appointmentId)
            .populate('customer')
            .populate('employee');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        if (appointment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only bill completed appointments'
            });
        }

        if (appointment.isBilled) {
            return res.status(400).json({
                success: false,
                message: 'Appointment already billed'
            });
        }

        // Calculate bill amounts
        let subtotal = appointment.totalAmount;
        
        // Apply discount
        let discountAmount = 0;
        if (discount.type && discount.type !== 'none') {
            if (discount.percentage) {
                discountAmount = (subtotal * discount.percentage) / 100;
            } else if (discount.amount) {
                discountAmount = discount.amount;
            }
        }

        // Include existing appointment discount
        if (appointment.discountApplied.type !== 'none') {
            discountAmount += appointment.discountApplied.amount;
        }

        // Calculate tax
        let taxAmount = 0;
        if (tax.percentage) {
            taxAmount = ((subtotal - discountAmount) * tax.percentage) / 100;
        }

        const totalAmount = subtotal - discountAmount + taxAmount;

        // Create bill
        const bill = new Billing({
            appointment: appointment._id,
            customer: appointment.customer._id,
            customerInfo: {
                name: appointment.customerInfo.name,
                phone: appointment.customerInfo.phone
            },
            employee: appointment.employee,
            services: appointment.services,
            subtotal: subtotal,
            discount: {
                type: discount.type || 'none',
                amount: discountAmount,
                percentage: discount.percentage || 0,
                reason: discount.reason || appointment.discountApplied.reason
            },
            tax: {
                percentage: tax.percentage || 0,
                amount: taxAmount
            },
            totalAmount: totalAmount,
            paymentMethod,
            paidAmount,
            changeGiven: paidAmount > totalAmount ? paidAmount - totalAmount : 0,
            paymentStatus: paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending'),
            notes
        });

        await bill.save();

        // Mark appointment as billed
        appointment.isBilled = true;
        await appointment.save();

        // Update daily income
        const billingDate = new Date();
        billingDate.setHours(0, 0, 0, 0);

        let dailyIncome = await DailyIncome.findOne({ date: billingDate });
        if (!dailyIncome) {
            dailyIncome = new DailyIncome({
                date: billingDate,
                totalRevenue: 0,
                totalBills: 0,
                totalCustomers: 0
            });
        }

        // Update daily income stats
        dailyIncome.totalRevenue += totalAmount;
        dailyIncome.totalBills += 1;
        dailyIncome.paymentBreakdown[paymentMethod] += totalAmount;

        // Update service breakdown
        appointment.services.forEach(service => {
            const existingService = dailyIncome.serviceBreakdown.find(s => s.serviceName === service.name);
            if (existingService) {
                existingService.count += 1;
                existingService.revenue += service.price;
            } else {
                dailyIncome.serviceBreakdown.push({
                    serviceName: service.name,
                    count: 1,
                    revenue: service.price
                });
            }
        });

        // Update employee performance
        if (appointment.employee) {
            const existingEmployeePerf = dailyIncome.employeePerformance.find(
                emp => emp.employee.toString() === appointment.employee._id.toString()
            );
            
            const commission = (totalAmount * appointment.employee.commission) / 100;
            
            if (existingEmployeePerf) {
                existingEmployeePerf.appointmentsCompleted += 1;
                existingEmployeePerf.revenueGenerated += totalAmount;
                existingEmployeePerf.commission += commission;
            } else {
                dailyIncome.employeePerformance.push({
                    employee: appointment.employee._id,
                    appointmentsCompleted: 1,
                    revenueGenerated: totalAmount,
                    commission: commission
                });
            }
        }

        await dailyIncome.save();

        // Populate bill for response
        await bill.populate([
            { path: 'customer', select: 'name phone email totalVisits' },
            { path: 'employee', select: 'name role' },
            { path: 'appointment', select: 'appointmentDate appointmentTime services status' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Bill created successfully',
            data: {
                bill
            }
        });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating bill'
        });
    }
});

// Update bill payment
router.put('/:id/payment', [
    authenticateAdmin,
    body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be a positive number'),
    body('paymentMethod').optional().isIn(['cash', 'card', 'upi', 'online']).withMessage('Invalid payment method')
], handleValidationErrors, async (req, res) => {
    try {
        const { paidAmount, paymentMethod, notes } = req.body;

        const bill = await Billing.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        // Update payment details
        const oldPaidAmount = bill.paidAmount;
        bill.paidAmount = paidAmount;
        bill.changeGiven = paidAmount > bill.totalAmount ? paidAmount - bill.totalAmount : 0;
        bill.paymentStatus = paidAmount >= bill.totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');
        
        if (paymentMethod) {
            bill.paymentMethod = paymentMethod;
        }
        
        if (notes) {
            bill.notes = notes;
        }

        await bill.save();

        // Update daily income if payment amount changed
        if (oldPaidAmount !== paidAmount) {
            const billingDate = new Date(bill.billingDate);
            billingDate.setHours(0, 0, 0, 0);

            const dailyIncome = await DailyIncome.findOne({ date: billingDate });
            if (dailyIncome) {
                const amountDifference = paidAmount - oldPaidAmount;
                dailyIncome.totalRevenue += amountDifference;
                dailyIncome.paymentBreakdown[bill.paymentMethod] += amountDifference;
                await dailyIncome.save();
            }
        }

        await bill.populate([
            { path: 'customer', select: 'name phone email' },
            { path: 'employee', select: 'name role' }
        ]);

        res.json({
            success: true,
            message: 'Payment updated successfully',
            data: {
                bill
            }
        });
    } catch (error) {
        console.error('Update bill payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating payment'
        });
    }
});

// Get billing statistics
router.get('/stats/overview', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Set date range (default to current month)
        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Total revenue and bills
        const revenueStats = await Billing.aggregate([
            {
                $match: {
                    billingDate: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalBills: { $sum: 1 },
                    avgBillAmount: { $avg: '$totalAmount' }
                }
            }
        ]);

        // Payment method breakdown
        const paymentBreakdown = await Billing.aggregate([
            {
                $match: {
                    billingDate: { $gte: start, $lte: end },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Daily revenue trend
        const dailyRevenue = await Billing.aggregate([
            {
                $match: {
                    billingDate: { $gte: start, $lte: end },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$billingDate' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    bills: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Service revenue breakdown
        const serviceRevenue = await Billing.aggregate([
            {
                $match: {
                    billingDate: { $gte: start, $lte: end },
                    paymentStatus: 'paid'
                }
            },
            { $unwind: '$services' },
            {
                $group: {
                    _id: '$services.name',
                    count: { $sum: 1 },
                    revenue: { $sum: '$services.price' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // Outstanding payments
        const outstandingPayments = await Billing.aggregate([
            {
                $match: {
                    paymentStatus: { $in: ['pending', 'partial'] }
                }
            },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                period: {
                    startDate: start,
                    endDate: end
                },
                overview: revenueStats[0] || { totalRevenue: 0, totalBills: 0, avgBillAmount: 0 },
                paymentBreakdown,
                dailyRevenue,
                serviceRevenue,
                outstandingPayments
            }
        });
    } catch (error) {
        console.error('Get billing stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching billing statistics'
        });
    }
});

// Get bill receipt (formatted for printing)
router.get('/:id/receipt', async (req, res) => {
    try {
        const bill = await Billing.findById(req.params.id)
            .populate('customer', 'name phone email')
            .populate('employee', 'name role')
            .populate('appointment', 'appointmentDate appointmentTime');

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        // Format receipt data
        const receipt = {
            salonInfo: {
                name: 'Dreams Saloon',
                tagline: 'Barbershop – Hair Cut & Shaves',
                contacts: [
                    'Ramesh: 9963388556',
                    'Rambabu: 9666699201'
                ]
            },
            bill: {
                billNumber: bill.billNumber,
                date: bill.billingDate.toLocaleDateString('en-IN'),
                time: bill.billingDate.toLocaleTimeString('en-IN')
            },
            customer: {
                name: bill.customerInfo.name,
                phone: bill.customerInfo.phone
            },
            appointment: {
                date: bill.appointment?.appointmentDate?.toLocaleDateString('en-IN'),
                time: bill.appointment?.appointmentTime,
                employee: bill.employee?.name || 'Not assigned'
            },
            services: bill.services,
            billing: {
                subtotal: bill.subtotal,
                discount: bill.discount,
                tax: bill.tax,
                totalAmount: bill.totalAmount,
                paidAmount: bill.paidAmount,
                changeGiven: bill.changeGiven,
                paymentMethod: bill.paymentMethod,
                paymentStatus: bill.paymentStatus
            },
            notes: bill.notes
        };

        res.json({
            success: true,
            data: {
                receipt
            }
        });
    } catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching receipt'
        });
    }
});

// Search bills
router.get('/search/:query', [
    authenticateAdmin,
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], handleValidationErrors, async (req, res) => {
    try {
        const { query: searchQuery } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Build search query
        const searchRegex = new RegExp(searchQuery, 'i');
        const query = {
            $or: [
                { billNumber: searchRegex },
                { 'customerInfo.name': searchRegex },
                { 'customerInfo.phone': searchRegex }
            ]
        };

        const bills = await Billing.find(query)
            .populate('customer', 'name phone email')
            .populate('employee', 'name role')
            .sort({ billingDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const totalBills = await Billing.countDocuments(query);

        res.json({
            success: true,
            data: {
                bills,
                searchQuery,
                totalBills,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalBills / limit)
                }
            }
        });
    } catch (error) {
        console.error('Search bills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error searching bills'
        });
    }
});

module.exports = router;