const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        unique: true,
        required: [true, 'Bill number is required']
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Appointment reference is required']
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer reference is required']
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
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
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
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }],
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: 0
    },
    discount: {
        type: {
            type: String,
            enum: ['loyalty', 'promo', 'manual', 'none'],
            default: 'none'
        },
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        reason: String
    },
    tax: {
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        amount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online'],
        required: [true, 'Payment method is required']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'refunded'],
        default: 'paid'
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    changeGiven: {
        type: Number,
        default: 0,
        min: 0
    },
    notes: {
        type: String,
        maxlength: [300, 'Notes cannot be more than 300 characters']
    },
    billingDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate bill number
billingSchema.pre('save', async function(next) {
    if (this.isNew) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Find the last bill of today
        const lastBill = await this.constructor.findOne({
            billNumber: { $regex: `^DS${dateStr}` }
        }).sort({ billNumber: -1 });
        
        let sequenceNumber = 1;
        if (lastBill) {
            const lastSequence = parseInt(lastBill.billNumber.slice(-3));
            sequenceNumber = lastSequence + 1;
        }
        
        this.billNumber = `DS${dateStr}${sequenceNumber.toString().padStart(3, '0')}`;
    }
    next();
});

// Index for better performance
billingSchema.index({ billNumber: 1 });
billingSchema.index({ customer: 1 });
billingSchema.index({ billingDate: -1 });
billingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Billing', billingSchema);