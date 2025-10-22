const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Service name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Service price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number,
        required: [true, 'Service duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
        max: [480, 'Duration cannot exceed 8 hours']
    },
    category: {
        type: String,
        required: [true, 'Service category is required'],
        enum: {
            values: ['Hair Care', 'Beard Care', 'Skin Care', 'Styling', 'Complete Package'],
            message: 'Invalid category'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: null
    },
    requirements: [{
        type: String,
        trim: true
    }],
    benefits: [{
        type: String,
        trim: true
    }],
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: [1000, 'Special instructions cannot exceed 1000 characters']
    },
    popularityScore: {
        type: Number,
        default: 0,
        min: 0
    },
    totalBookings: {
        type: Number,
        default: 0,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true
});

// Index for search functionality
serviceSchema.index({ 
    name: 'text', 
    description: 'text', 
    tags: 'text' 
});

// Index for category and active status
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ duration: 1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
    return `₹${this.price}`;
});

// Virtual for formatted duration
serviceSchema.virtual('formattedDuration').get(function() {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    
    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${minutes}m`;
    }
});

// Method to update popularity based on bookings
serviceSchema.methods.updatePopularity = function() {
    this.popularityScore = this.totalBookings * 0.7 + this.averageRating * 0.3;
    return this.save();
};

// Static method to get popular services
serviceSchema.statics.getPopularServices = function(limit = 5) {
    return this.find({ isActive: true })
        .sort({ popularityScore: -1 })
        .limit(limit);
};

// Static method to get services by category
serviceSchema.statics.getByCategory = function(category) {
    return this.find({ category, isActive: true })
        .sort({ price: 1 });
};

// Pre-save middleware to ensure name is properly formatted
serviceSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        // Capitalize first letter of each word
        this.name = this.name.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
    next();
});

module.exports = mongoose.model('Service', serviceSchema);