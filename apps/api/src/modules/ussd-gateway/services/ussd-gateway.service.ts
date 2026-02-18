import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UssdSessionEntity } from '../entities/ussd-session.entity';
import { WalletEntity } from '../../wallets/entities/wallet.entity';
import { WalletTopupService } from '../../wallets/services/wallet-topup.service';
import { CreditLineService } from '../../wallets/services/credit-line.service';
import { WalletsService } from '../../wallets/wallets.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

export interface UssdRequest {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
  networkOperator?: string;
}

export interface UssdResponse {
  sessionId: string;
  message: string;
  continueSession: boolean; // true = CON (continue), false = END (end session)
}

@Injectable()
export class UssdGatewayService {
  private readonly SESSION_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_PIN_ATTEMPTS = 3;

  constructor(
    @InjectRepository(UssdSessionEntity)
    private sessionRepository: Repository<UssdSessionEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    private walletsService: WalletsService,
    private topupService: WalletTopupService,
    private creditLineService: CreditLineService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process USSD request
   */
  async processUssdRequest(request: UssdRequest): Promise<UssdResponse> {
    try {
      let session = await this.getOrCreateSession(request);

      // Check if session has expired
      if (!session.isValid) {
        return this.endSession(session, 'Session expired. Please try again.');
      }

      // Update last interaction
      session.lastInteractionAt = new Date();
      session.lastUserInput = request.text;

      // Parse user input
      const inputParts = request.text.split('*');
      const currentInput = inputParts[inputParts.length - 1];

      // Route to appropriate menu handler
      let response: UssdResponse;

      if (!session.authenticated) {
        response = await this.handleAuthentication(session, currentInput);
      } else {
        response = await this.handleMenu(session, currentInput);
      }

      // Update session
      session.lastResponse = response.message;
      await this.sessionRepository.save(session);

      return response;
    } catch (error) {
      return {
        sessionId: request.sessionId,
        message: `Error: ${error.message || 'An error occurred'}`,
        continueSession: false,
      };
    }
  }

  /**
   * Get or create USSD session
   */
  private async getOrCreateSession(request: UssdRequest): Promise<UssdSessionEntity> {
    let session = await this.sessionRepository.findOne({
      where: { sessionToken: request.sessionId },
    });

    if (!session) {
      session = this.sessionRepository.create({
        phoneNumber: request.phoneNumber,
        sessionToken: request.sessionId,
        currentMenu: 'main',
        authenticated: false,
        status: 'active',
        ussdGateway: 'africastalking', // or detect from request
        metadata: {
          serviceCode: request.serviceCode,
          networkOperator: request.networkOperator,
        },
      });

      session.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);
      await this.sessionRepository.save(session);
    }

    return session;
  }

  /**
   * Handle PIN authentication
   */
  private async handleAuthentication(
    session: UssdSessionEntity,
    input: string,
  ): Promise<UssdResponse> {
    if (!input || input === '') {
      return {
        sessionId: session.sessionToken,
        message: 'Welcome to Global FinTech\nEnter your PIN:',
        continueSession: true,
      };
    }

    // Validate PIN (in production, verify against user's hashed PIN)
    const isValidPin = await this.validatePin(session.phoneNumber, input);

    if (isValidPin) {
      session.authenticated = true;
      session.pinAttempts = 0;

      // Get user ID from phone number (in production, lookup from database)
      session.userId = await this.getUserIdFromPhone(session.phoneNumber);

      return this.showMainMenu(session);
    } else {
      session.pinAttempts += 1;

      if (session.pinAttempts >= this.MAX_PIN_ATTEMPTS) {
        return this.endSession(
          session,
          'Too many failed attempts. Your account has been locked.',
        );
      }

      return {
        sessionId: session.sessionToken,
        message: `Invalid PIN. ${this.MAX_PIN_ATTEMPTS - session.pinAttempts} attempts remaining.\nEnter your PIN:`,
        continueSession: true,
      };
    }
  }

  /**
   * Show main menu
   */
  private showMainMenu(session: UssdSessionEntity): UssdResponse {
    session.currentMenu = 'main';

    return {
      sessionId: session.sessionToken,
      message:
        'Global FinTech Wallet\n' +
        '1. Check Balance\n' +
        '2. Send Money\n' +
        '3. Sync Transactions\n' +
        '4. Top-up Wallet\n' +
        '5. Check Credit\n' +
        '6. Transaction History\n' +
        '0. Exit',
      continueSession: true,
    };
  }

