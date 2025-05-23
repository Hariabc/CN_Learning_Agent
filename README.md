# Daily Network Learning Bot 🤖

A Node.js application that sends daily educational emails about computer networks using the OpenRouter GPT API. The bot provides comprehensive learning materials, including detailed explanations, key points, real-life analogies, and interactive quizzes.

## 🌟 Features

- **Daily Learning Content**: Receives a new computer networks topic every day
- **Comprehensive Explanations**: 1000-word detailed explanations in point format
- **Interactive Quizzes**: 10 carefully crafted questions per topic
- **Real-life Analogies**: Practical examples to understand complex concepts
- **Key Points**: Quick summary of important concepts
- **Automated Scheduling**: Sends emails at a scheduled time daily

## 📋 Topics Covered

The curriculum covers 30 days of computer networks topics:

1. Introduction to Computer Networks
2. Network Types (PAN, LAN, MAN, WAN)
3. Network Components
4. Network Features
5. Service Primitives
6. Network Architecture
7. OSI Model Overview
8. OSI Physical and Data Link Layers
9. OSI Network and Transport Layers
10. OSI Session, Presentation, and Application Layers
11. TCP/IP Model
12. Physical Layer - Transmission Media
13. Physical Layer - Multiplexing
14. Data Link Layer - Framing and Error Detection
15. Data Link Layer - Error Correction
16. Data Link Layer - Flow Control
17. Data Link Layer - Multiple Access
18. Network Layer - Switching
19. Network Layer - IPv4 Addressing
20. Network Layer - IPv6 and NAT
21. Network Layer - Address Mapping
22. Network Layer - Routing
23. Transport Layer - UDP
24. Transport Layer - TCP
25. Transport Layer - Congestion Control
26. Application Layer - DNS and HTTP
27. Application Layer - Email and Remote Access
28. Application Layer - Network Management
29. Network Security
30. Cryptography

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Gmail account with App Password
- OpenRouter API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Hariabc/CN_Learning_Agent.git
   cd CN_Learning_Agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   EMAIL=your_gmail_address
   APP_PASSWORD=your_gmail_app_password
   RECIPIENT_EMAIL=recipient_email_address
   ```

### Running the Application

1. Start the application:
   ```bash
   npm start
   ```

2. For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📧 Email Format

Each daily email includes:

1. **Title**: The day's topic
2. **Detailed Explanation**: 10 points covering the topic in depth
3. **Key Points**: Quick summary of important concepts
4. **Real-life Analogy**: Practical example to understand the concept
5. **Quiz Questions**: 10 multiple-choice questions with explanations

## 🔧 Configuration

The application can be configured through environment variables:

- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `EMAIL`: Gmail address for sending emails
- `APP_PASSWORD`: Gmail App Password
- `RECIPIENT_EMAIL`: Comma-separated list of email addresses to receive the daily content

## 🛠️ Technologies Used

- Node.js
- OpenRouter GPT API
- Nodemailer
- Node-cron
- Axios

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Made with ❤️ for computer networks education

## Error Handling

- Failed email attempts are logged to the console
- Content is displayed in the console as a fallback
- All errors are caught and logged

## Dependencies

- dotenv: Environment variable management
- node-cron: Task scheduling
- nodemailer: Email sending
- axios: HTTP requests to OpenRouter API

## Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to App Passwords
5. Generate a new app password for "Mail"
6. Use this password in your `.env` file
