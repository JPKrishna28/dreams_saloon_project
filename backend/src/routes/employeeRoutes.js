const express = require('express');
const { body, query } = require('express-validator');
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const Appointment = require('../models/Appointment');
const { authenticateAdmin } = require('../middleware/auth');
const { authenticateToken, authorize, adminOnly, managerOrAdmin, staffAccess } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all employees
router.get('/', 
    authenticateToken,
    [
        query('active').optional().isBoolean().withMessage('Active must be true or false'),
        query('role').optional().isIn(['Admin', 'Manager', 'Senior Barber', 'Junior Barber', 'Hair Stylist', 'Trainee', 'Receptionist']).withMessage('Invalid role'),
        query('accessLevel').optional().isIn(['admin', 'manager', 'staff']).withMessage('Invalid access level'),
        query('specialization').optional().isIn(['Hair Cut', 'Beard Trim', 'Shave', 'Hair Styling', 'Hair Wash', 'Facial', 'Massage']).withMessage('Invalid specialization')
    ], 
    handleValidationErrors, 
    async (req, res) => {
    try {
        let query = {};
        
        // Filter by active status
        if (req.query.active !== undefined) {
            query.isActive = req.query.active === 'true';
        }

        // Filter by role
        if (req.query.role) {
            query.role = req.query.role;
        }

        // Filter by access level
        if (req.query.accessLevel) {
            query.accessLevel = req.query.accessLevel;
        }

        // Filter by specialization
        if (req.query.specialization) {
            query.specializations = { $in: [req.query.specialization] };
        }

        const employees = await Employee.find(query)
            .sort({ createdAt: -1 })
            .select('-loginCredentials.password -__v'); // Don't send passwords

        res.json({
            success: true,
            data: employees,
            totalEmployees: employees.length
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employees'
        });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).select('-__v');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Get recent appointments
        const recentAppointments = await Appointment.find({ 
            employee: employee._id,
            appointmentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        })
            .sort({ appointmentDate: -1 })
            .limit(10)
            .populate('customer', 'name phone')
            .select('customer services appointmentDate appointmentTime status totalAmount');

        res.json({
            success: true,
            data: {
                employee,
                recentAppointments
            }
        });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employee'
        });
    }
});

// Create new employee
router.post('/', 
    authenticateToken,
    [
        body('name').trim().notEmpty().withMessage('Employee name is required')
            .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('email').trim().notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please enter a valid email address'),
        body('role').isIn(['Admin', 'Manager', 'Senior Barber', 'Junior Barber', 'Hair Stylist', 'Trainee', 'Receptionist']).withMessage('Invalid role'),
        body('accessLevel').isIn(['admin', 'manager', 'staff']).withMessage('Invalid access level')
    ], 
    handleValidationErrors, 
    async (req, res) => {
    try {
        console.log('POST /employees request body:', req.body);
        console.log('Request headers:', req.headers);
        
        const {
            name,
            phone,
            email,
            role,
            accessLevel,
            specializations,
            experience,
            workingHours,
            workingDays,
            salary,
            commission,
            permissions,
            isLoginEnabled,
            username,
            password
        } = req.body;

        console.log('Creating staff member:', { name, role, accessLevel });

        // Check if employee with phone already exists
        const existingEmployee = await Employee.findOne({ phone });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this phone number already exists'
            });
        }

        // Check if username is unique (if provided)
        if (username) {
            const existingUsername = await Employee.findOne({ 'loginCredentials.username': username });
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
        }

        // Prepare employee data
        const employeeData = {
            name,
            phone,
            email,
            role,
            accessLevel: accessLevel || 'staff',
            specializations: specializations || [],
            experience,
            workingHours,
            workingDays: workingDays || [],
            salary,
            commission,
            permissions: permissions || {
                canManageAppointments: false,
                canManageCustomers: false,
                canManageEmployees: false,
                canManageServices: false,
                canViewReports: false,
                canManageBilling: false,
                canManageFeedback: false,
                canAccessSettings: false
            }
        };

        // Handle login credentials if needed
        if (isLoginEnabled && username && password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            employeeData.loginCredentials = {
                username,
                password: hashedPassword,
                isLoginEnabled: true
            };
        } else {
            employeeData.loginCredentials = {
                isLoginEnabled: false
                // Don't include username if empty to avoid unique constraint issues
            };
        }

        // Create new employee
        console.log('Creating employee with data:', employeeData);
        const employee = new Employee(employeeData);
        await employee.save();

        console.log('Employee saved successfully:', employee._id);

        // Remove password from response
        const responseEmployee = employee.toObject();
        if (responseEmployee.loginCredentials && responseEmployee.loginCredentials.password) {
            delete responseEmployee.loginCredentials.password;
        }

        res.status(201).json({
            success: true,
            message: 'Employee added successfully',
            data: responseEmployee
        });
    } catch (error) {
        console.error('Create employee error:', error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        // Handle duplicate key error (unique constraint)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error creating employee',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update employee
router.put('/:id', [
    body('name').optional().trim().notEmpty().withMessage('Employee name cannot be empty')
        .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),
    body('phone').optional().trim().notEmpty().withMessage('Phone number is required'),
    body('email').optional().isEmail().withMessage('Please enter a valid email address'),
    body('role').optional().isIn(['Admin', 'Manager', 'Senior Barber', 'Junior Barber', 'Hair Stylist', 'Trainee', 'Receptionist']).withMessage('Invalid role'),
    body('accessLevel').optional().isIn(['admin', 'manager', 'staff']).withMessage('Invalid access level')
], handleValidationErrors, async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            role,
            specializations,
            experience,
            workingHours,
            workingDays,
            salary,
            commission,
            isActive
        } = req.body;

        // Check if employee exists
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // If phone is being updated, check for duplicates
        if (phone && phone !== employee.phone) {
            const existingEmployee = await Employee.findOne({ phone, _id: { $ne: req.params.id } });
            if (existingEmployee) {
                return res.status(400).json({
                    success: false,
                    message: 'Another employee with this phone number already exists'
                });
            }
        }

        // Update employee fields
        if (name) employee.name = name;
        if (phone) employee.phone = phone;
        if (email !== undefined) employee.email = email;
        if (role) employee.role = role;
        if (specializations) employee.specializations = specializations;
        if (experience) employee.experience = experience;
        if (workingHours) employee.workingHours = workingHours;
        if (workingDays) employee.workingDays = workingDays;
        if (salary !== undefined) employee.salary = salary;
        if (commission !== undefined) employee.commission = commission;
        if (isActive !== undefined) employee.isActive = isActive;

        await employee.save();

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: {
                employee
            }
        });
    } catch (error) {
        console.error('Update employee error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this phone number already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error updating employee'
        });
    }
});

// Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check if employee has upcoming appointments
        const upcomingAppointments = await Appointment.countDocuments({
            employee: employee._id,
            status: { $in: ['pending', 'confirmed'] },
            appointmentDate: { $gte: new Date() }
        });

        if (upcomingAppointments > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete employee with upcoming appointments'
            });
        }

        // Soft delete by setting isActive to false
        employee.isActive = false;
        await employee.save();

        res.json({
            success: true,
            message: 'Employee deactivated successfully'
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting employee'
        });
    }
});

// Get employee performance stats
router.get('/:id/performance', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Set date range (default to last 30 days)
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Get appointments statistics
        const appointmentStats = await Appointment.aggregate([
            {
                $match: {
                    employee: employee._id,
                    appointmentDate: { $gte: start, $lte: end }
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

        // Get service breakdown
        const serviceBreakdown = await Appointment.aggregate([
            {
                $match: {
                    employee: employee._id,
                    status: 'completed',
                    appointmentDate: { $gte: start, $lte: end }
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
            { $sort: { count: -1 } }
        ]);

        // Calculate total revenue and commission
        const totalRevenue = appointmentStats
            .filter(stat => stat._id === 'completed')
            .reduce((sum, stat) => sum + stat.totalRevenue, 0);

        const commission = (totalRevenue * employee.commission) / 100;

        res.json({
            success: true,
            data: {
                employee: {
                    id: employee._id,
                    name: employee.name,
                    role: employee.role,
                    commission: employee.commission
                },
                period: {
                    startDate: start,
                    endDate: end
                },
                stats: {
                    appointmentStats,
                    serviceBreakdown,
                    totalRevenue,
                    commissionEarned: commission
                }
            }
        });
    } catch (error) {
        console.error('Get employee performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employee performance'
        });
    }
});

// Get available employees for a service
router.get('/available/:serviceName', async (req, res) => {
    try {
        const { serviceName } = req.params;
        const { date, time } = req.query;

        let query = {
            isActive: true,
            specializations: { $in: [serviceName] }
        };

        const employees = await Employee.find(query)
            .select('name role specializations workingHours workingDays')
            .sort({ role: 1, name: 1 });

        // If date and time provided, check availability
        if (date && time) {
            const appointmentDate = new Date(date);
            const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

            const availableEmployees = [];

            for (const employee of employees) {
                // Check if employee works on this day
                if (!employee.workingDays.includes(dayOfWeek)) {
                    continue;
                }

                // Check if appointment time is within working hours
                const [startHour, startMinute] = employee.workingHours.start.split(':').map(Number);
                const [endHour, endMinute] = employee.workingHours.end.split(':').map(Number);
                const [appointmentHour, appointmentMinute] = time.split(':').map(Number);

                const startTime = startHour * 60 + startMinute;
                const endTime = endHour * 60 + endMinute;
                const appointmentTimeMinutes = appointmentHour * 60 + appointmentMinute;

                if (appointmentTimeMinutes < startTime || appointmentTimeMinutes > endTime) {
                    continue;
                }

                // Check if employee has conflicting appointments
                const hasConflict = await Appointment.findOne({
                    employee: employee._id,
                    appointmentDate,
                    appointmentTime: time,
                    status: { $in: ['pending', 'confirmed', 'in-progress'] }
                });

                if (!hasConflict) {
                    availableEmployees.push(employee);
                }
            }

            return res.json({
                success: true,
                data: {
                    employees: availableEmployees,
                    totalAvailable: availableEmployees.length
                }
            });
        }

        res.json({
            success: true,
            data: {
                employees,
                totalEmployees: employees.length
            }
        });
    } catch (error) {
        console.error('Get available employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching available employees'
        });
    }
});

module.exports = router;