const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer is required']
    },
    customerInfo: {
        name: {
            type: String,
            required: [true, 'Customer name is required']
        },
        phone: {
            type: String,
            required: [true, 'Customer phone is required']
        }
    },
    services: [{
        name: {
            type: String,
            required: [true, 'Service name is required']
        },
        price: {
            type: Number,
            required: [true, 'Service price is required'],
            min: 0
        },
        duration: {
            type: Number, // in minutes
            required: [true, 'Service duration is required'],
            min: 5
        }
    }],
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    appointmentTime: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    discountApplied: {
        type: {
            type: String,
            enum: ['loyalty', 'promo', 'none'],
            default: 'none'
        },
        amount: {
            type: Number,
            default: 0
        },
        reason: String
    },
    notes: {
        customerNotes: String,
        employeeNotes: String,
        adminNotes: String
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    isBilled: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot be more than 500 characters']
    }
}, {
    timestamps: true
});

// Indexes for better performance
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ customer: 1 });
appointmentSchema.index({ employee: 1 });
appointmentSchema.index({ status: 1 });

// Check if appointment slot is available
appointmentSchema.statics.isSlotAvailable = async function(date, time, employeeId, excludeId = null) {
    const query = {
        appointmentDate: new Date(date),
        appointmentTime: time,
        status: { $in: ['pending', 'confirmed', 'in-progress'] }
    };
    
    if (employeeId) {
        query.employee = employeeId;
    }
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existingAppointment = await this.findOne(query);
    return !existingAppointment;
};

module.exports = mongoose.model('Appointment', appointmentSchema);