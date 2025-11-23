# SMS/USSD Sync Architecture

## Overview

This document describes the architecture for enabling offline wallet synchronization using SMS and USSD channels when internet connectivity is unavailable. The system provides a multi-channel sync mechanism with automatic fallback.

## Architecture Components

### 1. Multi-Channel Sync Strategy

```
Priority Order:
1. Internet (HTTP/HTTPS) - Primary channel
2. SMS - Secondary channel (fallback)
3. USSD - Tertiary channel (fallback for feature phones)
```

### 2. Channel Selection Algorithm

```
if (has_internet_connection) {
  use HTTP sync
} else if (has_sms_capability && sms_balance > 0) {
  use SMS sync
} else if (has_ussd_capability) {
  use USSD sync
} else {
  queue for later sync
}
```

## SMS Sync Protocol

### Message Format

**Command Structure:**
```
#GFT#<VERSION>#<USER_ID>#<COMMAND>#<DATA>#<CHECKSUM>
```

**Components:**
- `#GFT#`: Protocol identifier
- `VERSION`: Protocol version (e.g., 1.0)
- `USER_ID`: Encrypted user identifier
- `COMMAND`: Operation code
- `DATA`: Encrypted payload (base64)
- `CHECKSUM`: SHA-256 hash for integrity

### SMS Commands

#### 1. Sync Wallet Balance
```
Request:  #GFT#1.0#USER123#SYNC_WALLET#WalletIdEncrypted#CHECKSUM
Response: #GFT#1.0#OK#Balance:1000.50,Available:950.00#CHECKSUM
```

#### 2. Submit Transaction
```
Request:  #GFT#1.0#USER123#TXN#TxnDataEncrypted#CHECKSUM
Response: #GFT#1.0#OK#TXN_ID:abc123,Status:pending#CHECKSUM
```

#### 3. Check Sync Status
```
Request:  #GFT#1.0#USER123#STATUS#QueueIdEncrypted#CHECKSUM
Response: #GFT#1.0#OK#Pending:5,Failed:0,Synced:20#CHECKSUM
```

#### 4. Top-up Wallet
```
Request:  #GFT#1.0#USER123#TOPUP#Amount:100,WalletId:xxx#CHECKSUM
Response: #GFT#1.0#OK#TopupId:top123,NewBalance:1100.50#CHECKSUM
```

#### 5. Check Credit Line
```
Request:  #GFT#1.0#USER123#CREDIT#WalletId:xxx#CHECKSUM
Response: #GFT#1.0#OK#Limit:5000,Used:1200,Available:3800#CHECKSUM
```

### Error Responses
```
#GFT#1.0#ERROR#Code:401,Message:Unauthorized#CHECKSUM
#GFT#1.0#ERROR#Code:400,Message:Invalid format#CHECKSUM
#GFT#1.0#ERROR#Code:429,Message:Rate limit exceeded#CHECKSUM
```

## USSD Sync Protocol

### USSD Menu Structure

```
*384*YOUR_CODE#

Main Menu:
1. Check Balance
2. Send Money
3. Sync Transactions
4. Top-up Wallet
5. Check Credit
6. Transaction History

Example Flow:
*384*CODE# → Main Menu
Select 1 → Enter PIN
Response: "Balance: $1,000.50\nAvailable: $950.00\n1.Back 2.Exit"
```

### USSD Session Management

```
Session States:
- INITIATED: User dials USSD code
- AUTHENTICATED: PIN verified
- IN_PROGRESS: User navigating menu
- AWAITING_INPUT: Waiting for user input
- COMPLETED: Operation finished
- TIMEOUT: Session expired (30 seconds)
```

### USSD Commands

#### 1. Balance Check
```
User: *384*CODE*1*PIN#
Response: "Wallet: USD\nBalance: $1,000.50\nAvailable: $950.00\nPending: $50.00"
```

