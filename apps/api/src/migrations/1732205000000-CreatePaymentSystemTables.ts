import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentSystemTables1732205000000 implements MigrationInterface {
  name = 'CreatePaymentSystemTables1732205000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create wallets table
    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "walletId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "currency" character varying(3) NOT NULL,
        "balance" decimal(20,8) NOT NULL DEFAULT 0,
        "availableBalance" decimal(20,8) NOT NULL DEFAULT 0,
        "pendingBalance" decimal(20,8) NOT NULL DEFAULT 0,
        "heldBalance" decimal(20,8) NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'active',
        "isPrimary" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "limits" jsonb,
        "lifetimeReceived" decimal(20,8) NOT NULL DEFAULT 0,
        "lifetimeSent" decimal(20,8) NOT NULL DEFAULT 0,
        "transactionCount" integer NOT NULL DEFAULT 0,
        "lastTransactionAt" timestamp,
        "frozenAt" timestamp,
        "frozenReason" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallets" PRIMARY KEY ("walletId")
      )
    `);

    // Create indexes for wallets
    await queryRunner.query(`CREATE INDEX "IDX_wallets_userId_currency" ON "wallets" ("userId", "currency")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallets_userId_currency_unique" ON "wallets" ("userId", "currency")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallets_status" ON "wallets" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallets_createdAt" ON "wallets" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallets_userId" ON "wallets" ("userId")`);

    // Create wallet_transactions table
    await queryRunner.query(`
      CREATE TABLE "wallet_transactions" (
        "transactionId" uuid NOT NULL,
        "walletId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "category" character varying NOT NULL,
        "amount" decimal(20,8) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "balanceBefore" decimal(20,8) NOT NULL,
        "balanceAfter" decimal(20,8) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "description" text,
        "counterpartyWalletId" uuid,
        "counterpartyUserId" uuid,
        "externalTransactionId" character varying(255),
        "referenceId" character varying(255),
        "metadata" jsonb,
        "paymentMethod" character varying(100),
        "paymentGateway" character varying(100),
        "completedAt" timestamp,
        "failedAt" timestamp,
        "failureReason" text,
        "errorCode" character varying(100),
        "reversedAt" timestamp,
        "reversalTransactionId" uuid,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallet_transactions" PRIMARY KEY ("transactionId")
      )
    `);

    // Create indexes for wallet_transactions
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_walletId_createdAt" ON "wallet_transactions" ("walletId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_userId_createdAt" ON "wallet_transactions" ("userId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_type" ON "wallet_transactions" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_status" ON "wallet_transactions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_referenceId" ON "wallet_transactions" ("referenceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_externalTransactionId" ON "wallet_transactions" ("externalTransactionId")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_walletId" ON "wallet_transactions" ("walletId")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_userId" ON "wallet_transactions" ("userId")`);

    // Create wallet_holds table
    await queryRunner.query(`
      CREATE TABLE "wallet_holds" (
        "holdId" uuid NOT NULL,
        "walletId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "amount" decimal(20,8) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "reason" character varying NOT NULL,
        "description" text,
        "referenceTransactionId" uuid,
        "expiresAt" timestamp,
        "metadata" jsonb,
        "releasedAt" timestamp,
        "capturedAt" timestamp,
        "capturedTransactionId" uuid,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallet_holds" PRIMARY KEY ("holdId")
      )
    `);

    // Create indexes for wallet_holds
    await queryRunner.query(`CREATE INDEX "IDX_wallet_holds_walletId_status" ON "wallet_holds" ("walletId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_holds_expiresAt" ON "wallet_holds" ("expiresAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_holds_walletId" ON "wallet_holds" ("walletId")`);

    // Create split_payments table
    await queryRunner.query(`
      CREATE TABLE "split_payments" (
        "splitPaymentId" uuid NOT NULL,
        "paymentId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "totalAmount" decimal(20,8) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "splitType" character varying NOT NULL DEFAULT 'percentage',
        "splitRules" jsonb NOT NULL,
        "actualSplits" jsonb,
        "platformFee" decimal(20,8),
        "splitConfigurationId" character varying(100),
        "metadata" jsonb,
        "description" text,
        "completedAt" timestamp,
        "failedAt" timestamp,
        "failureReason" text,
        "completedSplitsCount" integer NOT NULL DEFAULT 0,
        "failedSplitsCount" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_split_payments" PRIMARY KEY ("splitPaymentId")
      )
    `);

    // Create indexes for split_payments
    await queryRunner.query(`CREATE INDEX "IDX_split_payments_paymentId" ON "split_payments" ("paymentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_split_payments_userId" ON "split_payments" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_split_payments_status" ON "split_payments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_split_payments_createdAt" ON "split_payments" ("createdAt")`);

    // Create split_configurations table
    await queryRunner.query(`
      CREATE TABLE "split_configurations" (
        "configurationId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "splitType" character varying NOT NULL DEFAULT 'percentage',
        "splitRules" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "isDefault" boolean NOT NULL DEFAULT false,
        "conditions" jsonb,
        "usageCount" integer NOT NULL DEFAULT 0,
        "lastUsedAt" timestamp,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_split_configurations" PRIMARY KEY ("configurationId")
      )
    `);

    // Create indexes for split_configurations
    await queryRunner.query(`CREATE INDEX "IDX_split_configurations_userId_isActive" ON "split_configurations" ("userId", "isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_split_configurations_name" ON "split_configurations" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_split_configurations_userId" ON "split_configurations" ("userId")`);

    // Create virtual_accounts table
    await queryRunner.query(`
      CREATE TABLE "virtual_accounts" (
        "virtualAccountId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "walletId" uuid,
        "accountNumber" character varying(50) NOT NULL,
        "accountName" character varying(255),
        "bankName" character varying(255),
        "bankCode" character varying(50),
        "routingNumber" character varying(50),
        "iban" character varying(50),
        "swiftCode" character varying(50),
        "currency" character varying(3) NOT NULL,
        "country" character varying(2) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "accountType" character varying NOT NULL DEFAULT 'dedicated',
        "provider" character varying(100) NOT NULL,
        "providerId" character varying(255),
        "providerAccountId" character varying(255),
        "autoCredit" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "providerData" jsonb,
        "totalReceived" decimal(20,8) NOT NULL DEFAULT 0,
        "transactionCount" integer NOT NULL DEFAULT 0,
        "lastTransactionAt" timestamp,
        "activatedAt" timestamp,
        "suspendedAt" timestamp,
        "suspensionReason" text,
        "closedAt" timestamp,
        "expiresAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_virtual_accounts" PRIMARY KEY ("virtualAccountId"),
        CONSTRAINT "UQ_virtual_accounts_accountNumber" UNIQUE ("accountNumber")
      )
    `);

    // Create indexes for virtual_accounts
    await queryRunner.query(`CREATE INDEX "IDX_virtual_accounts_userId_currency" ON "virtual_accounts" ("userId", "currency")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_virtual_accounts_accountNumber" ON "virtual_accounts" ("accountNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_accounts_status" ON "virtual_accounts" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_accounts_providerId" ON "virtual_accounts" ("providerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_accounts_userId" ON "virtual_accounts" ("userId")`);

    // Create virtual_account_transactions table
    await queryRunner.query(`
      CREATE TABLE "virtual_account_transactions" (
        "transactionId" uuid NOT NULL,
        "virtualAccountId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "walletId" uuid,
        "walletTransactionId" uuid,
        "amount" decimal(20,8) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "senderAccountNumber" character varying(255),
        "senderAccountName" character varying(255),
        "senderBankName" character varying(255),
        "senderBankCode" character varying(100),
        "reference" character varying(255),
        "sessionId" character varying(255),
        "narration" text,
        "provider" character varying(100) NOT NULL,
        "providerTransactionId" character varying(255),
        "providerData" jsonb,
        "fee" decimal(20,8),
        "autoCredited" boolean NOT NULL DEFAULT false,
        "completedAt" timestamp,
        "failedAt" timestamp,
        "failureReason" text,
        "reversedAt" timestamp,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_virtual_account_transactions" PRIMARY KEY ("transactionId")
      )
    `);

    // Create indexes for virtual_account_transactions
    await queryRunner.query(`CREATE INDEX "IDX_virtual_account_transactions_virtualAccountId_createdAt" ON "virtual_account_transactions" ("virtualAccountId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_account_transactions_userId" ON "virtual_account_transactions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_account_transactions_status" ON "virtual_account_transactions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_account_transactions_providerTransactionId" ON "virtual_account_transactions" ("providerTransactionId")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_account_transactions_sessionId" ON "virtual_account_transactions" ("sessionId")`);
    await queryRunner.query(`CREATE INDEX "IDX_virtual_account_transactions_virtualAccountId" ON "virtual_account_transactions" ("virtualAccountId")`);

    // Create payment_gateways table
    await queryRunner.query(`
      CREATE TABLE "payment_gateways" (
        "gatewayId" uuid NOT NULL,
        "userId" uuid,
        "provider" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "credentialsEncrypted" text NOT NULL,
        "isLive" boolean NOT NULL DEFAULT true,
        "isActive" boolean NOT NULL DEFAULT true,
        "supportedCurrencies" jsonb,
        "supportedCountries" jsonb,
        "supportedPaymentMethods" jsonb,
        "configuration" jsonb,
        "feeConfiguration" jsonb,
        "totalProcessed" decimal(20,8) NOT NULL DEFAULT 0,
        "transactionCount" integer NOT NULL DEFAULT 0,
        "lastTransactionAt" timestamp,
        "lastHealthCheck" timestamp,
        "healthStatus" character varying(50) NOT NULL DEFAULT 'healthy',
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_gateways" PRIMARY KEY ("gatewayId")
      )
    `);

    // Create indexes for payment_gateways
    await queryRunner.query(`CREATE INDEX "IDX_payment_gateways_userId_provider" ON "payment_gateways" ("userId", "provider")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_gateways_isActive" ON "payment_gateways" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_gateways_userId" ON "payment_gateways" ("userId")`);

    // Create payment_transactions table
    await queryRunner.query(`
      CREATE TABLE "payment_transactions" (
        "transactionId" uuid NOT NULL,
        "userId" uuid,
        "merchantId" uuid,
        "gatewayId" uuid NOT NULL,
        "provider" character varying(100) NOT NULL,
        "amount" decimal(20,8) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "reference" character varying(255) NOT NULL,
        "providerReference" character varying(255),
        "paymentMethod" character varying(100) NOT NULL,
        "paymentChannel" character varying(100),
        "description" text,
        "customer" jsonb,
        "paymentDetails" jsonb,
        "fee" decimal(20,8),
        "netAmount" decimal(20,8),
        "callbackUrl" character varying(255),
        "redirectUrl" character varying(255),
        "authorizationUrl" character varying(500),
        "accessCode" character varying(500),
        "splitPaymentId" uuid,
        "walletTransactionId" uuid,
        "metadata" jsonb,
        "providerResponse" jsonb,
        "paidAt" timestamp,
        "failedAt" timestamp,
        "failureReason" text,
        "errorCode" character varying(100),
        "refundedAt" timestamp,
        "refundedAmount" decimal(20,8),
        "processingTimeMs" integer,
        "ipAddress" character varying(100),
        "userAgent" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_transactions" PRIMARY KEY ("transactionId"),
        CONSTRAINT "UQ_payment_transactions_reference" UNIQUE ("reference")
      )
    `);

    // Create indexes for payment_transactions
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_userId_createdAt" ON "payment_transactions" ("userId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_merchantId_createdAt" ON "payment_transactions" ("merchantId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_gatewayId" ON "payment_transactions" ("gatewayId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_status" ON "payment_transactions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_reference" ON "payment_transactions" ("reference")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_providerReference" ON "payment_transactions" ("providerReference")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_userId" ON "payment_transactions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_merchantId" ON "payment_transactions" ("merchantId")`);

    // Create payment_links table
    await queryRunner.query(`
      CREATE TABLE "payment_links" (
        "linkId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "code" character varying(100) NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "amountType" character varying NOT NULL DEFAULT 'fixed',
        "amount" decimal(20,8),
        "currency" character varying(3) NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "status" character varying NOT NULL DEFAULT 'active',
        "allowedPaymentMethods" jsonb,
        "redirectUrl" character varying(255),
        "collectCustomerInfo" boolean NOT NULL DEFAULT false,
        "customFields" jsonb,
        "logoUrl" character varying(500),
        "brandColor" character varying(50),
        "maxPayments" integer,
        "paymentCount" integer NOT NULL DEFAULT 0,
        "totalCollected" decimal(20,8) NOT NULL DEFAULT 0,
        "expiresAt" timestamp,
        "splitConfigurationId" uuid,
        "metadata" jsonb,
        "lastPaymentAt" timestamp,
        "viewCount" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_links" PRIMARY KEY ("linkId"),
        CONSTRAINT "UQ_payment_links_code" UNIQUE ("code")
      )
    `);

    // Create indexes for payment_links
    await queryRunner.query(`CREATE INDEX "IDX_payment_links_userId" ON "payment_links" ("userId")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_payment_links_code" ON "payment_links" ("code")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_links_status" ON "payment_links" ("status")`);

    // Create recurring_payments table
    await queryRunner.query(`
      CREATE TABLE "recurring_payments" (
        "recurringPaymentId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "merchantId" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "amount" decimal(20,8) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "frequency" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "startDate" date NOT NULL,
        "endDate" date,
        "nextPaymentDate" date NOT NULL,
        "maxPayments" integer,
        "paymentsMade" integer NOT NULL DEFAULT 0,
        "failedPayments" integer NOT NULL DEFAULT 0,
        "successfulPayments" integer NOT NULL DEFAULT 0,
        "paymentMethod" character varying(100) NOT NULL,
        "paymentMethodEncrypted" text NOT NULL,
        "gatewayId" uuid NOT NULL,
        "provider" character varying(100) NOT NULL,
        "authorizationCode" character varying(255),
        "retryAttempts" integer NOT NULL DEFAULT 0,
        "maxRetryAttempts" integer NOT NULL DEFAULT 3,
        "totalCollected" decimal(20,8) NOT NULL DEFAULT 0,
        "metadata" jsonb,
        "lastPaymentAt" timestamp,
        "lastFailureAt" timestamp,
        "lastFailureReason" text,
        "pausedAt" timestamp,
        "cancelledAt" timestamp,
        "cancellationReason" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_recurring_payments" PRIMARY KEY ("recurringPaymentId")
      )
    `);

    // Create indexes for recurring_payments
    await queryRunner.query(`CREATE INDEX "IDX_recurring_payments_userId" ON "recurring_payments" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_recurring_payments_merchantId" ON "recurring_payments" ("merchantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_recurring_payments_status" ON "recurring_payments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_recurring_payments_nextPaymentDate" ON "recurring_payments" ("nextPaymentDate")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "recurring_payments"`);
    await queryRunner.query(`DROP TABLE "payment_links"`);
    await queryRunner.query(`DROP TABLE "payment_transactions"`);
    await queryRunner.query(`DROP TABLE "payment_gateways"`);
    await queryRunner.query(`DROP TABLE "virtual_account_transactions"`);
    await queryRunner.query(`DROP TABLE "virtual_accounts"`);
    await queryRunner.query(`DROP TABLE "split_configurations"`);
    await queryRunner.query(`DROP TABLE "split_payments"`);
    await queryRunner.query(`DROP TABLE "wallet_holds"`);
    await queryRunner.query(`DROP TABLE "wallet_transactions"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
  }
}
