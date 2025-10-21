const express = require('express');
const { body, query } = require('express-validator');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const { authenticateAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Service pricing configuration
const servicePricing = {
    'Hair Cut': { price: 150, duration: 30 },
    'Beard Trim': { price: 80, duration: 20 },
    'Shave': { price: 100, duration: 25 },
    'Hair Styling': { price: 200, duration: 45 },
    'Hair Wash': { price: 50, duration: 15 },
    'Facial': { price: 300, duration: 60 },
    'Massage': { price: 250, duration: 45 },
    'Complete Grooming': { price: 500, duration: 90 }
};

// Get all appointments with filters and pagination
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('employee').optional().isMongoId().withMessage('Invalid employee ID'),
    query('customer').optional().isMongoId().withMessage('Invalid customer ID')
], handleValidationErrors, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Build query
        let query = {};
        
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        if (req.query.date) {
            const date = new Date(req.query.date);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            query.appointmentDate = { $gte: date, $lt: nextDay };
        }
        
        if (req.query.employee) {
            query.employee = req.query.employee;
        }
        
        if (req.query.customer) {
            query.customer = req.query.customer;
        }

        const appointments = await Appointment.find(query)
            .populate('customer', 'name phone email')
            .populate('employee', 'name role specializations')
            .sort({ appointmentDate: -1, appointmentTime: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const totalAppointments = await Appointment.countDocuments(query);
        const totalPages = Math.ceil(totalAppointments / limit);

        res.json({
            success: true,
            data: {
                appointments,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalAppointments,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching appointments'
        });
    }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('customer', 'name phone email totalVisits')
            .populate('employee', 'name role specializations')
            .select('-__v');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: {
                appointment
            }
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching appointment'
        });
    }
});

// Create new appointment
router.post('/', [
    body('customerInfo.name').trim().notEmpty().withMessage('Customer name is required'),
    body('customerInfo.phone').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian mobile number'),
    body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
    body('services.*.name').isIn(Object.keys(servicePricing)).withMessage('Invalid service name'),
    body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
    body('appointmentTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please enter time in HH:MM format'),
    body('employee').optional().isMongoId().withMessage('Invalid employee ID')
], handleValidationErrors, async (req, res) => {
    try {
        const { customerInfo, services, appointmentDate, appointmentTime, employee, notes } = req.body;

        // Find or create customer
        let customer = await Customer.findOne({ phone: customerInfo.phone });
        if (!customer) {
            customer = new Customer({
                name: customerInfo.name,
                phone: customerInfo.phone,
                email: customerInfo.email
            });
            await customer.save();
        }

        // Calculate total amount and prepare services with pricing
        let totalAmount = 0;
        const processedServices = services.map(service => {
            const serviceInfo = servicePricing[service.name];
            if (!serviceInfo) {
                throw new Error(`Invalid service: ${service.name}`);
            }
            totalAmount += serviceInfo.price;
            return {
                name: service.name,
                price: serviceInfo.price,
                duration: serviceInfo.duration
            };
        });

        // Check if slot is available
        const isSlotAvailable = await Appointment.isSlotAvailable(
            appointmentDate,
            appointmentTime,
            employee
        );

        if (!isSlotAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Selected time slot is not available'
            });
        }

        // Check if customer is eligible for discount (5th visit free)
        let discountApplied = { type: 'none', amount: 0 };
        if (customer.totalVisits > 0 && (customer.totalVisits + 1) % 5 === 0) {
            // Find cheapest service for discount
            const cheapestService = processedServices.reduce((min, service) => 
                service.price < min.price ? service : min
            );
            
            discountApplied = {
                type: 'loyalty',
                amount: cheapestService.price,
                reason: '5th visit free - cheapest service'
            };
            totalAmount -= cheapestService.price;
        }

        // Create appointment
        const appointment = new Appointment({
            customer: customer._id,
            customerInfo: {
                name: customerInfo.name,
                phone: customerInfo.phone
            },
            services: processedServices,
            employee: employee || null,
            appointmentDate: new Date(appointmentDate),
            appointmentTime,
            totalAmount,
            discountApplied,
            notes: notes || {}
        });

        await appointment.save();

        // Populate the appointment for response
        await appointment.populate([
            { path: 'customer', select: 'name phone email totalVisits' },
            { path: 'employee', select: 'name role specializations' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: {
                appointment,
                discountApplied: discountApplied.type !== 'none'
            }
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating appointment'
        });
    }
});

