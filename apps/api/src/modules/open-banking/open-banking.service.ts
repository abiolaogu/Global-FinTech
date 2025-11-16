import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenBankingConnectionEntity } from './entities/open-banking-connection.entity';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface InitiateConnectionDto {
  userId: string;
  institutionId: string;
  redirectUrl: string;
}

export interface AccountData {
  accountId: string;
  institutionId: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  currency: string;
  balance: string;
  availableBalance: string;
  lastUpdated: Date;
}

@Injectable()
export class OpenBankingService {
  private readonly logger = new Logger(OpenBankingService.name);
  private readonly plaidClientId: string;
  private readonly plaidSecret: string;
  private readonly plaidEnv: string;

  constructor(
    @InjectRepository(OpenBankingConnectionEntity)
    private readonly connectionRepository: Repository<OpenBankingConnectionEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.plaidClientId = this.configService.get('PLAID_CLIENT_ID');
    this.plaidSecret = this.configService.get('PLAID_SECRET');
    this.plaidEnv = this.configService.get('PLAID_ENV') || 'sandbox';
  }

  /**
   * Create Plaid Link token for bank connection
   */
  async createLinkToken(dto: InitiateConnectionDto): Promise<string> {
    this.logger.log(`Creating Plaid Link token for user ${dto.userId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.plaidEnv}.plaid.com/link/token/create`,
          {
            client_id: this.plaidClientId,
            secret: this.plaidSecret,
            user: {
              client_user_id: dto.userId,
            },
            client_name: 'AtlasX',
            products: ['auth', 'transactions', 'identity', 'assets'],
            country_codes: ['US', 'GB', 'EU'],
            language: 'en',
            redirect_uri: dto.redirectUrl,
          },
        ),
      );

      return response.data.link_token;
    } catch (error) {
      this.logger.error(`Failed to create Link token: ${error.message}`);
      throw new BadRequestException('Failed to initiate bank connection');
    }
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(
    userId: string,
    publicToken: string,
    institutionId: string,
  ): Promise<OpenBankingConnectionEntity> {
    this.logger.log(`Exchanging public token for user ${userId}`);

    try {
      // Exchange token with Plaid
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.plaidEnv}.plaid.com/item/public_token/exchange`,
          {
            client_id: this.plaidClientId,
            secret: this.plaidSecret,
            public_token: publicToken,
          },
        ),
      );

      const { access_token, item_id } = response.data;

      // Encrypt access token before storing
      const encryptedToken = this.encryptToken(access_token);

      // Store connection
      const connection = this.connectionRepository.create({
        userId,
        institutionId,
        accessTokenHash: encryptedToken,
        itemId: item_id,
        status: 'active',
        consentExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      const savedConnection = await this.connectionRepository.save(connection);

      this.logger.log(`Open Banking connection established: ${savedConnection.connectionId}`);

      return savedConnection;
    } catch (error) {
      this.logger.error(`Failed to exchange token: ${error.message}`);
      throw new BadRequestException('Failed to establish bank connection');
    }
  }

  /**
   * Get accounts for a connection
   */
  async getAccounts(connectionId: string, userId: string): Promise<AccountData[]> {
    const connection = await this.getConnection(connectionId, userId);

    const accessToken = this.decryptToken(connection.accessTokenHash);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.plaidEnv}.plaid.com/accounts/get`,
          {
            client_id: this.plaidClientId,
            secret: this.plaidSecret,
            access_token: accessToken,
          },
        ),
      );

      return response.data.accounts.map((account: any) => ({
        accountId: account.account_id,
        institutionId: connection.institutionId,
        accountName: account.name,
        accountType: account.type,
        currency: account.balances.iso_currency_code || 'USD',
        balance: account.balances.current?.toString() || '0',
        availableBalance: account.balances.available?.toString() || '0',
        lastUpdated: new Date(),
      }));
    } catch (error) {
      this.logger.error(`Failed to get accounts: ${error.message}`);
      throw new BadRequestException('Failed to retrieve accounts');
    }
  }

  /**
   * Get transactions for an account
   */
  async getTransactions(
    connectionId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const connection = await this.getConnection(connectionId, userId);

    const accessToken = this.decryptToken(connection.accessTokenHash);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.plaidEnv}.plaid.com/transactions/get`,
          {
            client_id: this.plaidClientId,
            secret: this.plaidSecret,
            access_token: accessToken,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
          },
        ),
      );

      return response.data.transactions;
    } catch (error) {
      this.logger.error(`Failed to get transactions: ${error.message}`);
      throw new BadRequestException('Failed to retrieve transactions');
    }
  }

  /**
   * Get user's identity data
   */
  async getIdentity(connectionId: string, userId: string): Promise<any> {
    const connection = await this.getConnection(connectionId, userId);

    const accessToken = this.decryptToken(connection.accessTokenHash);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.plaidEnv}.plaid.com/identity/get`,
          {
            client_id: this.plaidClientId,
            secret: this.plaidSecret,
            access_token: accessToken,
          },
        ),
      );

      return response.data.accounts;
    } catch (error) {
      this.logger.error(`Failed to get identity: ${error.message}`);
      throw new BadRequestException('Failed to retrieve identity data');
    }
  }

  /**
   * Refresh connection (re-authenticate)
   */
  async refreshConnection(connectionId: string, userId: string): Promise<string> {
    const connection = await this.getConnection(connectionId, userId);

    // Create update mode Link token
    const response = await firstValueFrom(
      this.httpService.post(
        `https://${this.plaidEnv}.plaid.com/link/token/create`,
        {
          client_id: this.plaidClientId,
          secret: this.plaidSecret,
          user: {
            client_user_id: userId,
          },
          access_token: this.decryptToken(connection.accessTokenHash),
          client_name: 'AtlasX',
        },
      ),
    );

    return response.data.link_token;
  }

  /**
   * Disconnect bank connection
   */
  async disconnectConnection(connectionId: string, userId: string): Promise<void> {
    const connection = await this.getConnection(connectionId, userId);

    connection.status = 'disconnected';
    connection.disconnectedAt = new Date();

    await this.connectionRepository.save(connection);

    this.logger.log(`Open Banking connection disconnected: ${connectionId}`);
  }

  /**
   * Get all connections for user
   */
  async getUserConnections(userId: string): Promise<OpenBankingConnectionEntity[]> {
    return this.connectionRepository.find({
      where: { userId, status: 'active' as any },
      order: { createdAt: 'DESC' as any },
    });
  }

  // Private helper methods

  private async getConnection(
    connectionId: string,
    userId: string,
  ): Promise<OpenBankingConnectionEntity> {
    const connection = await this.connectionRepository.findOne({
      where: { connectionId, userId },
    });

    if (!connection) {
      throw new BadRequestException('Connection not found');
    }

    if (connection.status !== 'active') {
      throw new BadRequestException('Connection is not active');
    }

    // Check consent expiry
    if (connection.consentExpiresAt < new Date()) {
      throw new BadRequestException('Connection consent has expired. Please re-authenticate.');
    }

    return connection;
  }

  private encryptToken(token: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  }

  private decryptToken(encryptedToken: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');

    const parts = encryptedToken.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
