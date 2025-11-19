import axios from 'axios';
import { ILogger } from '../interfaces/utils/ILogger';
import {
  ITechnicianChatService,
  TechnicianChatResponse,
} from '../interfaces/services/technician/ITechnicianChatService';

export class TechnicianChatService implements ITechnicianChatService {
  private _logger: ILogger;
  private _apiKey: string;
  private _apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private _rateLimitExceeded = false;
  private _lastRateLimitCheck = 0;

  constructor(logger: ILogger) {
    this._logger = logger;
    this._apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  async sendMessage(
    userMessage: string,
    conversationHistory: any[] = [],
    context?: string,
    technicianId?: string
  ): Promise<TechnicianChatResponse> {
    this._logger.info('=== TECHNICIAN CHAT SERVICE CALLED ===', {
      technicianId,
      userMessage,
      historyLength: conversationHistory.length,
    });

    // Enhanced API key check
    if (!this.shouldUseRealAI()) {
      this._logger.warn('USING TECHNICIAN FALLBACK - AI not available');
      return this.getTechnicianFallbackWithUsage(
        userMessage,
        conversationHistory
      );
    }

    // Updated model list with better free models that support system messages
    const availableModels = [
      'mistralai/mistral-7b-instruct:free',
      'qwen/qwen2.5-7b-instruct:free',
      'microsoft/wizardlm-2-8x22b:free',
      'huggingfaceh4/zephyr-7b-beta:free',
      'google/gemma-3-4b-it:free',
      'anthropic/claude-3.5-sonnet:free',
    ];

    const messages = this.buildTechnicianMessages(
      userMessage,
      conversationHistory,
      context
    );

    for (const model of availableModels) {
      // Skip if we hit a global rate limit
      if (this._rateLimitExceeded) {
        this._logger.warn('⏰ Global rate limit active, skipping AI calls');
        break;
      }

      try {
        this._logger.info(`🔄 Technician trying model: ${model}`);

        const requestBody = {
          model: model,
          messages: messages,
          max_tokens: 800,
          temperature: 0.3,
          stream: false,
        };

        const response = await axios.post(this._apiUrl, requestBody, {
          headers: {
            Authorization: `Bearer ${this._apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'LocalFix-Technician',
          },
          timeout: 15000, // Reduced timeout for faster fallback
        });

        // Enhanced response handling
        if (
          response.data.choices &&
          response.data.choices[0] &&
          response.data.choices[0].message
        ) {
          const aiResponse = response.data.choices[0].message.content;

          this._logger.info('✅ TECHNICIAN AI SUCCESS!', {
            model: model,
            technicianId,
            responseLength: aiResponse.length,
          });

          this._rateLimitExceeded = false;

          return {
            message: aiResponse,
            usage: response.data.usage || {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
            },
            isRealAI: true,
          };
        } else {
          throw new Error('Invalid response structure from AI service');
        }
      } catch (error: any) {
        this._logger.warn(`❌ Model ${model} failed:`, {
          error: error.message,
          status: error.response?.status,
          providerError: error.response?.data?.error?.message,
        });

        // Handle different types of errors
        if (error.response?.status === 429) {
          const providerMessage = error.response?.data?.error?.message || '';

          // Check if it's a global rate limit or just model-specific
          if (
            providerMessage.includes('rate-limited upstream') ||
            providerMessage.includes('rate limit')
          ) {
            this._logger.warn(
              '⏰ Model-specific rate limit, trying next model...'
            );
            continue; // Don't break, try next model
          } else {
            this._logger.warn('⏰ GLOBAL RATE LIMIT HIT - Stopping AI calls');
            this._rateLimitExceeded = true;
            this._lastRateLimitCheck = Date.now();
            break;
          }
        }

        if (error.response?.status === 400) {
          const providerMessage = error.response?.data?.error?.message || '';
          if (
            providerMessage.includes('system message') ||
            providerMessage.includes('instruction')
          ) {
            this._logger.warn(
              '🔄 Model doesnt support system messages, trying without...'
            );
            // Try without system message for this model
            const messagesWithoutSystem = this.buildMessagesWithoutSystem(
              userMessage,
              conversationHistory
            );
            try {
              const retryResponse = await axios.post(
                this._apiUrl,
                {
                  model: model,
                  messages: messagesWithoutSystem,
                  max_tokens: 800,
                  temperature: 0.3,
                  stream: false,
                },
                {
                  headers: {
                    Authorization: `Bearer ${this._apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer':
                      process.env.FRONTEND_URL || 'http://localhost:5173',
                    'X-Title': 'LocalFix-Technician',
                  },
                  timeout: 15000,
                }
              );

              if (
                retryResponse.data.choices &&
                retryResponse.data.choices[0] &&
                retryResponse.data.choices[0].message
              ) {
                const aiResponse =
                  retryResponse.data.choices[0].message.content;
                this._logger.info(
                  '✅ TECHNICIAN AI SUCCESS (without system message)!',
                  { model }
                );

                this._rateLimitExceeded = false;
                return {
                  message: aiResponse,
                  usage: retryResponse.data.usage || {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                  },
                  isRealAI: true,
                };
              }
            } catch (retryError) {
              this._logger.warn(
                `❌ Retry without system also failed for ${model}`
              );
              continue;
            }
          }
        }

        // For other errors, continue to next model
        continue;
      }
    }

