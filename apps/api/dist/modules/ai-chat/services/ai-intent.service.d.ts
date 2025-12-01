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
export declare class AIIntentService {
    private readonly logger;
    private intentPatterns;
    detectIntent(message: string, context?: any): Promise<Intent>;
    private extractEntities;
    private extractAmount;
    private extractCurrency;
    private extractRecipient;
    private extractDateRange;
    private extractAccountType;
    private extractInvestmentName;
    private extractCategory;
    private extractRiskLevel;
    private extractEntitiesFromMatch;
    generateResponse(intent: Intent, context?: any): string;
    private generateSendMoneyResponse;
    private generateBalanceResponse;
    private generateInvestResponse;
    private generateSearchInvestmentsResponse;
    private generateJoinRoscaResponse;
    private generateLoanResponse;
}