#### 2. Sync Transactions
```
User: *384*CODE*3*PIN#
Response: "Syncing...\nPending: 5\nSynced: 20\nFailed: 0\nPress 1 to retry failed"
```

#### 3. Top-up Wallet
```
User: *384*CODE*4*PIN*AMOUNT#
Response: "Top-up initiated\nAmount: $100\nNew Balance: $1,100.50\nRef: TOP123"
```

#### 4. Credit Line Check
```
User: *384*CODE*5*PIN#
Response: "Credit Line\nLimit: $5,000\nUsed: $1,200\nAvailable: $3,800"
```

## Data Security

### SMS Encryption

1. **Payload Encryption**: AES-256-GCM
   - User data encrypted before transmission
   - Unique IV for each message
   - Authentication tag for integrity

2. **Checksum**: SHA-256
   - Ensures message integrity
   - Prevents tampering

3. **User ID Obfuscation**
   - Hash-based user identification
   - No PII in SMS content

### USSD Security

1. **PIN Authentication**
   - Required for all operations
   - Max 3 attempts before lockout
   - Session-based authentication

2. **Session Token**
   - Unique token per USSD session
   - Expires after 30 seconds of inactivity
   - One-time use tokens

3. **Rate Limiting**
   - Max 10 USSD requests per hour per user
   - Prevents abuse and fraud

## Backend Architecture

### Components Required

#### 1. SMS Gateway Integration
```typescript
@Module({
  imports: [TwilioModule, AfricasTalkingModule, TermiiModule],
  providers: [SmsGatewayService, SmsCommandParser],
  controllers: [SmsWebhookController],
})
export class SmsGatewayModule {}
```

#### 2. USSD Gateway Integration
```typescript
@Module({
  imports: [AfricasTalkingModule, HubtelModule],
  providers: [UssdGatewayService, UssdSessionManager],
  controllers: [UssdWebhookController],
})
export class UssdGatewayModule {}
```

#### 3. Wallet Top-up Service
```typescript
@Injectable()
export class WalletTopupService {
  // Initiate top-up from main account
  async initiateTopup(dto: TopupWalletDto): Promise<TopupEntity>

  // Process top-up completion
  async completeTopup(topupId: string): Promise<WalletEntity>

  // Reverse failed top-up
  async reverseTopup(topupId: string): Promise<void>
}
```

#### 4. Credit Line Service
```typescript
@Injectable()
export class CreditLineService {
  // Allocate credit line to user
  async allocateCreditLine(userId: string, limit: number): Promise<CreditLineEntity>

  // Check available credit
  async getAvailableCredit(userId: string): Promise<number>

  // Use credit line
  async useCredit(userId: string, amount: number): Promise<void>

  // Repay credit
  async repayCredit(userId: string, amount: number): Promise<void>
}
```

### Database Schema Updates

#### Updated Wallet Entity
```sql
ALTER TABLE wallets ADD COLUMN credit_limit DECIMAL(20,8) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN credit_used DECIMAL(20,8) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN credit_available DECIMAL(20,8) GENERATED ALWAYS AS (credit_limit - credit_used) STORED;
ALTER TABLE wallets ADD COLUMN offline_spend_limit DECIMAL(20,8) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN last_sms_sync_at TIMESTAMP;
ALTER TABLE wallets ADD COLUMN last_ussd_sync_at TIMESTAMP;
```

#### Wallet Top-ups Table
```sql
CREATE TABLE wallet_topups (
  topup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
  user_id UUID NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  source_account_id UUID,
  source_type VARCHAR(50) NOT NULL, -- 'bank_account', 'card', 'main_wallet'
  status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'reversed'
  channel VARCHAR(50) NOT NULL, -- 'internet', 'sms', 'ussd'
  reference VARCHAR(255) UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_topups_wallet (wallet_id),
  INDEX idx_topups_user (user_id),
  INDEX idx_topups_status (status),
  INDEX idx_topups_reference (reference)
);
```