    // All models failed
    this._logger.error('💥 ALL AI MODELS FAILED - Using enhanced fallback');
    return this.getTechnicianFallbackWithUsage(
      userMessage,
      conversationHistory
    );
  }

  private buildMessagesWithoutSystem(
    userMessage: string,
    conversationHistory: any[],
    context?: string
  ): any[] {
    const messages = [];

    // Instead of system message, prepend the context as a user message
    const contextMessage = `You are LocalFix Technician AI Assistant. Focus on: technical troubleshooting, job management, parts & inventory, and company policies. Always provide specific, actionable advice for technicians.`;

    messages.push({
      role: 'user',
      content: contextMessage,
    });

    // Add conversation history
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'technician' ? 'user' : 'assistant',
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

  private buildTechnicianMessages(
    userMessage: string,
    conversationHistory: any[],
    context?: string
  ): any[] {
    const messages = [];

    // Add technician-specific system prompt
    messages.push({
      role: 'system',
      content: this.getTechnicianSystemPrompt(context),
    });

    // Add conversation history
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'technician' ? 'user' : 'assistant',
        content: msg.text,
      });
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  private getTechnicianFallbackWithUsage(
    userMessage: string,
    history: any[] = []
  ): TechnicianChatResponse {
    const fallbackResponse = this.getTechnicianFallback(userMessage, history);
    return {
      ...fallbackResponse,
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  private getTechnicianSystemPrompt(context?: string): string {
    return `You are LocalFix Technician AI Assistant, specifically designed to help technicians with their daily work.

TECHNICIAN SUPPORT FOCUS:
1. TECHNICAL TROUBLESHOOTING
   - Appliance repair diagnostics
   - Error code interpretation
   - Wiring and circuit diagrams
   - Part identification and compatibility
   - Repair techniques and best practices

2. JOB MANAGEMENT
   - Understanding job assignments
   - Time management tips
   - Customer communication strategies
   - Documentation requirements
   - Safety protocols

3. PARTS & INVENTORY
   - Common part numbers
   - Alternative part suggestions
   - Ordering procedures
   - Inventory management

4. COMPANY POLICIES
   - Service pricing structure
   - Warranty information
   - Quality standards
   - Reporting procedures
   - Emergency protocols

Always provide specific, actionable advice. Focus on practical solutions that can be implemented on-site.`;
  }

  private getTechnicianFallback(
    userMessage: string,
    history: any[] = []
  ): TechnicianChatResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Technical troubleshooting responses
    if (
      lowerMessage.includes('error code') ||
      lowerMessage.includes('fault code')
    ) {
      return {
        message: `For error codes, here's our standard procedure:
1. Note the exact error code displayed
2. Check the manufacturer's error code guide in our app
3. Common solutions:
   - Power cycle the appliance
   - Check sensor connections
   - Verify power supply
4. If persistent, check our technical database for specific code troubleshooting

What's the specific error code and appliance model?`,
        isRealAI: false,
      };
    }

    if (lowerMessage.includes('part') || lowerMessage.includes('component')) {
      return {
        message: `For parts identification and ordering:
• Use our parts catalog in the technician app
• Take a photo for visual identification
• Check compatibility with appliance model number
• Emergency parts can be ordered via priority service
• Common parts are available at our central warehouse

Need help with a specific part? Share the model number.`,
        isRealAI: false,
      };
    }

    if (lowerMessage.includes('safety') || lowerMessage.includes('danger')) {
      return {
        message: `SAFETY FIRST - Critical Protocols:
🔌 ELECTRICAL: Always disconnect power, use voltage tester
🔥 GAS APPLIANCES: Check for leaks with soap solution, no open flames
🧯 REFRIGERANTS: Use proper PPE, follow environmental guidelines
⚠️ GENERAL: Wear safety shoes, gloves, and eye protection

Never compromise on safety procedures. Do you have a specific safety concern?`,
        isRealAI: false,
      };
    }

    if (lowerMessage.includes('schedule') || lowerMessage.includes('job')) {
      return {
        message: `Job Management Assistance:
• Check your daily schedule in the technician app
• Travel time between jobs: Minimum 30 minutes buffer
• Emergency jobs are prioritized and flagged in red
• Customer rescheduling requires manager approval
• Same-day completion bonus available for eligible jobs

Need help with a specific job assignment?`,
        isRealAI: false,
      };
    }

    if (
      lowerMessage.includes('customer') ||
      lowerMessage.includes('communication')
    ) {
      return {
        message: `Customer Communication Tips:
• Explain issues in simple, non-technical terms
• Provide clear cost estimates before starting work
• Document everything with photos in the app
• Set realistic time expectations
• Escalate difficult situations to supervisor

Remember: Good communication leads to better ratings and repeat business!`,
        isRealAI: false,
      };
    }

    // Default technician response
    return {
      message: `I'm your LocalFix Technician Assistant. I can help with:
🔧 Technical troubleshooting and diagnostics
📋 Job management and scheduling  
🔌 Safety protocols and best practices
📦 Parts identification and ordering
💼 Company policies and procedures

What specific technical or job-related assistance do you need today?`,
      isRealAI: false,
    };
  }

  private shouldUseRealAI(): boolean {
    // Debug logging
    this._logger.info('API Key Check:', {
      hasApiKey: !!this._apiKey,
      apiKeyLength: this._apiKey?.length,
      apiKeyStartsWith: this._apiKey?.substring(0, 10),
      isTestKey: this._apiKey?.includes('your_'),
      rateLimitExceeded: this._rateLimitExceeded,
      timeSinceLastCheck: Date.now() - this._lastRateLimitCheck,
    });

    if (
      !this._apiKey ||
      this._apiKey.includes('your_') ||
      this._apiKey.length < 40
    ) {
      this._logger.warn('❌ API Key invalid or missing');
      return false;
    }

    if (
      this._rateLimitExceeded &&
      Date.now() - this._lastRateLimitCheck < 3600000
    ) {
      this._logger.warn('⏰ Rate limit still active');
      return false;
    }

    if (
      this._rateLimitExceeded &&
      Date.now() - this._lastRateLimitCheck >= 3600000
    ) {
      this._logger.info('🔄 Rate limit expired, resetting');
      this._rateLimitExceeded = false;
    }

    this._logger.info('✅ API Key valid, proceeding with real AI');
    return true;
  }
}
