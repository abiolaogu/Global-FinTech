import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface MarqetaCardCreateRequest {
  userId: string;
  cardProductToken: string;
  metadata?: Record<string, any>;
}

export interface MarqetaCardCreateResponse {
  token: string;
  userToken: string;
  cardProductToken: string;
  lastFour: string;
  pan: string;
  cvv: string;
  expiration: string;
  expirationTime: string;
  state: string;
}

export interface MarqetaAuthorizationRequest {
  amount: string;
  cardToken: string;
  merchantName: string;
  merchantCategory: string;
  merchantCountry: string;
}

export interface MarqetaAuthorizationResponse {
  approved: boolean;
  authorizationCode?: string;
  declineReason?: string;
}

@Injectable()
export class MarqetaService {
  private readonly logger = new Logger(MarqetaService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly applicationToken: string;
  private readonly adminAccessToken: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('MARQETA_BASE_URL') || 'https://sandbox-api.marqeta.com/v3';
    this.applicationToken = this.configService.get<string>('MARQETA_APPLICATION_TOKEN');
    this.adminAccessToken = this.configService.get<string>('MARQETA_ADMIN_ACCESS_TOKEN');

    if (!this.applicationToken || !this.adminAccessToken) {
      throw new Error('Marqeta credentials not configured');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.applicationToken,
        password: this.adminAccessToken,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Create a Marqeta user
   */
  async createUser(userData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  }) {
    try {
      const response = await this.client.post('/users', {
        token: userData.userId,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address1: userData.address.address1,
        city: userData.address.city,
        state: userData.address.state,
        postal_code: userData.address.zip,
        country: userData.address.country,
        active: true,
      });

      this.logger.log(`Created Marqeta user: ${response.data.token}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create Marqeta user: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create card user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Issue a new card
   */
  async createCard(request: MarqetaCardCreateRequest): Promise<MarqetaCardCreateResponse> {
    try {
      const response = await this.client.post('/cards', {
        user_token: request.userId,
        card_product_token: request.cardProductToken,
        metadata: request.metadata,
      });

      const cardData = response.data;

      this.logger.log(`Created card for user ${request.userId}: ${cardData.token}`);

      // Get PAN (card number) - requires separate call to sensitive data endpoint
      const panResponse = await this.client.get(`/cards/${cardData.token}/showpan`);

      return {
        token: cardData.token,
        userToken: cardData.user_token,
        cardProductToken: cardData.card_product_token,
        lastFour: cardData.last_four,
        pan: panResponse.data.pan,
        cvv: panResponse.data.cvv_number,
        expiration: cardData.expiration,
        expirationTime: cardData.expiration_time,
        state: cardData.state,
      };
    } catch (error) {
      this.logger.error(`Failed to create card: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Activate a card
   */
  async activateCard(cardToken: string): Promise<void> {
    try {
      await this.client.put(`/cards/${cardToken}`, {
        state: 'ACTIVE',
      });

      this.logger.log(`Activated card: ${cardToken}`);
    } catch (error) {
      this.logger.error(`Failed to activate card: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to activate card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Freeze a card
   */
  async freezeCard(cardToken: string): Promise<void> {
    try {
      await this.client.put(`/cards/${cardToken}`, {
        state: 'SUSPENDED',
      });

      this.logger.log(`Froze card: ${cardToken}`);
    } catch (error) {
      this.logger.error(`Failed to freeze card: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to freeze card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Unfreeze a card
   */
  async unfreezeCard(cardToken: string): Promise<void> {
    try {
      await this.client.put(`/cards/${cardToken}`, {
        state: 'ACTIVE',
      });

      this.logger.log(`Unfroze card: ${cardToken}`);
    } catch (error) {
      this.logger.error(`Failed to unfreeze card: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to unfreeze card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Terminate a card (cannot be reversed)
   */
  async terminateCard(cardToken: string): Promise<void> {
    try {
      await this.client.put(`/cards/${cardToken}`, {
        state: 'TERMINATED',
      });

      this.logger.log(`Terminated card: ${cardToken}`);
    } catch (error) {
      this.logger.error(`Failed to terminate card: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to terminate card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Set card spending limits
   */
  async setSpendingLimits(cardToken: string, limits: {
    dailyLimit?: number;
    weeklyLimit?: number;
    monthlyLimit?: number;
  }): Promise<void> {
    try {
      const velocityControlToken = await this.createVelocityControl(cardToken, limits);

      await this.client.post(`/cards/${cardToken}/velocitycontrols`, {
        token: velocityControlToken,
      });

      this.logger.log(`Set spending limits for card: ${cardToken}`);
    } catch (error) {
      this.logger.error(`Failed to set spending limits: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to set spending limits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create velocity control (spending limits)
   */
  private async createVelocityControl(cardToken: string, limits: {
    dailyLimit?: number;
    weeklyLimit?: number;
    monthlyLimit?: number;
  }) {
    const velocityControls = [];

    if (limits.dailyLimit) {
      velocityControls.push({
        velocity_window: 'DAY',
        amount_limit: limits.dailyLimit,
        currency_code: 'USD',
      });
    }

    if (limits.weeklyLimit) {
      velocityControls.push({
        velocity_window: 'WEEK',
        amount_limit: limits.weeklyLimit,
        currency_code: 'USD',
      });
    }

    if (limits.monthlyLimit) {
      velocityControls.push({
        velocity_window: 'MONTH',
        amount_limit: limits.monthlyLimit,
        currency_code: 'USD',
      });
    }

    const response = await this.client.post('/velocitycontrols', {
      token: `vc_${cardToken}`,
      amount_limit: limits.dailyLimit || limits.weeklyLimit || limits.monthlyLimit,
      velocity_window: 'DAY',
      currency_code: 'USD',
    });

    return response.data.token;
  }

  /**
   * Get card details
   */
  async getCard(cardToken: string) {
    try {
      const response = await this.client.get(`/cards/${cardToken}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get card details: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get card details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get card transactions
   */
  async getCardTransactions(cardToken: string, limit: number = 100) {
    try {
      const response = await this.client.get('/transactions', {
        params: {
          card_token: cardToken,
          count: limit,
          sort_by: '-created_time',
        },
      });

      return response.data.data || [];
    } catch (error) {
      this.logger.error(`Failed to get card transactions: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get card transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Simulate authorization (for testing)
   */
  async simulateAuthorization(request: MarqetaAuthorizationRequest): Promise<MarqetaAuthorizationResponse> {
    try {
      const response = await this.client.post('/simulate/authorization', {
        amount: request.amount,
        card_token: request.cardToken,
        mid: 'merchant_123',
        merchant: {
          name: request.merchantName,
          mcc: request.merchantCategory,
          country: request.merchantCountry,
        },
      });

      return {
        approved: response.data.transaction.state === 'COMPLETION',
        authorizationCode: response.data.transaction.identifier,
        declineReason: response.data.transaction.response?.memo,
      };
    } catch (error) {
      this.logger.error(`Authorization simulation failed: ${error.message}`, error.stack);
      return {
        approved: false,
        declineReason: error.message,
      };
    }
  }

  /**
   * Handle webhook from Marqeta
   */
  async handleWebhook(payload: any): Promise<void> {
    this.logger.log(`Received Marqeta webhook: ${payload.type}`);

    // Process different webhook events
    switch (payload.type) {
      case 'transaction.authorization':
        await this.handleAuthorizationWebhook(payload);
        break;
      case 'transaction.clearing':
        await this.handleClearingWebhook(payload);
        break;
      case 'card.created':
        this.logger.log(`Card created: ${payload.card_token}`);
        break;
      case 'card.state.changed':
        this.logger.log(`Card state changed: ${payload.card_token} -> ${payload.new_state}`);
        break;
      default:
        this.logger.warn(`Unhandled webhook type: ${payload.type}`);
    }
  }

  private async handleAuthorizationWebhook(payload: any): Promise<void> {
    this.logger.log(`Authorization: ${payload.amount} ${payload.currency_code} for card ${payload.card_token}`);
    // In production, this would trigger events for the main application
    // to update wallet balances, create ledger entries, etc.
  }

  private async handleClearingWebhook(payload: any): Promise<void> {
    this.logger.log(`Clearing: ${payload.amount} ${payload.currency_code} for card ${payload.card_token}`);
    // Handle settlement
  }
}
