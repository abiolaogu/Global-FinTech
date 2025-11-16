import { Injectable, Logger } from '@nestjs/common';

export interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
  alternatives?: Intent[];
}

export interface Entity {
  type: string;
  value: any;
  raw: string;
  confidence: number;
}

@Injectable()
export class AIIntentService {
  private readonly logger = new Logger(AIIntentService.name);

  // Intent patterns with regex and keywords
  private intentPatterns = {
    // Money transfer intents
    send_money: {
      patterns: [
        /send\s+(?:\$|USD|NGN|KES|GHS)?[\d,]+(?:\.\d{2})?\s+to\s+(.+)/i,
        /transfer\s+(?:\$|USD|NGN|KES|GHS)?[\d,]+(?:\.\d{2})?\s+to\s+(.+)/i,
        /pay\s+(.+)\s+(?:\$|USD|NGN|KES|GHS)?[\d,]+(?:\.\d{2})?/i,
      ],
      keywords: ['send', 'transfer', 'pay', 'remit'],
      entities: ['amount', 'recipient', 'currency'],
    },

    // Balance and account intents
    check_balance: {
      patterns: [/(?:what'?s|check|show)\s+(?:my\s+)?balance/i, /how much.*(?:have|got)/i],
      keywords: ['balance', 'account', 'wallet', 'funds'],
      entities: ['account_type', 'currency'],
    },

    view_transactions: {
      patterns: [/show\s+(?:my\s+)?(?:recent\s+)?transactions/i, /transaction\s+history/i],
      keywords: ['transactions', 'history', 'activity', 'statement'],
      entities: ['date_range', 'transaction_type', 'limit'],
    },

    // Investment intents
    invest: {
      patterns: [
        /invest\s+(?:\$|USD|NGN)?[\d,]+(?:\.\d{2})?\s+in\s+(.+)/i,
        /buy\s+(?:\$|USD|NGN)?[\d,]+(?:\.\d{2})?\s+(?:worth\s+)?(?:of\s+)?(.+)/i,
      ],
      keywords: ['invest', 'buy', 'purchase', 'acquire'],
      entities: ['amount', 'investment_name', 'currency'],
    },

    view_investments: {
      patterns: [/show\s+(?:my\s+)?(?:investment\s+)?portfolio/i, /(?:my\s+)?investments/i],
      keywords: ['portfolio', 'investments', 'holdings'],
      entities: ['investment_type', 'status'],
    },

    search_investments: {
      patterns: [/find\s+investments?\s+(?:in|for)\s+(.+)/i, /search\s+(.+)\s+investments?/i],
      keywords: ['find', 'search', 'look for', 'discover'],
      entities: ['category', 'risk_level', 'min_amount', 'max_amount'],
    },

    // ROSCA intents
    create_rosca: {
      patterns: [/create\s+(?:a\s+)?(?:rosca|circle|savings?\s+group)/i],
      keywords: ['create', 'start', 'rosca', 'circle', 'savings group'],
      entities: ['contribution_amount', 'frequency', 'max_members'],
    },

    join_rosca: {
      patterns: [/join\s+(?:rosca|circle)\s+(.+)/i],
      keywords: ['join', 'participate', 'rosca', 'circle'],
      entities: ['rosca_name', 'rosca_id'],
    },

    view_rosca: {
      patterns: [/show\s+(?:my\s+)?(?:rosca|circles)/i, /(?:my\s+)?(?:rosca|circles)/i],
      keywords: ['rosca', 'circles', 'savings group'],
      entities: ['status'],
    },

    // P2P Lending intents
    apply_loan: {
      patterns: [/(?:apply|request)\s+(?:for\s+)?(?:a\s+)?loan\s+(?:of\s+)?(?:\$|USD|NGN)?[\d,]+(?:\.\d{2})?/i],
      keywords: ['loan', 'borrow', 'credit'],
      entities: ['amount', 'currency', 'purpose', 'term'],
    },

    lend_money: {
      patterns: [/lend\s+(?:\$|USD|NGN)?[\d,]+(?:\.\d{2})?/i, /become\s+(?:a\s+)?lender/i],
      keywords: ['lend', 'fund', 'invest in loans'],
      entities: ['amount', 'risk_level', 'auto_invest'],
    },

    view_loans: {
      patterns: [/show\s+(?:my\s+)?loans/i, /loan\s+status/i],
      keywords: ['loans', 'borrowing', 'lending'],
      entities: ['loan_type', 'status'],
    },

    // Account management
    update_profile: {
      patterns: [/update\s+(?:my\s+)?profile/i, /change\s+(.+)/i],
      keywords: ['update', 'change', 'modify', 'edit'],
      entities: ['field_name', 'new_value'],
    },

    add_payment_method: {
      patterns: [/add\s+(?:a\s+)?(?:payment\s+)?(?:method|card|bank)/i],
      keywords: ['add', 'link', 'connect', 'payment method', 'card', 'bank'],
      entities: ['payment_type'],
    },

    verify_kyc: {
      patterns: [/verify\s+(?:my\s+)?(?:identity|account|kyc)/i, /kyc\s+verification/i],
      keywords: ['verify', 'kyc', 'identity', 'verification'],
      entities: ['verification_level'],
    },

    // Help and information
    get_help: {
      patterns: [/help/i, /how\s+(?:do|can)\s+i\s+(.+)/i, /what\s+(?:is|are)\s+(.+)/i],
      keywords: ['help', 'how', 'what', 'explain', 'guide'],
      entities: ['topic'],
    },

    faq: {
      patterns: [/(?:fees|charges|cost)/i, /(?:limit|maximum|minimum)/i],
      keywords: ['fees', 'charges', 'limits', 'requirements'],
      entities: ['question_category'],
    },
  };

  /**
   * Analyze user message and detect intent
   */
  async detectIntent(message: string, context?: any): Promise<Intent> {
    this.logger.debug(`Detecting intent for message: "${message}"`);

    const normalizedMessage = message.toLowerCase().trim();
    const detectedIntents: Intent[] = [];

    // Check each intent pattern
    for (const [intentName, intentConfig] of Object.entries(this.intentPatterns)) {
      let confidence = 0;
      const entities: Record<string, Entity> = {};

      // Check regex patterns
      for (const pattern of intentConfig.patterns) {
        const match = normalizedMessage.match(pattern);
        if (match) {
          confidence += 0.4;
          // Extract entities from regex groups
          this.extractEntitiesFromMatch(match, entities);
        }
      }

      // Check keywords
      const keywordMatches = intentConfig.keywords.filter((keyword) =>
        normalizedMessage.includes(keyword.toLowerCase()),
      );
      confidence += keywordMatches.length * 0.15;

      // Extract entities
      const extractedEntities = this.extractEntities(normalizedMessage, intentConfig.entities);
      Object.assign(entities, extractedEntities);

      // Context-based confidence boost
      if (context?.lastIntent === intentName) {
        confidence += 0.1;
      }

      if (confidence > 0.3) {
        detectedIntents.push({
          name: intentName,
          confidence: Math.min(confidence, 1.0),
          entities,
        });
      }
    }

    // Sort by confidence
    detectedIntents.sort((a, b) => b.confidence - a.confidence);

    if (detectedIntents.length === 0) {
      return {
        name: 'unknown',
        confidence: 0,
        entities: {},
        alternatives: [],
      };
    }

    const primaryIntent = detectedIntents[0];
    const alternatives = detectedIntents.slice(1, 3);

    return {
      ...primaryIntent,
      alternatives,
    };
  }

  /**
   * Extract entities from message
   */
  private extractEntities(message: string, entityTypes: string[]): Record<string, Entity> {
    const entities: Record<string, Entity> = {};

    for (const entityType of entityTypes) {
      switch (entityType) {
        case 'amount':
          entities.amount = this.extractAmount(message);
          break;
        case 'currency':
          entities.currency = this.extractCurrency(message);
          break;
        case 'recipient':
          entities.recipient = this.extractRecipient(message);
          break;
        case 'date_range':
          entities.date_range = this.extractDateRange(message);
          break;
        case 'account_type':
          entities.account_type = this.extractAccountType(message);
          break;
        case 'investment_name':
          entities.investment_name = this.extractInvestmentName(message);
          break;
        case 'category':
          entities.category = this.extractCategory(message);
          break;
        case 'risk_level':
          entities.risk_level = this.extractRiskLevel(message);
          break;
      }
    }

    return Object.fromEntries(
      Object.entries(entities).filter(([_, entity]) => entity !== null),
    );
  }

  private extractAmount(message: string): Entity | null {
    const patterns = [
      /(?:\$|USD|NGN|KES|GHS|EUR|GBP)\s*([\d,]+(?:\.\d{2})?)/i,
      /([\d,]+(?:\.\d{2})?)\s*(?:\$|USD|NGN|KES|GHS|EUR|GBP)/i,
      /([\d,]+(?:\.\d{2})?)/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const raw = match[0];
        const value = parseFloat(match[1].replace(/,/g, ''));
        return {
          type: 'amount',
          value,
          raw,
          confidence: 0.9,
        };
      }
    }
    return null;
  }

  private extractCurrency(message: string): Entity | null {
    const currencies = ['USD', 'NGN', 'KES', 'GHS', 'ZAR', 'EUR', 'GBP', 'CAD', 'BRL', 'PHP'];
    const pattern = new RegExp(`\\b(${currencies.join('|')})\\b`, 'i');
    const match = message.match(pattern);

    if (match) {
      return {
        type: 'currency',
        value: match[1].toUpperCase(),
        raw: match[0],
        confidence: 0.95,
      };
    }

    // Check for currency symbols
    if (message.includes('$')) {
      return { type: 'currency', value: 'USD', raw: '$', confidence: 0.8 };
    }
    if (message.includes('₦')) {
      return { type: 'currency', value: 'NGN', raw: '₦', confidence: 0.95 };
    }

    return null;
  }

  private extractRecipient(message: string): Entity | null {
    // Extract after "to", "pay", or "@"
    const patterns = [
      /(?:to|pay)\s+([a-zA-Z0-9._@+-]+)/i,
      /@([a-zA-Z0-9._+-]+)/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'recipient',
          value: match[1],
          raw: match[0],
          confidence: 0.85,
        };
      }
    }
    return null;
  }

  private extractDateRange(message: string): Entity | null {
    const ranges = {
      today: { value: 'today', confidence: 0.9 },
      yesterday: { value: 'yesterday', confidence: 0.9 },
      'this week': { value: 'week', confidence: 0.85 },
      'last week': { value: 'last_week', confidence: 0.85 },
      'this month': { value: 'month', confidence: 0.85 },
      'last month': { value: 'last_month', confidence: 0.85 },
      'last 7 days': { value: '7d', confidence: 0.9 },
      'last 30 days': { value: '30d', confidence: 0.9 },
    };

    for (const [key, data] of Object.entries(ranges)) {
      if (message.toLowerCase().includes(key)) {
        return {
          type: 'date_range',
          value: data.value,
          raw: key,
          confidence: data.confidence,
        };
      }
    }
    return null;
  }

  private extractAccountType(message: string): Entity | null {
    const types = ['wallet', 'investment', 'rosca', 'loan'];
    for (const type of types) {
      if (message.toLowerCase().includes(type)) {
        return {
          type: 'account_type',
          value: type,
          raw: type,
          confidence: 0.8,
        };
      }
    }
    return null;
  }

  private extractInvestmentName(message: string): Entity | null {
    // Extract after "in", "of", or investment keywords
    const pattern = /(?:in|of)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:stock|bond|fund|etf|investment))?$/i;
    const match = message.match(pattern);
    if (match) {
      return {
        type: 'investment_name',
        value: match[1].trim(),
        raw: match[0],
        confidence: 0.7,
      };
    }
    return null;
  }

  private extractCategory(message: string): Entity | null {
    const categories = [
      'stocks', 'bonds', 'mutual funds', 'etf', 'real estate',
      'crypto', 'commodities', 'private equity', 'venture capital',
    ];

    for (const category of categories) {
      if (message.toLowerCase().includes(category)) {
        return {
          type: 'category',
          value: category,
          raw: category,
          confidence: 0.85,
        };
      }
    }
    return null;
  }

  private extractRiskLevel(message: string): Entity | null {
    const levels = {
      'very low': 'very_low',
      'low risk': 'low',
      safe: 'low',
      moderate: 'moderate',
      'medium risk': 'moderate',
      'high risk': 'high',
      aggressive: 'high',
      'very high': 'very_high',
    };

    for (const [key, value] of Object.entries(levels)) {
      if (message.toLowerCase().includes(key)) {
        return {
          type: 'risk_level',
          value,
          raw: key,
          confidence: 0.85,
        };
      }
    }
    return null;
  }

  private extractEntitiesFromMatch(match: RegExpMatchArray, entities: Record<string, Entity>): void {
    // Helper to extract from regex capture groups
    if (match.length > 1) {
      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          entities[`capture_${i}`] = {
            type: 'captured',
            value: match[i],
            raw: match[i],
            confidence: 0.8,
          };
        }
      }
    }
  }

  /**
   * Generate contextual response based on intent
   */
  generateResponse(intent: Intent, context?: any): string {
    const responses = {
      send_money: this.generateSendMoneyResponse(intent),
      check_balance: this.generateBalanceResponse(intent),
      invest: this.generateInvestResponse(intent),
      search_investments: this.generateSearchInvestmentsResponse(intent),
      create_rosca: 'I can help you create a ROSCA circle. What contribution amount and frequency would you like?',
      join_rosca: this.generateJoinRoscaResponse(intent),
      apply_loan: this.generateLoanResponse(intent),
      get_help: 'I\'m here to help! You can ask me to send money, check your balance, invest, join a ROSCA, or apply for a loan. What would you like to do?',
      unknown: 'I\'m not sure I understood that. Could you rephrase? You can ask me to send money, check balance, invest, or get help with other features.',
    };

    return responses[intent.name] || responses.unknown;
  }

  private generateSendMoneyResponse(intent: Intent): string {
    const { amount, recipient, currency } = intent.entities;
    if (amount && recipient) {
      return `I'll help you send ${currency?.value || 'USD'} ${amount.value} to ${recipient.value}. Please confirm this transaction.`;
    }
    return 'I can help you send money. Please specify the amount and recipient.';
  }

  private generateBalanceResponse(intent: Intent): string {
    const accountType = intent.entities.account_type?.value || 'main wallet';
    return `Let me fetch your ${accountType} balance for you.`;
  }

  private generateInvestResponse(intent: Intent): string {
    const { amount, investment_name } = intent.entities;
    if (amount && investment_name) {
      return `I'll help you invest ${amount.value} in ${investment_name.value}. Let me pull up the details.`;
    }
    return 'I can help you invest. What would you like to invest in?';
  }

  private generateSearchInvestmentsResponse(intent: Intent): string {
    const { category, risk_level } = intent.entities;
    let response = 'Let me find investment opportunities for you';
    if (category) response += ` in ${category.value}`;
    if (risk_level) response += ` with ${risk_level.value} risk`;
    return response + '.';
  }

  private generateJoinRoscaResponse(intent: Intent): string {
    const roscaName = intent.entities.rosca_name?.value;
    if (roscaName) {
      return `I'll help you join the "${roscaName}" ROSCA circle. Let me show you the details.`;
    }
    return 'I can help you find and join a ROSCA circle. What kind of circle are you looking for?';
  }

  private generateLoanResponse(intent: Intent): string {
    const { amount, purpose } = intent.entities;
    if (amount) {
      return `I'll help you apply for a loan of ${amount.value}. Let me guide you through the application.`;
    }
    return 'I can help you apply for a loan. How much would you like to borrow?';
  }
}
