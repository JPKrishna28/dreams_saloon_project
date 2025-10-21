const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [50, 'Username cannot be more than 50 characters']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin', 'owner']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: {
        canManageCustomers: {
            type: Boolean,
            default: true
        },
        canManageAppointments: {
            type: Boolean,
            default: true
        },
        canManageEmployees: {
            type: Boolean,
            default: true
        },
        canManageBilling: {
            type: Boolean,
            default: true
        },
        canViewReports: {
            type: Boolean,
            default: true
        },
        canManageSettings: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
adminSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

module.exports = mongoose.model('Admin', adminSchema);