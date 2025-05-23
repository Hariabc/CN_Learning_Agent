require('dotenv').config();
const cron = require('node-cron');
const openRouterService = require('./services/openRouterService');
const emailService = require('./services/emailService');

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
console.log('EMAIL exists:', !!process.env.EMAIL);
console.log('APP_PASSWORD exists:', !!process.env.APP_PASSWORD);
console.log('RECIPIENT_EMAIL exists:', !!process.env.RECIPIENT_EMAIL);

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
 * Main function to generate content and send email
 */
async function sendDailyEmail() {
    try {
        runCount++;
        
        
        
        const content = await openRouterService.generateContent();
        
        
        
        await emailService.sendEmail(content);
        
        // Fallback console output
        console.log('\n✅ Daily email process completed successfully');
        
        
        
        
        
        
        
        
    } catch (error) {
        console.error('\n❌ Error in daily email process:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    }
}

// Schedule the daily email using node-cron
cron.schedule('0 8 * * *', () => {
    
    sendDailyEmail();
});

// Run the function immediately when the script starts

sendDailyEmail(); 