// Update appointment
router.put('/:id', [
    body('customerInfo.name').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
    body('customerInfo.phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian mobile number'),
    body('services').optional().isArray({ min: 1 }).withMessage('At least one service is required'),
    body('services.*.name').optional().isIn(Object.keys(servicePricing)).withMessage('Invalid service name'),
    body('appointmentDate').optional().isISO8601().withMessage('Valid appointment date is required'),
    body('appointmentTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please enter time in HH:MM format'),
    body('status').optional().isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
    body('employee').optional().isMongoId().withMessage('Invalid employee ID')
], handleValidationErrors, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        const { customerInfo, services, appointmentDate, appointmentTime, status, employee, notes, rating, feedback } = req.body;

        // If time or date is being updated, check availability
        if ((appointmentDate || appointmentTime) && status !== 'cancelled') {
            const newDate = appointmentDate || appointment.appointmentDate;
            const newTime = appointmentTime || appointment.appointmentTime;
            const newEmployee = employee !== undefined ? employee : appointment.employee;

            const isSlotAvailable = await Appointment.isSlotAvailable(
                newDate,
                newTime,
                newEmployee,
                appointment._id
            );

            if (!isSlotAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected time slot is not available'
                });
            }
        }

        // Update appointment fields
        if (customerInfo) {
            appointment.customerInfo = { ...appointment.customerInfo, ...customerInfo };
        }

        if (services) {
            let totalAmount = 0;
            const processedServices = services.map(service => {
                const serviceInfo = servicePricing[service.name];
                totalAmount += serviceInfo.price;
                return {
                    name: service.name,
                    price: serviceInfo.price,
                    duration: serviceInfo.duration
                };
            });
            
            appointment.services = processedServices;
            appointment.totalAmount = totalAmount - appointment.discountApplied.amount;
        }

        if (appointmentDate) appointment.appointmentDate = new Date(appointmentDate);
        if (appointmentTime) appointment.appointmentTime = appointmentTime;
        if (status) appointment.status = status;
        if (employee !== undefined) appointment.employee = employee;
        if (notes) appointment.notes = { ...appointment.notes, ...notes };
        if (rating) appointment.rating = rating;
        if (feedback) appointment.feedback = feedback;

        // If completing appointment, update customer stats
        if (status === 'completed' && appointment.status !== 'completed') {
            const customer = await Customer.findById(appointment.customer);
            if (customer) {
                customer.totalVisits += 1;
                customer.totalSpent += appointment.totalAmount;
                customer.lastVisit = new Date();
                
                // Add loyalty points (1 point per 10 rupees)
                customer.loyaltyPoints += Math.floor(appointment.totalAmount / 10);
                
                await customer.save();
            }

            // Update employee performance
            if (appointment.employee) {
                const employeeDoc = await Employee.findById(appointment.employee);
                if (employeeDoc) {
                    employeeDoc.performance.totalAppointments += 1;
                    await employeeDoc.save();
                }
            }
        }

        await appointment.save();

        // Populate for response
        await appointment.populate([
            { path: 'customer', select: 'name phone email totalVisits' },
            { path: 'employee', select: 'name role specializations' }
        ]);

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: {
                appointment
            }
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating appointment'
        });
    }
});

// Delete appointment
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Only allow deletion if appointment is not completed or billed
        if (appointment.status === 'completed' && appointment.isBilled) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete completed and billed appointment'
            });
        }

        await Appointment.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting appointment'
        });
    }
});

