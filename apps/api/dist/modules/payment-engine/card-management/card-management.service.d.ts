import { DataSource } from 'typeorm';
import { HSMService } from '../security/hsm.service';
export declare enum CardStatus {
    ORDERED = "ordered",
    MANUFACTURED = "manufactured",
    SHIPPED = "shipped",
    ACTIVATED = "activated",
    ACTIVE = "active",
    BLOCKED = "blocked",
    SUSPENDED = "suspended",
    LOST = "lost",
    STOLEN = "stolen",
    DAMAGED = "damaged",
    EXPIRED = "expired",
    CLOSED = "closed"
}
export declare enum CardType {
    DEBIT = "debit",
    CREDIT = "credit",
    PREPAID = "prepaid",
    VIRTUAL = "virtual"
}
export declare enum CardNetwork {
    VISA = "visa",
    MASTERCARD = "mastercard",
    AMEX = "amex",
    DISCOVER = "discover",
    UNIONPAY = "unionpay"
}
export declare class CardManagementService {
    private readonly hsmService;
    private readonly dataSource;
    private readonly logger;
    constructor(hsmService: HSMService, dataSource: DataSource);
    issueCard(request: IssueCardRequest): Promise<CardData>;
    activateCard(cardId: string, activationCode?: string): Promise<CardData>;
    setPIN(cardId: string, newPIN: string, currentPIN?: string): Promise<void>;
    verifyPIN(cardId: string, pin: string): Promise<boolean>;
    blockCard(cardId: string, reason: string): Promise<CardData>;
    unblockCard(cardId: string): Promise<CardData>;
    reportLostStolen(cardId: string, type: 'lost' | 'stolen'): Promise<CardData>;
    updateLimits(cardId: string, limits: Partial<CardLimits>): Promise<CardData>;
    generateToken(cardId: string, walletType: 'apple_pay' | 'google_pay'): Promise<TokenData>;
    getCard(cardId: string): Promise<CardData>;
    private generatePAN;
    private addLuhnCheckDigit;
    private maskPAN;
    private generateExpiryDate;
    private generateTrack1;
    private generateTrack2;
    private generateICCData;
    private hashPIN;
    private generatePINOffset;
    private calculateNaturalPIN;
    private issueReplacementCard;
    private generateTokenPAN;
    private getDefaultLimits;
    private sanitizeCardData;
    private randomDigits;
    private generateICCPublicKey;
    private generateIssuerPublicKey;
}
export interface IssueCardRequest {
    cardholderName: string;
    cardType: CardType;
    network: CardNetwork;
    accountId: string;
    userId: string;
    binRange?: string;
    validityYears?: number;
    billingAddress: Address;
    shippingAddress?: Address;
    limits?: Partial<CardLimits>;
    internationalEnabled?: boolean;
}
export interface CardData {
    cardId: string;
    pan?: string;
    maskedPan: string;
    cardholderName: string;
    expiryDate: string;
    cvv?: string;
    cvv2?: string;
    cardType: CardType;
    network: CardNetwork;
    status: CardStatus;
    accountId: string;
    userId: string;
    issuedDate: Date;
    activatedDate?: Date;
    activationCode?: string;
    billingAddress: Address;
    shippingAddress?: Address;
    limits: CardLimits;
    features: CardFeatures;
    track1Data?: string;
    track2Data?: string;
    iccData?: any;
    pinHash?: string;
    pinOffset?: string;
    blockReason?: string;
    blockedDate?: Date;
    reportedDate?: Date;
    metadata: any;
}
export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export interface CardLimits {
    dailyPurchaseLimit: number;
    dailyATMLimit: number;
    dailyOnlineLimit: number;
    singleTransactionLimit: number;
    monthlyLimit: number;
}
export interface CardFeatures {
    contactless: boolean;
    atmWithdrawal: boolean;
    onlinePurchase: boolean;
    internationalUsage: boolean;
    magneticStripe: boolean;
    emvChip: boolean;
}
export interface TokenData {
    tokenId: string;
    cardId: string;
    tokenPAN: string;
    maskedTokenPAN: string;
    expiryDate: string;
    cvv: string;
    walletType: 'apple_pay' | 'google_pay';
    status: 'active' | 'inactive' | 'suspended';
    createdDate: Date;
    deviceInfo: any;
}
