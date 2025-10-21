const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot be more than 200 characters']
    },
    preferences: {
        favoriteServices: [{
            type: String
        }],
        preferredEmployee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        }
    },
    totalVisits: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastVisit: {
        type: Date
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster searches
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text', phone: 'text' });

// Calculate if eligible for free service (5th visit)
customerSchema.methods.isEligibleForFreeService = function() {
    return this.totalVisits > 0 && this.totalVisits % 5 === 0;
};

module.exports = mongoose.model('Customer', customerSchema);