// Get available time slots for a date
router.get('/available-slots/:date', [
    query('employee').optional().isMongoId().withMessage('Invalid employee ID'),
    query('service').optional().isIn(Object.keys(servicePricing)).withMessage('Invalid service name')
], handleValidationErrors, async (req, res) => {
    try {
        const { date } = req.params;
        const { employee: employeeId, service } = req.query;

        const appointmentDate = new Date(date);
        const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

        // Get available employees for the service
        let availableEmployees = [];
        if (service) {
            availableEmployees = await Employee.find({
                isActive: true,
                specializations: { $in: [service] },
                workingDays: { $in: [dayOfWeek] },
                ...(employeeId && { _id: employeeId })
            });
        } else {
            availableEmployees = await Employee.find({
                isActive: true,
                workingDays: { $in: [dayOfWeek] },
                ...(employeeId && { _id: employeeId })
            });
        }

        if (availableEmployees.length === 0) {
            return res.json({
                success: true,
                data: {
                    availableSlots: [],
                    message: 'No employees available for selected date and service'
                }
            });
        }

        // Generate time slots (30-minute intervals from 9 AM to 8 PM)
        const slots = [];
        const startHour = 9;
        const endHour = 20;

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                // Check if any employee is available at this time
                const availableAtSlot = [];
                
                for (const employee of availableEmployees) {
                    // Check working hours
                    const [startWorkHour, startWorkMinute] = employee.workingHours.start.split(':').map(Number);
                    const [endWorkHour, endWorkMinute] = employee.workingHours.end.split(':').map(Number);
                    
                    const slotMinutes = hour * 60 + minute;
                    const startWorkMinutes = startWorkHour * 60 + startWorkMinute;
                    const endWorkMinutes = endWorkHour * 60 + endWorkMinute;
                    
                    if (slotMinutes >= startWorkMinutes && slotMinutes < endWorkMinutes) {
                        // Check if employee has appointment at this time
                        const hasAppointment = await Appointment.findOne({
                            employee: employee._id,
                            appointmentDate,
                            appointmentTime: timeSlot,
                            status: { $in: ['pending', 'confirmed', 'in-progress'] }
                        });
                        
                        if (!hasAppointment) {
                            availableAtSlot.push({
                                employeeId: employee._id,
                                employeeName: employee.name,
                                employeeRole: employee.role
                            });
                        }
                    }
                }
                
                if (availableAtSlot.length > 0) {
                    slots.push({
                        time: timeSlot,
                        availableEmployees: availableAtSlot
                    });
                }
            }
        }

        res.json({
            success: true,
            data: {
                date: appointmentDate,
                dayOfWeek,
                availableSlots: slots,
                totalSlots: slots.length
            }
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching available slots'
        });
    }
});

// Get appointments dashboard stats
router.get('/stats/dashboard', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Today's appointments
        const todayAppointments = await Appointment.aggregate([
            {
                $match: {
                    appointmentDate: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // This week's stats
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const weekStats = await Appointment.aggregate([
            {
                $match: {
                    appointmentDate: { $gte: weekStart },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Most popular services
        const popularServices = await Appointment.aggregate([
            {
                $match: {
                    status: 'completed',
                    appointmentDate: { $gte: weekStart }
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
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            data: {
                today: {
                    date: today,
                    appointments: todayAppointments,
                    totalAppointments: todayAppointments.reduce((sum, stat) => sum + stat.count, 0)
                },
                thisWeek: {
                    weekStart,
                    stats: weekStats[0] || { totalAppointments: 0, totalRevenue: 0 }
                },
                popularServices
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching dashboard stats'
        });
    }
});

// Get service pricing
router.get('/services/pricing', (req, res) => {
    res.json({
        success: true,
        data: {
            services: servicePricing
        }
    });
});

module.exports = router;