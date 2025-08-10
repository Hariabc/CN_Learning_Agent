const User = require('../models/User');

class SubscriptionService {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        try {
            this.isInitialized = true;
    
        } catch (error) {
            console.error('❌ Failed to initialize subscription service:', error.message);
            throw error;
        }
    }

    async subscribeUser(email) {
        try {
            // Check if user already exists
            let user = await User.findOne({ email: email.toLowerCase() });
            
            if (user) {
                if (user.isSubscribed) {
                    return {
                        success: false,
                        message: 'User is already subscribed',
                        user: user
                    };
                } else {
                    // Resubscribe existing user
                    user.isSubscribed = true;
                    user.isActive = true;
                    user.subscriptionDate = new Date();
                    await user.save();
                    
                    return {
                        success: true,
                        message: 'User resubscribed successfully',
                        user: user,
                        isResubscribe: true
                    };
                }
            }

            // Create new user
            user = new User({
                email: email.toLowerCase()
            });

            await user.save();

            return {
                success: true,
                message: 'User subscribed successfully',
                user: user,
                isNewUser: true
            };
        } catch (error) {
            console.error(`❌ Error subscribing user ${email}:`, error.message);
            throw error;
        }
    }

    async unsubscribeUser(email) {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            if (!user.isSubscribed) {
                return {
                    success: false,
                    message: 'User is already unsubscribed'
                };
            }

            // Mark as unsubscribed
            user.isSubscribed = false;
            await user.save();

            return {
                success: true,
                message: 'User unsubscribed successfully',
                user: user
            };
        } catch (error) {
            console.error(`❌ Error unsubscribing user ${email}:`, error.message);
            throw error;
        }
    }

    async getSubscriptionStatus(email) {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                    status: 'not_found'
                };
            }

            return {
                success: true,
                message: 'User status retrieved successfully',
                user: user,
                status: user.status
            };
        } catch (error) {
            console.error(`❌ Error getting subscription status for ${email}:`, error.message);
            throw error;
        }
    }

    async getActiveSubscriptions() {
        try {
            const users = await User.find({ 
                isSubscribed: true, 
                isActive: true 
            }).select('email preferences subscriptionDate lastEmailSent emailCount');
            
            return users;
        } catch (error) {
            console.error('❌ Error getting active subscriptions:', error.message);
            throw error;
        }
    }



    async markEmailSent(email, contentId) {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                await user.markEmailSent(contentId);
            }
        } catch (error) {
            console.error(`❌ Error marking email sent for ${email}:`, error.message);
        }
    }

    async getStatistics() {
        try {
            const totalUsers = await User.countDocuments();
            const activeSubscribers = await User.countDocuments({ isSubscribed: true, isActive: true });
            const unsubscribedUsers = await User.countDocuments({ isSubscribed: false });
            const inactiveUsers = await User.countDocuments({ isActive: false });

            // Get recent subscriptions (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentSubscriptions = await User.countDocuments({
                subscriptionDate: { $gte: thirtyDaysAgo }
            });

            // Get total emails sent
            const totalEmailsSent = await User.aggregate([
                { $group: { _id: null, total: { $sum: '$emailCount' } } }
            ]);

            return {
                totalUsers,
                activeSubscribers,
                unsubscribedUsers,
                inactiveUsers,
                recentSubscriptions,
                totalEmailsSent: totalEmailsSent[0]?.total || 0
            };
        } catch (error) {
            console.error('❌ Error getting statistics:', error.message);
            throw error;
        }
    }

    async deleteUser(email) {
        try {
            // Delete user completely from MongoDB
            const result = await User.deleteOne({ email: email.toLowerCase() });
            
            if (result.deletedCount > 0) {
                return {
                    success: true,
                    message: 'User deleted successfully from database'
                };
            } else {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
        } catch (error) {
            console.error(`❌ Error deleting user ${email}:`, error.message);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const users = await User.find({}).select('-__v');
            return users;
        } catch (error) {
            console.error('❌ Error getting all users:', error.message);
            throw error;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

module.exports = new SubscriptionService(); 