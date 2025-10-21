const mongoose = require('mongoose');

const dailyIncomeSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Date is required'],
        unique: true
    },
    totalRevenue: {
        type: Number,
        default: 0,
        min: 0
    },
    totalBills: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCustomers: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentBreakdown: {
        cash: {
            type: Number,
            default: 0,
            min: 0
        },
        card: {
            type: Number,
            default: 0,
            min: 0
        },
        upi: {
            type: Number,
            default: 0,
            min: 0
        },
        online: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    serviceBreakdown: [{
        serviceName: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        },
        revenue: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    employeePerformance: [{
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        appointmentsCompleted: {
            type: Number,
            default: 0,
            min: 0
        },
        revenueGenerated: {
            type: Number,
            default: 0,
            min: 0
        },
        commission: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    expenses: [{
        description: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            enum: ['supplies', 'utilities', 'maintenance', 'salary', 'other'],
            default: 'other'
        }
    }],
    totalExpenses: {
        type: Number,
        default: 0,
        min: 0
    },
    netProfit: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    }
}, {
    timestamps: true
});

// Calculate net profit before saving
dailyIncomeSchema.pre('save', function(next) {
    this.netProfit = this.totalRevenue - this.totalExpenses;
    next();
});

// Index for date-based queries
dailyIncomeSchema.index({ date: -1 });

// Static method to get or create daily income record
dailyIncomeSchema.statics.getOrCreateDaily = async function(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    let dailyRecord = await this.findOne({ date: startOfDay });
    
    if (!dailyRecord) {
        dailyRecord = new this({
            date: startOfDay,
            totalRevenue: 0,
            totalBills: 0,
            totalCustomers: 0
        });
        await dailyRecord.save();
    }
    
    return dailyRecord;
};

module.exports = mongoose.model('DailyIncome', dailyIncomeSchema);