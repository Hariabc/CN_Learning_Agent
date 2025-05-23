# Daily Network Learning Bot

A Node.js application that sends daily educational emails about computer networks using the OpenRouter API.

## Features

- 📘 Daily computer network topics
- 📖 Clear explanations (100-150 words)
- 💡 Real-life analogies
- ❓ Quiz questions
- 📧 Automated email delivery at 9 AM daily

## Prerequisites

- Node.js (v14 or higher)
- Gmail account with App Password enabled
- OpenRouter API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # OpenRouter API Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Email Configuration
   EMAIL=your_gmail_address@gmail.com
   APP_PASSWORD=your_gmail_app_password
   RECIPIENT_EMAIL=recipient_email@example.com
   ```

## Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to App Passwords
5. Generate a new app password for "Mail"
6. Use this password in your `.env` file

## Running the Application

Start the application:
```bash
npm start
```

The application will:
1. Run immediately for testing
2. Schedule daily emails at 9 AM
3. Log all activities to the console

## Error Handling

- Failed email attempts are logged to the console
- Content is displayed in the console as a fallback
- All errors are caught and logged

## Dependencies

- dotenv: Environment variable management
- node-cron: Task scheduling
- nodemailer: Email sending
- axios: HTTP requests to OpenRouter API 