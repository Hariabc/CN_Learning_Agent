const axios = require('axios');

/**
 * Service for interacting with OpenRouter API to generate educational content
 */
class OpenRouterService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseURL = 'https://openrouter.ai/api/v1';
        
        // 30-Day Computer Networks Curriculum
        this.topics = [
            // Day 1: Introduction to Computer Networks
            "Day 1: Introduction to Computer Networks - Definition, Purpose, and Basic Concepts",
            
            // Day 2: Network Types
            "Day 2: Network Types - PAN, LAN, MAN, WAN and their Characteristics",
            
            // Day 3: Network Components
            "Day 3: Network Components - Hosts, Routers, Switches, and Hubs",
            
            // Day 4: Network Features
            "Day 4: Network Features - Resource Sharing, Reliability, and Scalability",
            
            // Day 5: Service Primitives
            "Day 5: Service Primitives - Interface Concepts and Implementation",
            
            // Day 6: Network Architecture
            "Day 6: Network Architecture - Client-Server and Peer-to-Peer Models",
            
            // Day 7: OSI Model Overview
            "Day 7: OSI Reference Model - Overview and Layer Functions",
            
            // Day 8: OSI Physical and Data Link Layers
            "Day 8: OSI Model - Physical and Data Link Layers",
            
            // Day 9: OSI Network and Transport Layers
            "Day 9: OSI Model - Network and Transport Layers",
            
            // Day 10: OSI Session, Presentation, and Application Layers
            "Day 10: OSI Model - Session, Presentation, and Application Layers",
            
            // Day 11: TCP/IP Model
            "Day 11: TCP/IP Model - Overview and Comparison with OSI",
            
            // Day 12: Physical Layer - Transmission Media
            "Day 12: Physical Layer - Guided and Unguided Transmission Media",
            
            // Day 13: Physical Layer - Multiplexing
            "Day 13: Physical Layer - FDM, WDM, and TDM Multiplexing",
            
            // Day 14: Data Link Layer - Framing and Error Detection
            "Day 14: Data Link Layer - Framing and Error Detection Methods",
            
            // Day 15: Data Link Layer - Error Correction
            "Day 15: Data Link Layer - Hamming Code and Error Correction",
            
            // Day 16: Data Link Layer - Flow Control
            "Day 16: Data Link Layer - Stop and Wait, Go-Back-N Protocols",
            
            // Day 17: Data Link Layer - Multiple Access
            "Day 17: Data Link Layer - ALOHA, CSMA/CD, and CSMA/CA",
            
            // Day 18: Network Layer - Switching
            "Day 18: Network Layer - Circuit, Message, and Packet Switching",
            
            // Day 19: Network Layer - IPv4 Addressing
            "Day 19: Network Layer - IPv4 Classful and Classless Addressing",
            
            // Day 20: Network Layer - IPv6 and NAT
            "Day 20: Network Layer - IPv6 Addressing and NAT",
            
            // Day 21: Network Layer - Address Mapping
            "Day 21: Network Layer - ARP, RARP, and DHCP",
            
            // Day 22: Network Layer - Routing
            "Day 22: Network Layer - Routing Algorithms and Protocols",
            
            // Day 23: Transport Layer - UDP
            "Day 23: Transport Layer - User Datagram Protocol (UDP)",
            
            // Day 24: Transport Layer - TCP
            "Day 24: Transport Layer - Transmission Control Protocol (TCP)",
            
            // Day 25: Transport Layer - Congestion Control
            "Day 25: Transport Layer - Leaky Bucket and Token Bucket Algorithms",
            
            // Day 26: Application Layer - DNS and HTTP
            "Day 26: Application Layer - Domain Name System and HTTP",
            
            // Day 27: Application Layer - Email and Remote Access
            "Day 27: Application Layer - SMTP, POP3, IMAP, and TELNET",
            
            // Day 28: Application Layer - Network Management
            "Day 28: Application Layer - SNMP and Network Management",
            
            // Day 29: Network Security
            "Day 29: Network Security - Firewalls and Basic Security Concepts",
            
            // Day 30: Cryptography
            "Day 30: Cryptography - Basic Concepts and Authentication Protocols"
        ];
        
        this.currentTopicIndex = 0;
    }

    getNextTopic() {
        const topic = this.topics[this.currentTopicIndex];
        this.currentTopicIndex = (this.currentTopicIndex + 1) % this.topics.length;
        return topic;
    }

    parseQuizString(quizString) {
        try {
            // Extract question
            const questionMatch = quizString.match(/Question:\s*(.*?)(?=\s*Choices:|$)/s);
            if (!questionMatch) return null;
            const question = questionMatch[1].trim();

            // Extract choices
            const choicesMatch = quizString.match(/Choices:\s*((?:[A-D]\.\s*.*?\n?)+)/s);
            if (!choicesMatch) return null;
            const choicesText = choicesMatch[1];
            const choices = {};
            choicesText.split('\n').forEach(line => {
                const match = line.match(/([A-D])\.\s*(.*)/);
                if (match) {
                    const [_, key, value] = match;
                    choices[key] = value.trim();
                }
            });

            // Extract correct answer
            const correctMatch = quizString.match(/Correct:\s*([A-D])/);
            if (!correctMatch) return null;
            const correct = correctMatch[1];

            // Extract explanation
            const explanationMatch = quizString.match(/Explanation:\s*(.*?)(?=\n\s*$|$)/s);
            if (!explanationMatch) return null;
            const explanation = explanationMatch[1].trim();

            return {
                question,
                choices,
                correct,
                explanation
            };
        } catch (error) {
            console.error('Error parsing quiz string:', error);
            return null;
        }
    }

    /**
     * Safely parses JSON string
     * @param {string} jsonString - The JSON string to parse
     * @returns {Object} Parsed JSON object
     */
    safeJsonParse(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.log('Initial JSON parse failed, attempting to clean the string...');
            
            try {
                // First, try to extract the JSON object
                const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No JSON object found in response');
                }

                let cleanedString = jsonMatch[0];
                
                // Fix common formatting issues
                cleanedString = cleanedString
                    .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
                    .replace(/(\w+)(\s*:)/g, '"$1"$2')
                    .replace(/'/g, '"')
                    .replace(/,\s*([}\]])/g, '$1')
                    .replace(/\n/g, ' ')
                    .replace(/\r/g, '')
                    .replace(/\t/g, ' ')
                    .replace(/\s+/g, ' ')
                    .replace(/"\s+"/g, '", "')
                    .replace(/"\s*:\s*"/g, '": "')
                    .replace(/"\s*}\s*"/g, '"}')
                    .replace(/"\s*{\s*"/g, '{"')
                    .replace(/"\s*\[\s*"/g, '["')
                    .replace(/"\s*\]\s*"/g, '"]')
                    .replace(/"\s*,\s*"/g, '", "')
                    .replace(/"\s*:\s*{/g, '": {')
                    .replace(/}\s*,\s*"/g, '}, "')
                    .replace(/"\s*:\s*\[/g, '": [')
                    .replace(/\]\s*,\s*"/g, '], "')
                    .replace(/"\s*:\s*"/g, '": "')
                    .replace(/"\s*:\s*(\d+)/g, '": $1')
                    .replace(/"\s*:\s*(true|false)/g, '": $1')
                    .replace(/"\s*:\s*null/g, '": null');

                // Try to parse the cleaned string
                const parsed = JSON.parse(cleanedString);

                // Handle quizzes that might be in text format
                if (parsed.quizzes) {
                    parsed.quizzes = parsed.quizzes.map(quiz => {
                        if (typeof quiz === 'string') {
                            const parsedQuiz = this.parseQuizString(quiz);
                            if (parsedQuiz) {
                                return parsedQuiz;
                            }
                        }
                        return quiz;
                    }).filter(quiz => quiz !== null);
                }

                return parsed;
            } catch (cleanError) {
                console.error('Failed to clean and parse JSON:', cleanError);
                console.error('Original string:', jsonString);
                
                // Last resort: try to parse the entire response as a quiz
                const quizMatch = jsonString.match(/Question:\s*(.*?)(?=\s*Choices:|$)/s);
                if (quizMatch) {
                    console.log('Attempting to parse response as a single quiz...');
                    const parsedQuiz = this.parseQuizString(jsonString);
                    if (parsedQuiz) {
                        return {
                            title: "Computer Networks Quiz",
                            explanation: "A quiz about computer networks",
                            keyPoints: ["Understanding different types of computer networks"],
                            analogy: "Computer networks are like a city's transportation system",
                            quizzes: [parsedQuiz]
                        };
                    }
                }
                
                throw new Error('Failed to parse JSON response');
            }
        }
    }

    validateContent(content) {
        if (!content || typeof content !== 'object') {
            throw new Error('Invalid content: not an object');
        }

        const requiredFields = ['title', 'explanation', 'keyPoints', 'analogy', 'quizzes'];
        for (const field of requiredFields) {
            if (!content[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (!Array.isArray(content.quizzes)) {
            throw new Error('Quizzes must be an array');
        }

        if (content.quizzes.length !== 10) {
            console.warn(`Received ${content.quizzes.length} quizzes instead of 10`);
        }

        content.quizzes.forEach((quiz, index) => {
            if (!quiz.question || !quiz.choices || !quiz.correct || !quiz.explanation) {
                throw new Error(`Invalid quiz structure at index ${index}`);
            }

            const requiredChoices = ['A', 'B', 'C', 'D'];
            for (const choice of requiredChoices) {
                if (!quiz.choices[choice]) {
                    throw new Error(`Missing choice ${choice} in quiz ${index + 1}`);
                }
            }

            if (!['A', 'B', 'C', 'D'].includes(quiz.correct)) {
                throw new Error(`Invalid correct answer in quiz ${index + 1}`);
            }
        });

        return true;
    }

    /**
     * Generates educational content about computer networks
     * @returns {Promise<Object>} Generated content with title, explanation, analogy, and quizzes
     */
    async generateContent() {
        try {
            const topic = this.getNextTopic();
            console.log('Generating content for topic:', topic);
            
            const prompt = `You are a computer networks expert. Generate educational content for "${topic}" in valid JSON format. The response must be a single JSON object with the following structure:

{
    "title": "string (the daily topic title)",
    "explanation": "string (200 words covering key concepts, examples, and practical applications)",
    "keyPoints": [
        "string (bullet point 1)",
        "string (bullet point 2)",
        "string (bullet point 3)",
        "string (bullet point 4)",
        "string (bullet point 5)"
    ],
    "analogy": "string (real-life analogy to explain the concept)",
    "quizzes": [
        {
            "question": "string (related question about the topic)",
            "choices": {
                "A": "string (choice A)",
                "B": "string (choice B)",
                "C": "string (choice C)",
                "D": "string (choice D)"
            },
            "correct": "A/B/C/D",
            "explanation": "string (detailed explanation)"
        }
    ]
}

Important:
1. The response must be valid JSON
2. All strings must be properly escaped
3. Include exactly 1 quiz
4. The quiz must have 4 choices (A, B, C, D)
5. The correct answer must be one of A, B, C, or D
6. Include at least 5 key points
7. The explanation should be approximately 200 words
8. Focus specifically on ${topic}`;

            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: "mistralai/mistral-7b-instruct",
                    messages: [
                        {
                            role: "system",
                            content: "You are a computer networks expert. Always respond with valid JSON."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': 'https://github.com/yourusername/daily-network-email',
                        'X-Title': 'Daily Network Learning Bot',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Received response from OpenRouter API');
            
            const contentString = response.data.choices[0].message.content;
            console.log('Raw content:', contentString);

            const content = this.safeJsonParse(contentString);
            this.validateContent(content);

            console.log('Successfully parsed content:', {
                title: content.title,
                explanationLength: content.explanation.length,
                keyPointsCount: content.keyPoints.length,
                analogyLength: content.analogy.length,
                quizCount: content.quizzes.length
            });

            return content;
        } catch (error) {
            console.error('Error generating content:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }
}

module.exports = new OpenRouterService(); 