"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ActionExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionExecutorService = void 0;
const common_1 = require("@nestjs/common");
let ActionExecutorService = ActionExecutorService_1 = class ActionExecutorService {
    constructor() {
        this.logger = new common_1.Logger(ActionExecutorService_1.name);
    }
    async executeAction(intent, userId, context) {
        this.logger.debug(`Executing action for intent: ${intent.name}`);
        try {
            switch (intent.name) {
                case 'send_money':
                    return await this.executeSendMoney(intent, userId);
                case 'check_balance':
                    return await this.executeCheckBalance(intent, userId);
                case 'view_transactions':
                    return await this.executeViewTransactions(intent, userId);
                case 'invest':
                    return await this.executeInvest(intent, userId);
                case 'view_investments':
                    return await this.executeViewInvestments(intent, userId);
                case 'search_investments':
                    return await this.executeSearchInvestments(intent, userId);
                case 'create_rosca':
                    return await this.executeCreateRosca(intent, userId);
                case 'join_rosca':
                    return await this.executeJoinRosca(intent, userId);
                case 'view_rosca':
                    return await this.executeViewRosca(intent, userId);
                case 'apply_loan':
                    return await this.executeApplyLoan(intent, userId);
                case 'lend_money':
                    return await this.executeLendMoney(intent, userId);
                case 'view_loans':
                    return await this.executeViewLoans(intent, userId);
                case 'update_profile':
                    return await this.executeUpdateProfile(intent, userId);
                case 'add_payment_method':
                    return await this.executeAddPaymentMethod(intent, userId);
                case 'verify_kyc':
                    return await this.executeVerifyKYC(intent, userId);
                case 'get_help':
                    return await this.executeGetHelp(intent, userId);
                case 'faq':
                    return await this.executeFAQ(intent, userId);
                default:
                    return {
                        success: false,
                        error: 'Unknown intent',
                        message: 'I\'m not sure how to help with that. Can you try rephrasing?',
                    };
            }
        }
        catch (error) {
            this.logger.error(`Error executing action: ${error.message}`, error.stack);
            return {
                success: false,
                error: error.message,
                message: 'Sorry, I encountered an error while processing your request.',
            };
        }
    }
    async executeSendMoney(intent, userId) {
        const { amount, recipient, currency } = intent.entities;
        if (!amount || !recipient) {
            return {
                success: false,
                message: 'I need both an amount and a recipient to send money. Could you provide both?',
            };
        }
        return {
            success: true,
            requiresConfirmation: true,
            message: `Ready to send ${(currency === null || currency === void 0 ? void 0 : currency.value) || 'USD'} ${amount.value} to ${recipient.value}. Please confirm this transaction.`,
            confirmationData: {
                action: 'send_money',
                amount: amount.value,
                currency: (currency === null || currency === void 0 ? void 0 : currency.value) || 'USD',
                recipient: recipient.value,
            },
        };
    }
    async executeCheckBalance(intent, userId) {
        var _a;
        const accountType = ((_a = intent.entities.account_type) === null || _a === void 0 ? void 0 : _a.value) || 'main';
        const mockBalances = {
            main: { amount: '5,420.50', currency: 'USD' },
            investment: { amount: '12,850.00', currency: 'USD' },
            rosca: { amount: '2,400.00', currency: 'USD' },
        };
        const balance = mockBalances[accountType] || mockBalances.main;
        return {
            success: true,
            data: {
                accountType,
                balance: balance.amount,
                currency: balance.currency,
            },
            message: `Your ${accountType} wallet balance is ${balance.currency} ${balance.amount}`,
        };
    }
    async executeViewTransactions(intent, userId) {
        var _a, _b;
        const dateRange = ((_a = intent.entities.date_range) === null || _a === void 0 ? void 0 : _a.value) || '30d';
        const limit = ((_b = intent.entities.limit) === null || _b === void 0 ? void 0 : _b.value) || 10;
        const mockTransactions = [
            {
                id: 'txn_001',
                type: 'payment',
                amount: '-$50.00',
                description: 'Payment to @john',
                date: '2025-11-15',
                status: 'completed',
            },
            {
                id: 'txn_002',
                type: 'investment',
                amount: '-$500.00',
                description: 'Investment in Tech Growth Fund',
                date: '2025-11-14',
                status: 'completed',
            },
            {
                id: 'txn_003',
                type: 'rosca',
                amount: '-$200.00',
                description: 'ROSCA contribution - Monthly Circle',
                date: '2025-11-13',
                status: 'completed',
            },
        ];
        return {
            success: true,
            data: {
                transactions: mockTransactions.slice(0, limit),
                dateRange,
                total: mockTransactions.length,
            },
            message: `Here are your recent transactions from the ${dateRange}:`,
        };
    }
    async executeInvest(intent, userId) {
        const { amount, investment_name, currency } = intent.entities;
        if (!amount) {
            return {
                success: false,
                message: 'How much would you like to invest?',
            };
        }
        if (!investment_name) {
            return {
                success: false,
                message: 'What would you like to invest in? You can search for opportunities by saying "search tech investments" or "find low risk bonds".',
            };
        }
        return {
            success: true,
            requiresConfirmation: true,
            message: `Ready to invest ${(currency === null || currency === void 0 ? void 0 : currency.value) || 'USD'} ${amount.value} in ${investment_name.value}. Let me show you the details.`,
            confirmationData: {
                action: 'invest',
                amount: amount.value,
                currency: (currency === null || currency === void 0 ? void 0 : currency.value) || 'USD',
                investmentName: investment_name.value,
            },
        };
    }
    async executeViewInvestments(intent, userId) {
        const mockPortfolio = {
            totalValue: '$12,850.00',
            totalInvested: '$10,000.00',
            totalReturn: '$2,850.00',
            returnPercentage: '+28.5%',
            holdings: [
                {
                    name: 'Tech Growth Fund',
                    value: '$5,200.00',
                    invested: '$4,000.00',
                    return: '+30%',
                },
                {
                    name: 'Global Bonds ETF',
                    value: '$4,150.00',
                    invested: '$4,000.00',
                    return: '+3.75%',
                },
                {
                    name: 'Real Estate REIT',
                    value: '$3,500.00',
                    invested: '$2,000.00',
                    return: '+75%',
                },
            ],
        };
        return {
            success: true,
            data: mockPortfolio,
            message: `Your investment portfolio value is ${mockPortfolio.totalValue} (${mockPortfolio.returnPercentage}). You have ${mockPortfolio.holdings.length} active investments.`,
        };
    }
    async executeSearchInvestments(intent, userId) {
        const { category, risk_level, min_amount, max_amount } = intent.entities;
        const mockResults = [
            {
                id: 'inv_001',
                title: 'Tech Growth Fund',
                category: 'mutual_funds',
                riskLevel: 'moderate',
                minInvestment: '$100',
                projectedReturn: '12-15%',
                rating: 4.5,
            },
            {
                id: 'inv_002',
                title: 'Emerging Markets ETF',
                category: 'etf',
                riskLevel: 'high',
                minInvestment: '$50',
                projectedReturn: '15-20%',
                rating: 4.2,
            },
            {
                id: 'inv_003',
                title: 'Government Bonds',
                category: 'bonds',
                riskLevel: 'very_low',
                minInvestment: '$1,000',
                projectedReturn: '3-5%',
                rating: 4.8,
            },
        ];
        let filteredResults = mockResults;
        if (category) {
            filteredResults = filteredResults.filter((r) => r.category === category.value);
        }
        if (risk_level) {
            filteredResults = filteredResults.filter((r) => r.riskLevel === risk_level.value);
        }
        return {
            success: true,
            data: {
                results: filteredResults,
                filters: { category: category === null || category === void 0 ? void 0 : category.value, riskLevel: risk_level === null || risk_level === void 0 ? void 0 : risk_level.value },
            },
            message: `I found ${filteredResults.length} investment opportunities matching your criteria.`,
        };
    }
    async executeCreateRosca(intent, userId) {
        return {
            success: true,
            requiresConfirmation: true,
            message: 'To create a ROSCA circle, I need a few details:\n1. Contribution amount\n2. Payment frequency (weekly/monthly)\n3. Maximum members\n4. Circle type (fixed rotation/bidding/random)\n\nWhat would you like for each?',
            confirmationData: {
                action: 'create_rosca',
                step: 'gather_details',
            },
        };
    }
    async executeJoinRosca(intent, userId) {
        var _a;
        const roscaName = (_a = intent.entities.rosca_name) === null || _a === void 0 ? void 0 : _a.value;
        const mockCircles = [
            {
                id: 'rosca_001',
                name: 'Monthly Savers Circle',
                contribution: '$200/month',
                members: '8/12',
                nextPayout: '2025-11-20',
            },
            {
                id: 'rosca_002',
                name: 'Weekly Cash Flow',
                contribution: '$50/week',
                members: '15/20',
                nextPayout: '2025-11-18',
            },
        ];
        if (roscaName) {
            const circle = mockCircles.find((c) => c.name.toLowerCase().includes(roscaName.toLowerCase()));
            if (circle) {
                return {
                    success: true,
                    requiresConfirmation: true,
                    data: circle,
                    message: `Found "${circle.name}". Contribution: ${circle.contribution}, Members: ${circle.members}. Would you like to join?`,
                    confirmationData: {
                        action: 'join_rosca',
                        circleId: circle.id,
                    },
                };
            }
        }
        return {
            success: true,
            data: { circles: mockCircles },
            message: `Here are some popular ROSCA circles you can join. Which one interests you?`,
        };
    }
    async executeViewRosca(intent, userId) {
        const mockUserCircles = [
            {
                id: 'rosca_001',
                name: 'Monthly Savers Circle',
                role: 'member',
                contribution: '$200',
                nextContribution: '2025-12-01',
                totalContributed: '$1,400',
                status: 'active',
            },
            {
                id: 'rosca_003',
                name: 'Tech Professionals Esusu',
                role: 'organizer',
                contribution: '$500',
                nextPayout: '2025-11-25',
                members: '10/15',
                status: 'active',
            },
        ];
        return {
            success: true,
            data: { circles: mockUserCircles },
            message: `You are part of ${mockUserCircles.length} ROSCA circles. Here are the details:`,
        };
    }
    async executeApplyLoan(intent, userId) {
        const { amount, purpose, term } = intent.entities;
        if (!amount) {
            return {
                success: false,
                message: 'How much would you like to borrow?',
            };
        }
        return {
            success: true,
            requiresConfirmation: true,
            message: `I can help you apply for a loan of ${amount.value}. Based on your credit score, you may qualify for:\n- Interest rate: 8-12% APR\n- Term: 6-36 months\n- Monthly payment: Estimated $${(amount.value / 24).toFixed(2)}\n\nWould you like to proceed with the application?`,
            confirmationData: {
                action: 'apply_loan',
                amount: amount.value,
                purpose: purpose === null || purpose === void 0 ? void 0 : purpose.value,
            },
        };
    }
    async executeLendMoney(intent, userId) {
        const { amount, risk_level, auto_invest } = intent.entities;
        return {
            success: true,
            message: 'Great! You can lend money through our P2P platform. Would you like to:\n1. Auto-invest (diversified across multiple loans)\n2. Choose specific loans to fund\n3. Set up recurring lending',
        };
    }
    async executeViewLoans(intent, userId) {
        const mockLoans = {
            borrowed: [
                {
                    id: 'loan_001',
                    amount: '$5,000',
                    outstanding: '$3,200',
                    rate: '10% APR',
                    nextPayment: '2025-12-01',
                    monthlyPayment: '$220',
                },
            ],
            lent: [
                {
                    id: 'loan_002',
                    amount: '$2,000',
                    outstanding: '$1,800',
                    rate: '12% APR',
                    expectedReturn: '$240',
                },
            ],
        };
        return {
            success: true,
            data: mockLoans,
            message: `You have ${mockLoans.borrowed.length} active loan(s) and have lent in ${mockLoans.lent.length} loan(s).`,
        };
    }
    async executeUpdateProfile(intent, userId) {
        return {
            success: true,
            message: 'I can help you update your profile. What would you like to change? (email, phone, address, password)',
        };
    }
    async executeAddPaymentMethod(intent, userId) {
        return {
            success: true,
            message: 'What type of payment method would you like to add?\n1. Bank account\n2. Debit/Credit card\n3. Mobile money (M-Pesa, GCash, etc.)\n4. Zelle/Cash App',
        };
    }
    async executeVerifyKYC(intent, userId) {
        return {
            success: true,
            message: 'KYC verification helps increase your transaction limits. What level would you like?\n- Tier 1: $500/day (phone + email)\n- Tier 2: $5,000/day (+ ID document)\n- Tier 3: Unlimited (+ address proof + selfie)',
        };
    }
    async executeGetHelp(intent, userId) {
        var _a;
        const topic = (_a = intent.entities.topic) === null || _a === void 0 ? void 0 : _a.value;
        const helpTopics = {
            default: `I can help you with:
💰 Send & receive money
📊 Check balances & transactions
💼 Invest in opportunities
🔄 Join ROSCA circles
💳 Apply for loans or lend money
👤 Manage your profile & KYC
❓ Answer questions about fees & limits

What would you like to do?`,
            fees: 'AtlasX fees:\n- Money transfers: 0.5-1.5%\n- Investments: 1.5% management fee\n- ROSCA: 1.5% platform fee\n- P2P loans: 1% origination fee',
            limits: 'Transaction limits based on KYC:\n- Tier 1: $500/day\n- Tier 2: $5,000/day\n- Tier 3: Unlimited',
        };
        return {
            success: true,
            message: helpTopics[topic] || helpTopics.default,
        };
    }
    async executeFAQ(intent, userId) {
        var _a;
        const category = (_a = intent.entities.question_category) === null || _a === void 0 ? void 0 : _a.value;
        return {
            success: true,
            message: 'I can answer questions about fees, limits, security, KYC, and more. What would you like to know?',
        };
    }
};
exports.ActionExecutorService = ActionExecutorService;
exports.ActionExecutorService = ActionExecutorService = ActionExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ActionExecutorService);
//# sourceMappingURL=action-executor.service.js.map