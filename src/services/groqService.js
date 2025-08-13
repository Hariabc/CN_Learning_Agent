const axios = require('axios');

/**
 * Service for interacting with Groq Cloud API to generate educational content
 */
class GroqService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.baseURL = 'https://api.groq.com/openai/v1';
        
        if (!this.apiKey) {
            console.warn('⚠️ GROQ_API_KEY environment variable is not set');
        }
        
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
                
                // Ensure choices are strings and not empty
                if (typeof quiz.choices[choice] !== 'string' || quiz.choices[choice].trim() === '') {
                    console.warn(`Invalid choice ${choice} in quiz ${index + 1}: "${quiz.choices[choice]}". Setting to default.`);
                    quiz.choices[choice] = `Choice ${choice}`;
                }
            }

            // Clean and validate the correct answer
            let cleanedCorrect = '';
            if (quiz.correct) {
                const correctStr = String(quiz.correct).trim();
                
                // First, try to extract a valid choice letter
                if (['A', 'B', 'C', 'D'].includes(correctStr.toUpperCase())) {
                    cleanedCorrect = correctStr.toUpperCase();
                } else if (correctStr.match(/^[A-D]/i)) {
                    cleanedCorrect = correctStr.charAt(0).toUpperCase();
                } else if (correctStr.includes('A') || correctStr.includes('B') || correctStr.includes('C') || correctStr.includes('D')) {
                    // Try to find the first valid choice mentioned
                    const choiceMatch = correctStr.match(/[A-D]/i);
                    if (choiceMatch) {
                        cleanedCorrect = choiceMatch[0].toUpperCase();
                    }
                }
                
                // If still no valid choice, try to match the answer text with choices
                if (!cleanedCorrect && quiz.choices) {
                    const answerText = correctStr.toLowerCase();
                    for (const [choice, choiceText] of Object.entries(quiz.choices)) {
                        if (choiceText.toLowerCase().includes(answerText) || answerText.includes(choiceText.toLowerCase())) {
                            cleanedCorrect = choice;
                            break;
                        }
                    }
                }
            }
            
            if (!['A', 'B', 'C', 'D'].includes(cleanedCorrect)) {
                console.warn(`Invalid correct answer in quiz ${index + 1}: "${quiz.correct}". Attempting to determine correct answer from choices...`);
                
                // Try to intelligently determine the correct answer by looking at the choices
                if (quiz.choices) {
                    // Look for common patterns that might indicate the correct answer
                    const answerText = String(quiz.correct).toLowerCase();
                    let bestMatch = null;
                    let bestScore = 0;
                    
                    for (const [choice, choiceText] of Object.entries(quiz.choices)) {
                        const choiceLower = choiceText.toLowerCase();
                        let score = 0;
                        
                        // Check if the answer text contains key words from the choice
                        if (answerText.includes(choiceLower) || choiceLower.includes(answerText)) {
                            score += 3;
                        }
                        
                        // Check for partial matches
                        const answerWords = answerText.split(/\s+/);
                        const choiceWords = choiceLower.split(/\s+/);
                        const commonWords = answerWords.filter(word => choiceWords.includes(word));
                        score += commonWords.length;
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = choice;
                        }
                    }
                    
                    if (bestMatch && bestScore > 0) {
                        cleanedCorrect = bestMatch;
                        console.log(`   Determined correct answer: ${bestMatch} (score: ${bestScore})`);
                    } else {
                        cleanedCorrect = 'A'; // Fallback to default
                        console.log(`   Could not determine correct answer, using default: A`);
                    }
                } else {
                    cleanedCorrect = 'A'; // Fallback to default
                }
            }
            
            // Update the quiz object with the cleaned correct answer
            quiz.correct = cleanedCorrect;
        });

        return true;
    }

    /**
     * Creates fallback content when AI generation fails
     * @param {string} topic - The topic to create content for
     * @returns {Object} Fallback content structure
     */
    createFallbackContent(topic) {
        console.log('Creating fallback content for topic:', topic);
        
        return {
            title: topic,
            explanation: [
                "Computer networks are systems of interconnected computing devices that can exchange data and share resources.",
                "They enable communication between devices through various protocols and technologies.",
                "Networks can be classified by size, topology, and transmission medium.",
                "The OSI model provides a framework for understanding network communication.",
                "Network security is crucial for protecting data and maintaining privacy.",
                "Different network types serve different purposes and have varying characteristics.",
                "Protocols define rules for data transmission and communication.",
                "Network performance depends on factors like bandwidth, latency, and reliability.",
                "Modern networks support various applications and services.",
                "Understanding network fundamentals is essential for IT professionals."
            ],
            keyPoints: [
                "Networks enable device communication and resource sharing",
                "Different network types serve different purposes",
                "Protocols define communication rules",
                "Security is essential for network protection",
                "Performance depends on multiple factors"
            ],
            analogy: "Computer networks are like a city's transportation system - they connect different locations, have various routes, and enable the movement of information (like people and goods) between destinations.",
            quizzes: [
                {
                    question: "What is the primary purpose of computer networks?",
                    choices: {
                        "A": "To share resources and enable communication",
                        "B": "To store large amounts of data",
                        "C": "To process complex calculations",
                        "D": "To display graphics and images"
                    },
                    correct: "A",
                    explanation: "Computer networks primarily exist to share resources and enable communication between devices."
                },
                {
                    question: "Which network type covers the smallest geographical area?",
                    choices: {
                        "A": "WAN (Wide Area Network)",
                        "B": "MAN (Metropolitan Area Network)",
                        "C": "LAN (Local Area Network)",
                        "D": "PAN (Personal Area Network)"
                    },
                    correct: "D",
                    explanation: "PAN covers the smallest area, typically within a few meters of a person."
                },
                {
                    question: "What does OSI stand for in networking?",
                    choices: {
                        "A": "Open Systems Interconnection",
                        "B": "Operating System Interface",
                        "C": "Online Security Implementation",
                        "D": "Open Source Initiative"
                    },
                    correct: "A",
                    explanation: "OSI stands for Open Systems Interconnection, which is a conceptual model for network communication."
                },
                {
                    question: "Which layer of the OSI model handles physical connections?",
                    choices: {
                        "A": "Application Layer",
                        "B": "Transport Layer",
                        "C": "Network Layer",
                        "D": "Physical Layer"
                    },
                    correct: "D",
                    explanation: "The Physical Layer (Layer 1) handles the actual physical connections and transmission of raw bits."
                },
                {
                    question: "What protocol is commonly used for web browsing?",
                    choices: {
                        "A": "FTP",
                        "B": "HTTP",
                        "C": "SMTP",
                        "D": "SSH"
                    },
                    correct: "B",
                    explanation: "HTTP (Hypertext Transfer Protocol) is the standard protocol for web browsing and data transfer."
                },
                {
                    question: "Which network device operates at the Data Link layer?",
                    choices: {
                        "A": "Router",
                        "B": "Switch",
                        "C": "Hub",
                        "D": "Gateway"
                    },
                    correct: "B",
                    explanation: "Switches operate at the Data Link layer (Layer 2) and make forwarding decisions based on MAC addresses."
                },
                {
                    question: "What is the purpose of a firewall in networking?",
                    choices: {
                        "A": "To speed up network connections",
                        "B": "To protect against unauthorized access",
                        "C": "To increase bandwidth",
                        "D": "To reduce network latency"
                    },
                    correct: "B",
                    explanation: "Firewalls are security devices that protect networks by controlling incoming and outgoing traffic."
                },
                {
                    question: "Which addressing scheme is used by IPv4?",
                    choices: {
                        "A": "32-bit addresses",
                        "B": "64-bit addresses",
                        "C": "128-bit addresses",
                        "D": "256-bit addresses"
                    },
                    correct: "A",
                    explanation: "IPv4 uses 32-bit addresses, typically written as four octets separated by dots."
                },
                {
                    question: "What does TCP stand for?",
                    choices: {
                        "A": "Transmission Control Protocol",
                        "B": "Transfer Control Protocol",
                        "C": "Transport Control Protocol",
                        "D": "Transmission Connection Protocol"
                    },
                    correct: "A",
                    explanation: "TCP stands for Transmission Control Protocol, which provides reliable, ordered data delivery."
                },
                {
                    question: "Which network topology connects all devices to a central point?",
                    choices: {
                        "A": "Bus topology",
                        "B": "Ring topology",
                        "C": "Star topology",
                        "D": "Mesh topology"
                    },
                    correct: "C",
                    explanation: "Star topology connects all devices to a central hub or switch, making it easy to manage and troubleshoot."
                }
            ]
        };
    }

    /**
     * Generates educational content about computer networks
     * @returns {Promise<Object>} Generated content with title, explanation, analogy, and quizzes
     */
    async generateContent() {
        try {
            const topic = this.getNextTopic();
            
            const prompt = `You are a computer networks expert. Generate educational content for "${topic}" in valid JSON format. 
Respond with a single JSON object, and do not include any text outside the JSON object. 
Do not repeat any keys. Do not include empty objects. Do not include comments. 
The response must be a single JSON object with the following structure:

{
    "title": "string (the daily topic title)",
    "explanation": [
        "string (point 1)",
        "string (point 2)",
        "string (point 3)",
        "string (point 4)",
        "string (point 5)",
        "string (point 6)",
        "string (point 7)",
        "string (point 8)",
        "string (point 9)",
        "string (point 10)"
    ],
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
            "correct": "A",
            "explanation": "string (detailed explanation)"
        }
    ]
}

CRITICAL FORMAT REQUIREMENTS:
1. The response must be valid JSON
2. All strings must be properly escaped
3. Include exactly 10 quizzes
4. Each quiz must have 4 choices (A, B, C, D)
5. The "correct" field MUST contain ONLY a single letter: "A", "B", "C", or "D"
6. DO NOT put the answer text in the "correct" field
7. DO NOT put explanations in the "correct" field
8. DO NOT put "Correct Answer:" or similar text in the "correct" field
9. The "correct" field should look like this: "correct": "A" (not "correct": "A. Satellite" or "correct": "Satellite")
10. Include at least 5 key points
11. The explanation should be in points format with approximately 1000 words total (10 points, ~100 words each)
12. Focus specifically on ${topic}
13. Each quiz should test different aspects of the topic
14. Make the explanation comprehensive and detailed, covering all important aspects of the topic
15. Adhere strictly to the JSON structure provided, especially for the "quizzes" array and the format of each quiz object.
16. Do not include any text, comments, or explanations outside the JSON object.

EXAMPLE OF CORRECT QUIZ FORMAT:
{
    "question": "What is the primary purpose of computer networks?",
    "choices": {
        "A": "To share resources and enable communication",
        "B": "To store large amounts of data",
        "C": "To process complex calculations",
        "D": "To display graphics and images"
    },
    "correct": "A",
    "explanation": "Computer networks primarily exist to share resources and enable communication between devices."
}

Notice that the "correct" field contains ONLY the letter "A", not the full answer text.`;

            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: "llama3-8b-8192",
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
                        'Content-Type': 'application/json'
                    }
                }
            );

            const contentString = response.data.choices[0].message.content;
            let content;
            
            try {
                content = this.safeJsonParse(contentString);
                this.validateContent(content);
            } catch (validationError) {
                console.error('Content validation failed:', validationError.message);
                console.error('Attempting to fix content...');
                
                // Try to create a fallback content structure
                content = this.createFallbackContent(topic);
            }

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

module.exports = new GroqService(); 