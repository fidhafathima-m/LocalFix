"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const axios_1 = __importDefault(require("axios"));
class ChatService {
    constructor(logger) {
        this._apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this._rateLimitExceeded = false;
        this._lastRateLimitCheck = 0;
        this._logger = logger;
        this._apiKey = process.env.OPENROUTER_API_KEY || '';
    }
    async sendMessage(userMessage, conversationHistory = [], context) {
        this._logger.info('=== CHAT SERVICE CALLED ===', {
            userMessage,
            historyLength: conversationHistory.length,
        });
        if (!this.shouldUseRealAI() || this._rateLimitExceeded) {
            this._logger.warn('USING FALLBACK - Rate limit or invalid API key');
            return this.getEnhancedFallback(userMessage, conversationHistory);
        }
        this._logger.info('ATTEMPTING REAL AI REQUEST');
        // Use WORKING free models
        const availableModels = [
            'google/gemma-3-4b-it:free',
            'meta-llama/llama-3.2-3b-instruct:free',
            'mistralai/mistral-7b-instruct:free',
            'qwen/qwen3-4b:free',
            'google/gemma-3n-e2b-it:free',
        ];
        const messages = this.buildMessages(userMessage, conversationHistory, context);
        // Try each model with better error handling
        for (const model of availableModels) {
            try {
                this._logger.info(`Trying model: ${model}`);
                const requestBody = {
                    model: model,
                    messages: messages,
                    max_tokens: 500,
                    temperature: 0.7,
                    stream: false,
                };
                const response = await axios_1.default.post(this._apiUrl, requestBody, {
                    headers: {
                        Authorization: `Bearer ${this._apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
                        'X-Title': 'LocalFix',
                    },
                    timeout: 30000,
                });
                const aiResponse = response.data.choices[0].message.content;
                this._logger.info('✅ REAL AI SUCCESS!', {
                    model: model,
                    response: aiResponse.substring(0, 100) + '...',
                });
                // Reset rate limit flag on success
                this._rateLimitExceeded = false;
                return {
                    message: aiResponse,
                    usage: response.data.usage,
                    isRealAI: true,
                };
            }
            catch (error) {
                // Check if it's a rate limit error
                if (error.response?.status === 429) {
                    this._logger.warn('RATE LIMIT HIT - Switching to fallback mode');
                    this._rateLimitExceeded = true;
                    this._lastRateLimitCheck = Date.now();
                    break; // Don't try other models if rate limited
                }
                this._logger.warn(`Model ${model} failed`, {
                    error: error.message,
                    status: error.response?.status,
                });
                continue;
            }
        }
        // All models failed or rate limited
        this._logger.error('AI REQUEST FAILED - Using enhanced fallback');
        return this.getEnhancedFallback(userMessage, conversationHistory);
    }
    buildMessages(userMessage, conversationHistory, context) {
        const messages = [];
        // Add system message
        messages.push({
            role: 'system',
            content: this.getSystemPrompt(context),
        });
        // Add conversation history (limit to last 6 messages to save tokens)
        const recentHistory = conversationHistory.slice(-6);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text,
            });
        }
        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage,
        });
        return messages;
    }
    shouldUseRealAI() {
        // Check API key validity
        if (!this._apiKey ||
            this._apiKey.includes('your_') ||
            this._apiKey.length < 40 ||
            !this._apiKey.startsWith('sk-or-v1-')) {
            return false;
        }
        // Check if we recently hit rate limits (wait 1 hour before retrying)
        if (this._rateLimitExceeded &&
            Date.now() - this._lastRateLimitCheck < 3600000) {
            return false;
        }
        // Reset rate limit flag after 1 hour
        if (this._rateLimitExceeded &&
            Date.now() - this._lastRateLimitCheck >= 3600000) {
            this._rateLimitExceeded = false;
        }
        return true;
    }
    getSystemPrompt(context) {
        return `You are LocalFix AI assistant for appliance repair services.

About LocalFix:
- Appliance repair service platform
- Services: AC repair, TV repair, refrigerator, washing machine, microwave, blender repairs
- Pricing: Starts from ₹249, varies by appliance
- Technicians: Verified professionals
- Booking: Online platform

Your role: Help customers with appliance repairs, pricing, booking, and technical support. Be friendly and specific.`;
    }
    getEnhancedFallback(userMessage, history = []) {
        const lowerMessage = userMessage.toLowerCase();
        const lastUserMessage = history.length > 0 ? history[history.length - 1]?.text.toLowerCase() : '';
        // Enhanced contextual responses based on conversation history
        if (lowerMessage.includes('blender') ||
            lastUserMessage.includes('blender')) {
            return {
                message: 'Yes, we repair blenders! Our technicians can fix motor issues, blade problems, leakage, and electrical faults. Service starts from ₹299. Would you like to book a blender repair or need more details?',
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('washing machine') ||
            lastUserMessage.includes('washing machine')) {
            if (lowerMessage.includes('noise') || lowerMessage.includes('loud')) {
                return {
                    message: 'For washing machine noise issues, it could be due to unbalanced load, worn-out bearings, or drum problems. Our technicians can diagnose and fix this starting from ₹499. Would you like to schedule a repair visit?',
                    isRealAI: false,
                };
            }
            return {
                message: 'We provide comprehensive washing machine repair services including motor issues, drainage problems, spin cycle faults, and leakage. Service starts from ₹399. What specific issue are you facing?',
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('refrigerator') ||
            lowerMessage.includes('fridge')) {
            return {
                message: 'Yes, we repair refrigerators! Common issues we fix: cooling problems, compressor issues, thermostat faults, leakage, and ice maker problems. Service starts from ₹599. Could you describe the issue?',
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('ac') ||
            lowerMessage.includes('air conditioner')) {
            return {
                message: 'We specialize in AC repair services including gas refilling, compressor issues, cooling problems, and maintenance. Service starts from ₹699. Are you facing a specific AC issue?',
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('tv') || lowerMessage.includes('television')) {
            return {
                message: 'We repair all types of TVs - LED, LCD, Smart TVs. Common fixes: screen issues, sound problems, power supply faults, and connectivity issues. Service starts from ₹799. What TV problem are you experiencing?',
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('price') ||
            lowerMessage.includes('cost') ||
            lowerMessage.includes('charge')) {
            return {
                message: 'Our service pricing varies by appliance:\n• Small appliances (blender, microwave): ₹249-499\n• Washing machine: ₹399-899\n• Refrigerator: ₹599-1299\n• AC repair: ₹699-1599\n• TV repair: ₹799-1499\n\nExact pricing depends on the specific issue. Which appliance needs repair?',
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('book') ||
            lowerMessage.includes('schedule') ||
            lowerMessage.includes('appointment')) {
            return {
                message: 'I can help you book a repair service! Please tell me:\n1. Which appliance needs repair?\n2. What specific issue are you facing?\n3. Your preferred date/time?\n\nOr you can call us directly at 📞 1800-123-4567',
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('hello') ||
            lowerMessage.includes('hi') ||
            lowerMessage === 'hi') {
            return {
                message: "Hello! I'm your LocalFix assistant. I can help you with:\n• Appliance repairs (AC, TV, fridge, washing machine, etc.)\n• Service booking and pricing\n• Technical troubleshooting\n\nWhat appliance can I help you with today?",
                isRealAI: false,
            };
        }
        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            return {
                message: "You're welcome! Is there anything else I can help you with regarding appliance repairs or service booking?",
                isRealAI: false,
            };
        }
        // Generic but helpful response
        return {
            message: "I'm here to help with LocalFix appliance repair services! You can ask me about:\n• Specific appliance repairs (AC, TV, fridge, washing machine, blender, etc.)\n• Service pricing and booking\n• Technical issues and troubleshooting\n\nWhat would you like to know about?",
            isRealAI: false,
        };
    }
    // Method to manually reset rate limit
    resetRateLimit() {
        this._rateLimitExceeded = false;
        this._lastRateLimitCheck = 0;
        this._logger.info('🔄 Rate limit manually reset');
    }
}
exports.ChatService = ChatService;