  /**
   * Handle menu navigation
   */
  private async handleMenu(
    session: UssdSessionEntity,
    input: string,
  ): Promise<UssdResponse> {
    const menu = session.currentMenu;
    const state = session.menuState || {};

    switch (menu) {
      case 'main':
        return this.handleMainMenu(session, input);

      case 'balance':
        return this.handleBalanceCheck(session);

      case 'send_money':
        return this.handleSendMoney(session, input, state);

      case 'sync':
        return this.handleSync(session);

      case 'topup':
        return this.handleTopup(session, input, state);

      case 'credit':
        return this.handleCreditCheck(session);

      case 'history':
        return this.handleHistory(session);

      default:
        return this.showMainMenu(session);
    }
  }

  /**
   * Handle main menu selection
   */
  private handleMainMenu(session: UssdSessionEntity, input: string): UssdResponse {
    switch (input) {
      case '1':
        session.currentMenu = 'balance';
        return this.handleBalanceCheck(session);

      case '2':
        session.currentMenu = 'send_money';
        session.menuState = { step: 'select_wallet' };
        return this.handleSendMoney(session, '', session.menuState);

      case '3':
        session.currentMenu = 'sync';
        return this.handleSync(session);

      case '4':
        session.currentMenu = 'topup';
        session.menuState = { step: 'select_wallet' };
        return this.handleTopup(session, '', session.menuState);

      case '5':
        session.currentMenu = 'credit';
        return this.handleCreditCheck(session);

      case '6':
        session.currentMenu = 'history';
        return this.handleHistory(session);

      case '0':
        return this.endSession(session, 'Thank you for using Global FinTech!');

      default:
        return {
          sessionId: session.sessionToken,
          message: 'Invalid option. Please try again.',
          continueSession: true,
        };
    }
  }

