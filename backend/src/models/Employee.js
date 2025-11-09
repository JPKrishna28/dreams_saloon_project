const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Employee name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        validate: {
            validator: function(v) {
                // Accept various phone formats: 10-11 digits, can start with 0-9
                return /^\d{10,11}$/.test(v);
            },
            message: 'Please enter a valid phone number (10-11 digits)'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['Admin', 'Manager', 'Senior Barber', 'Junior Barber', 'Hair Stylist', 'Trainee', 'Receptionist'],
        default: 'Junior Barber'
    },
    // Admin/Staff specific fields
    accessLevel: {
        type: String,
        enum: ['admin', 'manager', 'staff'],
        default: 'staff'
    },
    permissions: {
        canManageAppointments: { type: Boolean, default: false },
        canManageCustomers: { type: Boolean, default: false },
        canManageEmployees: { type: Boolean, default: false },
        canManageServices: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: false },
        canManageBilling: { type: Boolean, default: false },
        canManageFeedback: { type: Boolean, default: false },
        canAccessSettings: { type: Boolean, default: false }
    },
    specializations: [{
        type: String,
        enum: ['Hair Cut', 'Beard Trim', 'Shave', 'Hair Styling', 'Hair Wash', 'Facial', 'Massage']
    }],
    experience: {
        years: {
            type: Number,
            min: 0,
            max: 50
        },
        description: String
    },
    workingHours: {
        start: {
            type: String,
            default: '09:00'
        },
        end: {
            type: String,
            default: '18:00'
        }
    },
    workingDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    salary: {
        type: Number,
        min: 0
    },
    commission: {
        type: Number,
        min: 0,
        max: 100,
        default: 10 // percentage
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    profileImage: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    performance: {
        totalAppointments: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        reviews: [{
            customer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Customer'
            },
            rating: Number,
            comment: String,
            date: {
                type: Date,
                default: Date.now
            }
        }]
    }
}, {
    timestamps: true
});

// Index for searches
employeeSchema.index({ name: 'text' });
employeeSchema.index({ specializations: 1 });

module.exports = mongoose.model('Employee', employeeSchema);