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
        console.log(`\n=== Starting Run #${runCount} ===`);
        console.log('Time:', new Date().toLocaleString());
        
        console.log('\nStep 1: Generating content...');
        const content = await openRouterService.generateContent();
        console.log('Content generated successfully');
        
        console.log('\nStep 2: Preparing to send email...');
        console.log('Recipient:', process.env.RECIPIENT_EMAIL);
        
        console.log('\nStep 3: Sending email...');
        await emailService.sendEmail(content);
        
        // Fallback console output
        console.log('\n=== Daily Network Learning Content ===');
        console.log(`📘 Title: ${content.title}`);
        console.log(`\n📖 Detailed Explanation:\n${content.explanation}`);
        console.log(`\n💡 Real-life Analogy:\n${content.analogy}`);
        console.log('\n❓ Daily Quiz Questions:');
        content.quizzes.forEach((quiz, index) => {
            console.log(formatQuizForConsole(quiz, index));
        });
        
        console.log('\n=== Process Completed Successfully ===');
    } catch (error) {
        console.error('\n❌ Error in daily email process:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    }
}

// Schedule the task to run every minute
cron.schedule('0 8 * * *', () => {
    console.log('\n🕗 Running scheduled task at 8 AM...');
    sendDailyEmail();
});

// Initial run for testing
console.log('\n🚀 Starting Daily Network Learning Bot...');
sendDailyEmail(); 