#### Credit Lines Table
```sql
CREATE TABLE credit_lines (
  credit_line_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  wallet_id UUID REFERENCES wallets(wallet_id),
  credit_limit DECIMAL(20,8) NOT NULL DEFAULT 0,
  credit_used DECIMAL(20,8) NOT NULL DEFAULT 0,
  credit_available DECIMAL(20,8) GENERATED ALWAYS AS (credit_limit - credit_used) STORED,
  interest_rate DECIMAL(5,2) DEFAULT 0, -- Annual percentage rate
  grace_period_days INTEGER DEFAULT 30,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'closed'
  allocated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  next_payment_due TIMESTAMP,
  INDEX idx_credit_user (user_id),
  INDEX idx_credit_wallet (wallet_id),
  INDEX idx_credit_status (status)
);
```

#### SMS Sync Log Table
```sql
CREATE TABLE sms_sync_log (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
  command VARCHAR(50),
  message_body TEXT,
  encrypted_payload TEXT,
  response TEXT,
  status VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'failed', 'processed'
  sms_gateway VARCHAR(50),
  cost DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  INDEX idx_sms_user (user_id),
  INDEX idx_sms_phone (phone_number),
  INDEX idx_sms_status (status),
  INDEX idx_sms_created (created_at)
);
```

#### USSD Sessions Table
```sql
CREATE TABLE ussd_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  phone_number VARCHAR(20) NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  current_menu VARCHAR(50),
  menu_state JSONB, -- Store menu navigation state
  authenticated BOOLEAN DEFAULT FALSE,
  pin_attempts INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL, -- 'active', 'completed', 'timeout', 'terminated'
  ussd_gateway VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  last_interaction_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  INDEX idx_ussd_token (session_token),
  INDEX idx_ussd_phone (phone_number),
  INDEX idx_ussd_status (status),
  INDEX idx_ussd_expires (expires_at)
);
```

## Mobile App Architecture

### New Services

#### 1. SMS Sync Service
```dart
class SmsSyncService {
  // Send SMS command
  Future<SmsResponse> sendCommand(SmsCommand command);

  // Parse SMS response
  SmsResponse parseResponse(String message);

  // Listen for SMS responses
  Stream<SmsResponse> listenForResponses();

  // Generate encrypted payload
  String encryptPayload(Map<String, dynamic> data);
}
```

#### 2. USSD Sync Service
```dart
class UssdSyncService {
  // Initiate USSD session
  Future<void> initiateSession(String ussdCode);

  // Send USSD response
  Future<UssdResponse> sendResponse(String input);

  // Parse USSD menu
  UssdMenu parseMenu(String response);
}
```

#### 3. Wallet Top-up Service
```dart
class WalletTopupService {
  // Initiate wallet top-up
  Future<TopupResult> topupWallet({
    required String walletId,
    required double amount,
    required String sourceType,
    String? sourceAccountId,
  });

  // Check top-up status
  Future<TopupStatus> checkTopupStatus(String topupId);
}
```

#### 4. Credit Line Service
```dart
class CreditLineService {
  // Get available credit
  Future<CreditLineInfo> getCreditInfo(String userId);

  // Use credit line
  Future<CreditTransaction> useCredit({
    required String walletId,
    required double amount,
    required String purpose,
  });

  // Repay credit
  Future<RepaymentResult> repayCredit({
    required String walletId,
    required double amount,
  });
}
```

### Updated Models

#### Offline Wallet with Credit Line
```dart
class OfflineWallet {
  // Existing fields
  String walletId;
  double balance;
  double availableBalance;

  // New fields
  double creditLimit;
  double creditUsed;
  double creditAvailable;
  double offlineSpendLimit;
  DateTime? lastSmsSyncAt;
  DateTime? lastUssdSyncAt;

  // Credit line methods
  bool canUseCredit(double amount);
  void useCredit(double amount);
  void repayCredit(double amount);
}
```

## Sync Flow Diagrams

