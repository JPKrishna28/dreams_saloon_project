const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const Admin = require('../models/Admin');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register admin (for initial setup)
router.post('/register', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Please enter a valid email')
], handleValidationErrors, async (req, res) => {
    try {
        const { username, password, name, email, phone } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this username already exists'
            });
        }

        // Create new admin
        const admin = new Admin({
            username,
            password,
            name,
            email,
            phone
        });

        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Login admin
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ username, isActive: true });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await admin.updateLastLogin();

        // Generate JWT token
        const token = jwt.sign(
            { userId: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions,
                    lastLogin: admin.lastLogin
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get current admin profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.userId).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone,
                    role: admin.role,
                    permissions: admin.permissions,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    }
});

// Update admin profile
router.put('/profile', [
    authenticateToken,
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian mobile number')
], handleValidationErrors, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        const admin = await Admin.findById(req.user.userId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Update fields
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;

        await admin.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone,
                    role: admin.role
                }
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
});

// Change password
router.put('/change-password', [
    authenticateToken,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], handleValidationErrors, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const admin = await Admin.findById(req.user.userId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: {
                userId: req.user.userId,
                username: req.user.username,
                role: req.user.role
            }
        }
    });
});

module.exports = router;