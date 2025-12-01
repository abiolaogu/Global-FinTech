import { Intent } from './ai-intent.service';
export interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
    message: string;
    requiresConfirmation?: boolean;
    confirmationData?: any;
}
export declare class ActionExecutorService {
    private readonly logger;
    constructor();
    executeAction(intent: Intent, userId: string, context?: any): Promise<ActionResult>;
    private executeSendMoney;
    private executeCheckBalance;
    private executeViewTransactions;
    private executeInvest;
    private executeViewInvestments;
    private executeSearchInvestments;
    private executeCreateRosca;
    private executeJoinRosca;
    private executeViewRosca;
    private executeApplyLoan;
    private executeLendMoney;
    private executeViewLoans;
    private executeUpdateProfile;
    private executeAddPaymentMethod;
    private executeVerifyKYC;
    private executeGetHelp;
    private executeFAQ;
}
