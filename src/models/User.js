const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        index: true
    },
    isSubscribed: {
        type: Boolean,
        default: true
    },

    subscriptionDate: {
        type: Date,
        default: Date.now
    },
    lastEmailSent: {
        type: Date
    },
    lastContentId: {
        type: String
    },
    emailCount: {
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

// Index for faster queries
userSchema.index({ isSubscribed: 1, isActive: 1 });

// Virtual for subscription status
userSchema.virtual('status').get(function() {
    if (!this.isActive) return 'inactive';
    if (!this.isSubscribed) return 'unsubscribed';
    return 'active';
});

// Method to mark email as sent
userSchema.methods.markEmailSent = function(contentId) {
    this.lastEmailSent = new Date();
    this.lastContentId = contentId;
    this.emailCount += 1;
    return this.save();
};

// Method to unsubscribe
userSchema.methods.unsubscribe = function() {
    this.isSubscribed = false;
    return this.save();
};

// Method to resubscribe
userSchema.methods.resubscribe = function() {
    this.isSubscribed = true;
    return this.save();
};



module.exports = mongoose.model('User', userSchema); 