require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const database = require('./config/database');
const openRouterService = require('./services/openRouterService');
const emailService = require('./services/emailService');
const subscriptionService = require('./services/subscriptionService');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));





// Counter to track number of runs
let runCount = 0;

/**
 * Formats a single quiz for console output
 * @param {Object} quiz - The quiz object
 * @param {number} index - The quiz number
 * @returns {string} Formatted quiz string
 */
function formatQuizForConsole(quiz, index) {
    let output = `\nQuestion ${index + 1}: ${quiz.question}\n`;
    output += '\nChoices:\n';
    Object.entries(quiz.choices).forEach(([key, value]) => {
        output += `${key}. ${value}\n`;
    });
    output += `\nCorrect Answer: ${quiz.correct}`;
    output += `\nExplanation: ${quiz.explanation}\n`;
    output += '─'.repeat(80) + '\n';
    return output;
}

/**
 * Main function to generate content and send email to all subscribers
 */
async function sendDailyEmail() {
    try {
        runCount++;
        const content = await openRouterService.generateContent();
        const emailResults = await emailService.sendEmail(content);
        
        if (!emailResults.success) {
            console.error('Daily email process failed');
        }
        
    } catch (error) {
        console.error('\n❌ Error in daily email process:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    }
}

// API Routes

/**
 * @route   POST /api/subscribe
 * @desc    Subscribe a user to daily emails
 * @access  Public
 */
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const result = await subscriptionService.subscribeUser(email);
        
        if (result.success) {
            // Send appropriate email based on subscription type
            try {
                if (result.isNewUser || result.isResubscribe) {
                    await emailService.sendWelcomeEmail(email);
                }
            } catch (emailError) {
                console.error(`Failed to send welcome email to ${email}:`, emailError.message);
                // Don't fail the subscription if email fails
            }
            
            res.status(201).json(result);
        } else {
            res.status(200).json(result);
        }
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/unsubscribe
 * @desc    Unsubscribe a user from daily emails
 * @access  Public
 */
app.post('/api/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const result = await subscriptionService.unsubscribeUser(email);
        
        if (result.success) {
            // Send goodbye email
            try {
                await emailService.sendGoodbyeEmail(email);
            } catch (emailError) {
                console.error(`Failed to send goodbye email to ${email}:`, emailError.message);
                // Don't fail the unsubscription if email fails
            }
        }
        
        res.json(result);
    } catch (error) {
        console.error('Unsubscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/status/:email
 * @desc    Get subscription status for a user
 * @access  Public
 */
app.get('/api/status/:email', (req, res) => {
    try {
        const { email } = req.params;
        const status = subscriptionService.getSubscriptionStatus(email);
        res.json(status);
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});



/**
 * @route   GET /api/statistics
 * @desc    Get subscription statistics (admin endpoint)
 * @access  Public
 */
app.get('/api/statistics', (req, res) => {
    try {
        const stats = subscriptionService.getStatistics();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/test-email
 * @desc    Send a test email to a specific user
 * @access  Public
 */
app.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Generate test content
        const content = await openRouterService.generateContent();
        
        // Send test email
        const result = await emailService.sendSingleEmail(email, content);
        
        res.json({
            success: true,
            message: 'Test email sent successfully',
            data: result
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/delete-user
 * @desc    Completely delete a user from the database (admin endpoint)
 * @access  Public
 */
app.delete('/api/delete-user', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Send goodbye email before deletion
        try {
            await emailService.sendGoodbyeEmail(email);
        } catch (emailError) {
            console.error(`Failed to send goodbye email to ${email}:`, emailError.message);
            // Continue with deletion even if email fails
        }

        const result = await subscriptionService.deleteUser(email);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('User deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /
 * @desc    API documentation and health check endpoint
 * @access  Public
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Daily Network Learning Bot API',
        version: '2.0.0',
        description: 'A RESTful API service for computer networks learning content delivery via email',
        documentation: {
            baseUrl: `http://localhost:${PORT}`,
            endpoints: {
                subscribe: {
                    method: 'POST',
                    path: '/api/subscribe',
                    description: 'Subscribe a user to daily learning emails',
                    body: { email: 'string' }
                },
                unsubscribe: {
                    method: 'POST',
                    path: '/api/unsubscribe',
                    description: 'Unsubscribe a user from daily learning emails',
                    body: { email: 'string' }
                },
                status: {
                    method: 'GET',
                    path: '/api/status/:email',
                    description: 'Check subscription status for a user'
                },

                statistics: {
                    method: 'GET',
                    path: '/api/statistics',
                    description: 'Get subscription statistics'
                },
                testEmail: {
                    method: 'POST',
                    path: '/api/test-email',
                    description: 'Send a test email to verify configuration',
                    body: { email: 'string' }
                },
                deleteUser: {
                    method: 'DELETE',
                    path: '/api/delete-user',
                    description: 'Completely delete a user from the database (sends goodbye email first)',
                    body: { email: 'string' }
                },
                health: {
                    method: 'GET',
                    path: '/api/health',
                    description: 'Detailed health check and system status'
                }
            }
        },
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

/**
 * @route   GET /api/health
 * @desc    Detailed health check and system status
 * @access  Public
 */
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = database.getConnectionStatus();
        const stats = subscriptionService.getStatistics();
        
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: {
                connected: dbStatus.isConnected,
                readyState: dbStatus.readyState,
                host: dbStatus.host,
                port: dbStatus.port,
                name: dbStatus.name
            },
            subscriptions: stats,
            services: {
                openRouter: 'operational',
                email: 'operational',
                cron: 'scheduled'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route   GET /api/content
 * @desc    Generate learning content without sending emails
 * @access  Public
 */
app.get('/api/content', async (req, res) => {
    try {
        const content = await openRouterService.generateContent();
        res.json({
            success: true,
            data: content,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Content generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate content',
            error: error.message
        });
    }
});

// Schedule the daily email using node-cron (8 AM daily)
cron.schedule('0 8 * * *', () => {
    sendDailyEmail();
});

// Initialize database and start server
async function startServer() {
    try {
        // Connect to MongoDB
        await database.connect();
        
        // Initialize subscription service
        await subscriptionService.init();
        
        // Start the server
        app.listen(PORT, () => {
                    console.log(`🚀 CN Learning API server running on port ${PORT}`);
        console.log(`📧 Daily emails scheduled for 8:00 AM`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
async function gracefulShutdown(signal) {
            try {
            await database.disconnect();
            process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); 