  /**
   * Handle balance check
   */
  private async handleBalanceCheck(session: UssdSessionEntity): Promise<UssdResponse> {
    const wallets = await this.walletRepository.find({
      where: { userId: session.userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });

    if (wallets.length === 0) {
      return this.endSession(session, 'No wallets found.');
    }

    let message = 'Your Wallets:\n\n';

    for (const wallet of wallets) {
      message += `${wallet.currency}\n`;
      message += `Balance: ${parseFloat(wallet.balance).toFixed(2)}\n`;
      message += `Available: ${parseFloat(wallet.availableBalance).toFixed(2)}\n`;

      if (parseFloat(wallet.creditLimit) > 0) {
        message += `Credit: ${parseFloat(wallet.creditAvailable).toFixed(2)}\n`;
      }

      message += '\n';
    }

    // Update USSD sync timestamp
    for (const wallet of wallets) {
      wallet.lastUssdSyncAt = new Date();
      wallet.ussdSyncCount += 1;
      await this.walletRepository.save(wallet);
    }

    message += '1. Main Menu\n0. Exit';

    return {
      sessionId: session.sessionToken,
      message,
      continueSession: true,
    };
  }

  /**
   * Handle send money flow
   */
  private handleSendMoney(
    session: UssdSessionEntity,
    input: string,
    state: any,
  ): UssdResponse {
    // Multi-step process: select wallet → enter amount → enter recipient → confirm
    return {
      sessionId: session.sessionToken,
      message: 'Send money feature coming soon!\n\n1. Main Menu\n0. Exit',
      continueSession: true,
    };
  }

  /**
   * Handle sync
   */
  private async handleSync(session: UssdSessionEntity): Promise<UssdResponse> {
    const wallets = await this.walletRepository.find({
      where: { userId: session.userId },
    });

    // Update USSD sync timestamp
    for (const wallet of wallets) {
      wallet.lastUssdSyncAt = new Date();
      wallet.ussdSyncCount += 1;
      await this.walletRepository.save(wallet);
    }

    return {
      sessionId: session.sessionToken,
      message:
        `Syncing...\n\n` +
        `Wallets synced: ${wallets.length}\n` +
        `Last sync: ${new Date().toLocaleString()}\n\n` +
        `1. Main Menu\n0. Exit`,
      continueSession: true,
    };
  }

  /**
   * Handle wallet top-up flow
   */
  private async handleTopup(
    session: UssdSessionEntity,
    input: string,
    state: any,
  ): Promise<UssdResponse> {
    if (state.step === 'select_wallet') {
      const wallets = await this.walletRepository.find({
        where: { userId: session.userId },
      });

      let message = 'Select wallet to top-up:\n\n';
      wallets.forEach((w, i) => {
        message += `${i + 1}. ${w.currency} (${parseFloat(w.balance).toFixed(2)})\n`;
      });
      message += '\n0. Cancel';

      state.wallets = wallets;
      state.step = 'enter_amount';
      session.menuState = state;

      return {
        sessionId: session.sessionToken,
        message,
        continueSession: true,
      };
    } else if (state.step === 'enter_amount') {
      const selectedIndex = parseInt(input) - 1;
      if (selectedIndex >= 0 && selectedIndex < state.wallets.length) {
        state.selectedWallet = state.wallets[selectedIndex];
        state.step = 'confirm';
        session.menuState = state;

        return {
          sessionId: session.sessionToken,
          message:
            `Enter amount to top-up:\n` +
            `Wallet: ${state.selectedWallet.currency}\n` +
            `Current balance: ${parseFloat(state.selectedWallet.balance).toFixed(2)}\n\n` +
            `0. Cancel`,
          continueSession: true,
        };
      }
    } else if (state.step === 'confirm') {
      const amount = parseFloat(input);
      if (amount > 0) {
        // Initiate top-up
        const topup = await this.topupService.initiateTopup({
          userId: session.userId,
          walletId: state.selectedWallet.walletId,
          amount: amount.toString(),
          sourceType: 'main_wallet',
          channel: 'ussd',
          description: 'USSD wallet top-up',
          metadata: {
            phoneNumber: session.phoneNumber,
            ussdSessionId: session.sessionId,
          },
        });

        return this.endSession(
          session,
          `Top-up initiated!\n\n` +
            `Amount: ${amount.toFixed(2)} ${state.selectedWallet.currency}\n` +
            `Reference: ${topup.reference}\n\n` +
            `You will receive a confirmation SMS shortly.`,
        );
      }
    }

    return this.showMainMenu(session);
  }

  /**
   * Handle credit check
   */
  private async handleCreditCheck(session: UssdSessionEntity): Promise<UssdResponse> {
    try {
      const creditLine = await this.creditLineService.getCreditLine(session.userId);

      const message =
        'Your Credit Line:\n\n' +
        `Limit: ${parseFloat(creditLine.creditLimit).toFixed(2)}\n` +
        `Used: ${parseFloat(creditLine.creditUsed).toFixed(2)}\n` +
        `Available: ${parseFloat(creditLine.creditAvailable).toFixed(2)}\n` +
        `Utilization: ${creditLine.utilizationRate}%\n` +
        `Status: ${creditLine.status}\n\n` +
        `1. Main Menu\n0. Exit`;

      return {
        sessionId: session.sessionToken,
        message,
        continueSession: true,
      };
    } catch (error) {
      return {
        sessionId: session.sessionToken,
        message:
          'No credit line available.\n\n' +
          'Contact support to apply for credit.\n\n' +
          '1. Main Menu\n0. Exit',
        continueSession: true,
      };
    }
  }

  /**
   * Handle transaction history
   */
  private handleHistory(session: UssdSessionEntity): UssdResponse {
    return {
      sessionId: session.sessionToken,
      message:
        'Transaction history available on mobile app.\n\n' +
        '1. Main Menu\n0. Exit',
      continueSession: true,
    };
  }

  /**
   * End USSD session
   */
  private async endSession(
    session: UssdSessionEntity,
    message: string,
  ): Promise<UssdResponse> {
    session.status = 'completed';
    session.completedAt = new Date();
    await this.sessionRepository.save(session);

    return {
      sessionId: session.sessionToken,
      message,
      continueSession: false,
    };
  }

  /**
   * Validate PIN (mock implementation)
   */
  private async validatePin(phoneNumber: string, pin: string): Promise<boolean> {
    // In production, lookup user by phone and verify hashed PIN
    // For now, accept any 4-digit PIN
    return /^\d{4}$/.test(pin);
  }

  /**
   * Get user ID from phone number (mock implementation)
   */
  private async getUserIdFromPhone(phoneNumber: string): Promise<string> {
    // In production, lookup user ID from database
    // For now, generate a deterministic ID from phone
    return crypto
      .createHash('sha256')
      .update(phoneNumber)
      .digest('hex')
      .substring(0, 36);
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'timeout' })
      .where('status = :status', { status: 'active' })
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }
}