### Internet Sync Flow
```
User Action → Local DB → Internet Available? → Yes → HTTP API
                            ↓
                           No → Queue for SMS/USSD
```

### SMS Sync Flow
```
User Action → Local DB → Generate SMS Command → Encrypt Payload
    ↓
Send SMS → SMS Gateway → Backend API → Process Command
    ↓
Response SMS ← SMS Gateway ← Backend API ← Command Result
    ↓
Parse Response → Decrypt → Update Local DB → Update UI
```

### USSD Sync Flow
```
User Dials USSD → USSD Gateway → Backend API → Authenticate
    ↓
Show Menu → User Selects → Backend Processes → Show Result
    ↓
User Confirms → Update Backend → USSD Response → End Session
    ↓
Background Sync → Update Local DB → Update UI
```

## Cost Optimization

### SMS Cost Management
1. **Batching**: Combine multiple operations into single SMS when possible
2. **Compression**: Use data compression for large payloads
3. **Delta Sync**: Only sync changes, not full data
4. **User Limits**: Daily/monthly SMS sync limits per user

### USSD Cost Management
1. **Session Timeout**: 30-second inactivity timeout
2. **Menu Optimization**: Minimal menu depth (max 3 levels)
3. **Caching**: Cache frequently accessed data
4. **Rate Limiting**: Prevent abuse

## Implementation Priorities

### Phase 1: Core Infrastructure (Backend)
1. ✅ Update wallet entity with credit line fields
2. ✅ Create wallet top-up service
3. ✅ Create credit line service
4. ✅ Create database migrations

### Phase 2: SMS Integration
1. ✅ Implement SMS gateway service
2. ✅ Create SMS command parser
3. ✅ Implement SMS webhook controller
4. ✅ Add SMS encryption/decryption

### Phase 3: USSD Integration
1. ✅ Implement USSD gateway service
2. ✅ Create USSD session manager
3. ✅ Implement USSD webhook controller
4. ✅ Design USSD menu structure

### Phase 4: Mobile App
1. ✅ Implement SMS sync service
2. ✅ Implement USSD sync service
3. ✅ Update wallet models with credit line
4. ✅ Create wallet top-up UI
5. ✅ Update sync service for multi-channel

### Phase 5: Testing & Optimization
1. Test SMS sync with multiple gateways
2. Test USSD flows on different networks
3. Load testing for concurrent sessions
4. Security audit for SMS/USSD channels

## Security Considerations

### SMS Security Risks & Mitigations

**Risk**: SMS interception
**Mitigation**: End-to-end encryption, payload obfuscation

**Risk**: SIM swap attacks
**Mitigation**: Multi-factor authentication, transaction limits

**Risk**: SMS spoofing
**Mitigation**: Sender verification, checksum validation

### USSD Security Risks & Mitigations

**Risk**: Unauthorized access
**Mitigation**: PIN authentication, session timeouts

**Risk**: Session hijacking
**Mitigation**: One-time session tokens, encryption

**Risk**: Brute force attacks
**Mitigation**: Rate limiting, account lockout after 3 failed attempts

## Monitoring & Analytics

### Metrics to Track
1. SMS sync success rate
2. USSD session completion rate
3. Average sync time per channel
4. SMS/USSD costs per user
5. Credit line utilization
6. Top-up success rate

### Alerting
1. High SMS failure rate (>10%)
2. USSD session timeout spike
3. Unusual credit line usage
4. Failed top-ups exceeding threshold

## Compliance & Regulations

### SMS Compliance
- TCPA (US): Obtain user consent for SMS
- GDPR (EU): Data protection and user consent
- Local regulations: Country-specific SMS regulations

### Financial Regulations
- Credit line: Comply with lending regulations
- Transaction limits: Anti-money laundering (AML)
- User verification: Know Your Customer (KYC)

## Conclusion

This architecture enables robust offline wallet functionality with multi-channel sync capabilities. The system gracefully degrades from internet to SMS to USSD, ensuring users can always access their wallets and perform critical operations.
