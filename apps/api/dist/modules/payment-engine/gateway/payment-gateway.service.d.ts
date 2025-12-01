import { ISO8583Parser } from '../iso8583/iso8583-parser.service';
import { TransactionSwitch } from '../switch/transaction-switch.service';
import { HSMService } from '../security/hsm.service';
import { ATMPOSHandler } from '../terminals/atm-pos-handler.service';
export declare class PaymentGatewayService {
    private readonly iso8583Parser;
    private readonly transactionSwitch;
    private readonly hsmService;
    private readonly atmPosHandler;
    private readonly logger;
    constructor(iso8583Parser: ISO8583Parser, transactionSwitch: TransactionSwitch, hsmService: HSMService, atmPosHandler: ATMPOSHandler);
    processPayment(request: PaymentRequest): Promise<PaymentResponse>;
    process3DSecure(request: ThreeDSecureRequest): Promise<ThreeDSecureResponse>;
    processRefund(originalTransactionId: string, amount?: number): Promise<PaymentResponse>;
    tokenizeCard(request: TokenizeRequest): Promise<TokenizeResponse>;
    processTokenPayment(request: TokenPaymentRequest): Promise<PaymentResponse>;
    private validatePaymentRequest;
    private buildISO8583FromPayment;
    private parseISO8583ToPayment;
    private buildRefundMessage;
    private check3DSEnrollment;
    private initiate3DSAuth;
    private sendWebhookNotification;
    private generateTransactionId;
    private generateSTAN;
    private generateToken;
    private formatDateTime;
    private formatTime;
    private formatDate;
    private validateLuhn;
    private validateExpiry;
    private maskPAN;
    private getCardType;
    private getResponseMessage;
}
export interface PaymentRequest {
    merchantId: string;
    amount: number;
    currency?: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName?: string;
    billingAddress?: any;
    isEcommerce?: boolean;
    terminalId?: string;
    description?: string;
    metadata?: any;
}
export interface PaymentResponse {
    transactionId: string;
    approved: boolean;
    responseCode: string;
    responseMessage: string;
    authorizationCode?: string;
    processingTime?: number;
    timestamp: Date;
}
export interface ThreeDSecureRequest {
    cardNumber: string;
    amount: number;
    currency: string;
    merchantId: string;
}
export interface ThreeDSecureResponse {
    authenticated: boolean;
    eci: string;
    cavv: string | null;
    xid: string | null;
    acsUrl?: string;
    paReq?: string;
}
export interface TokenizeRequest {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName?: string;
}
export interface TokenizeResponse {
    token: string;
    maskedCardNumber: string;
    cardType: string;
    expiryMonth: string;
    expiryYear: string;
}
export interface TokenPaymentRequest extends Omit<PaymentRequest, 'cardNumber' | 'expiryMonth' | 'expiryYear' | 'cvv'> {
    token: string;
}
