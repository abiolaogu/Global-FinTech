# SMS/USSD Offline Wallet Implementation Guide

## Overview

This guide provides instructions for completing the implementation of the SMS/USSD offline wallet system with credit line and top-up capabilities.

## What Has Been Implemented

### Backend (Complete)

#### 1. Database Entities
- ✅ `WalletEntity` - Updated with credit line fields (apps/api/src/modules/wallets/entities/wallet.entity.ts:78-142)
  - Credit limit, credit used, offline spend limit
  - Credit interest rate and grace period
  - SMS/USSD sync tracking

- ✅ `WalletTopupEntity` - New entity for wallet top-ups (apps/api/src/modules/wallets/entities/wallet-topup.entity.ts)
  - Supports multiple source types (bank, card, main wallet)
  - Tracks channel used (internet, SMS, USSD)
  - Status tracking and reversal support

- ✅ `CreditLineEntity` - New entity for credit lines (apps/api/src/modules/wallets/entities/credit-line.entity.ts)
  - Credit limit and usage tracking
  - Interest rate and payment management
  - Computed properties for available credit

- ✅ `SmsSyncLogEntity` - SMS communication logging (apps/api/src/modules/sms-gateway/entities/sms-sync-log.entity.ts)
  - Tracks all inbound/outbound SMS
  - Stores encrypted payloads
  - Cost tracking per message

- ✅ `UssdSessionEntity` - USSD session management (apps/api/src/modules/ussd-gateway/entities/ussd-session.entity.ts)
  - Session state and menu navigation
  - PIN authentication tracking
  - Auto-expiry after 30 seconds

#### 2. Services

- ✅ `WalletTopupService` - Complete top-up workflow (apps/api/src/modules/wallets/services/wallet-topup.service.ts)
  - Initiate, complete, fail, and reverse top-ups
  - Transaction safety with pessimistic locking
  - Event emission for monitoring

- ✅ `CreditLineService` - Credit line management (apps/api/src/modules/wallets/services/credit-line.service.ts)
  - Allocate, use, and repay credit
  - Suspend/activate credit lines
  - Update credit limits

- ✅ `SmsGatewayService` - SMS protocol implementation (apps/api/src/modules/sms-gateway/services/sms-gateway.service.ts)
  - Parse and validate SMS commands
  - AES-256-GCM encryption/decryption
  - Command processing (SYNC_WALLET, TXN, STATUS, TOPUP, CREDIT)
  - Checksum validation

- ✅ `UssdGatewayService` - USSD menu system (apps/api/src/modules/ussd-gateway/services/ussd-gateway.service.ts)
  - PIN authentication
  - Interactive menu navigation
  - Balance check, sync, top-up, credit check
  - Session timeout management

### Mobile App (Partially Complete)

#### 1. Data Models
- ✅ `OfflineWallet` - Updated model (apps/mobile/lib/core/models/offline_wallet.dart)
  - Credit line fields and methods
  - SMS/USSD sync tracking
  - Methods: `useCredit()`, `repayCredit()`, `debitWithCredit()`
  - Sync recording: `recordSmsSync()`, `recordUssdSync()`

#### 2. Database
- ✅ `LocalDatabase` - Schema updated (apps/mobile/lib/core/database/local_database.dart)
  - Version 2 with credit line columns
  - Migration from v1 to v2 with ALTER TABLE
  - 13 new columns for credit and sync tracking

#### 3. Dependencies
- ✅ `pubspec.yaml` - Updated with SMS/USSD packages
  - telephony: ^0.2.0 (SMS handling)
  - url_launcher: ^6.2.2 (USSD dialing)
  - sms_advanced: ^1.0.1 (Advanced SMS features)

### Documentation
- ✅ SMS/USSD Sync Architecture (docs/SMS_USSD_SYNC_ARCHITECTURE.md)
  - Complete protocol specification
  - Security considerations
  - Message formats and examples
  - Database schema requirements
  - Cost optimization strategies

## What Needs To Be Implemented

### Backend (TODO)

#### 1. Controllers & Webhooks
Create the following controllers to expose the services:

**File:** `apps/api/src/modules/sms-gateway/sms-gateway.controller.ts`
```typescript
@Controller('webhooks/sms')
export class SmsWebhookController {
  @Post('incoming')
  async handleIncomingSms(@Body() body: any): Promise<any> {
    // Parse webhook from SMS gateway (Twilio, Africa's Talking, etc.)
    // Call smsGatewayService.processSmsCommand()
  }

  @Get('status/:logId')
  async getSmsStatus(@Param('logId') logId: string): Promise<any> {
    // Get SMS delivery status
  }
}
```

**File:** `apps/api/src/modules/ussd-gateway/ussd-gateway.controller.ts`
```typescript
@Controller('webhooks/ussd')
export class UssdWebhookController {
  @Post('session')
  async handleUssdSession(@Body() body: any): Promise<any> {
    // Parse USSD request from gateway
    // Call ussdGatewayService.processUssdRequest()
    // Return CON or END response
  }
}
```

**File:** `apps/api/src/modules/wallets/controllers/wallet-topup.controller.ts`
```typescript
@Controller('wallets/topups')
export class WalletTopupController {
  @Post()
  async initiateTopup(@Body() dto: InitiateTopupDto): Promise<any> {}

  @Get(':topupId')
  async getTopup(@Param('topupId') topupId: string): Promise<any> {}

  @Get('wallet/:walletId')
  async getWalletTopups(@Param('walletId') walletId: string): Promise<any> {}
}
```

**File:** `apps/api/src/modules/wallets/controllers/credit-line.controller.ts`
```typescript
@Controller('credit-lines')
export class CreditLineController {
  @Get('user/:userId')
  async getCreditLine(@Param('userId') userId: string): Promise<any> {}

  @Post('use')
  async useCredit(@Body() dto: UseCreditDto): Promise<any> {}

  @Post('repay')
  async repayCredit(@Body() dto: RepayCreditDto): Promise<any> {}
}
```

#### 2. Module Registration
Register new entities and services in their respective modules:

**File:** `apps/api/src/modules/sms-gateway/sms-gateway.module.ts`
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([SmsSyncLogEntity]),
    WalletsModule,
  ],
  providers: [SmsGatewayService],
  controllers: [SmsWebhookController],
  exports: [SmsGatewayService],
})
export class SmsGatewayModule {}
```

**File:** `apps/api/src/modules/ussd-gateway/ussd-gateway.module.ts`
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([UssdSessionEntity]),
    WalletsModule,
  ],
  providers: [UssdGatewayService],
  controllers: [UssdWebhookController],
  exports: [UssdGatewayService],
})
export class UssdGatewayModule {}
```

Update `apps/api/src/modules/wallets/wallets.module.ts`:
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletTransactionEntity,
      WalletTopupEntity,
      CreditLineEntity,
    ]),
  ],
  providers: [
    WalletsService,
    WalletTopupService,
    CreditLineService,
  ],
  controllers: [
    WalletsController,
    WalletTopupController,
    CreditLineController,
  ],
  exports: [WalletsService, WalletTopupService, CreditLineService],
})
export class WalletsModule {}
```

#### 3. Database Migration
**File:** `apps/api/src/migrations/[timestamp]-AddCreditLineAndSmsUssdSupport.ts`
```typescript
export class AddCreditLineAndSmsUssdSupport[timestamp] implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns to wallets table
    await queryRunner.query(`
      ALTER TABLE "wallets"
      ADD COLUMN "credit_limit" DECIMAL(20,8) DEFAULT 0,
      ADD COLUMN "credit_used" DECIMAL(20,8) DEFAULT 0,
      ADD COLUMN "offline_spend_limit" DECIMAL(20,8) DEFAULT 0,
      -- ... add all new columns
    `);

    // Create wallet_topups table
    // Create credit_lines table
    // Create sms_sync_log table
    // Create ussd_sessions table
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse migrations
  }
}
```

#### 4. SMS Gateway Integration
Choose and configure an SMS gateway provider:

**Option 1: Twilio**
```typescript
// Environment variables
SMS_GATEWAY=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Option 2: Africa's Talking**
```typescript
// Environment variables
SMS_GATEWAY=africastalking
AT_USERNAME=your_username
AT_API_KEY=your_key
AT_SHORTCODE=your_shortcode
```

**Option 3: Termii**
```typescript
// Environment variables
SMS_GATEWAY=termii
TERMII_API_KEY=your_key
TERMII_SENDER_ID=GlobalFin
```

#### 5. USSD Gateway Integration
Configure USSD gateway:

**Africa's Talking USSD**
```typescript
// Environment variables
USSD_GATEWAY=africastalking
USSD_SERVICE_CODE=*384*12345#
```

**Hubtel USSD**
```typescript
// Environment variables
USSD_GATEWAY=hubtel
USSD_APP_ID=your_app_id
```

### Mobile App (TODO)

#### 1. SMS Sync Service
**File:** `apps/mobile/lib/core/services/sms_sync_service.dart`
```dart
class SmsSyncService {
  final Telephony telephony = Telephony.instance;

  // Listen for incoming SMS responses
  Future<void> listenForSmsResponses() async {
    telephony.listenIncomingSms(
      onNewMessage: (SmsMessage message) {
        if (message.address == 'GLOBALFIN') {
          _processSmsResponse(message.body);
        }
      },
    );
  }

  // Send SMS command
  Future<void> sendSmsCommand(SmsCommand command) async {
    final message = _formatSmsCommand(command);
    await telephony.sendSms(to: SMS_SHORT_CODE, message: message);
  }

  // Encrypt payload using AES-256-GCM
  String _encryptPayload(Map<String, dynamic> data) {
    // Implementation
  }

  // Generate checksum
  String _generateChecksum(String payload) {
    // Implementation
  }
}
```

#### 2. USSD Sync Service
**File:** `apps/mobile/lib/core/services/ussd_sync_service.dart`
```dart
class UssdSyncService {
  // Dial USSD code
  Future<void> dialUssd(String code) async {
    final url = 'tel:${Uri.encodeComponent(code)}';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  // Quick actions
  Future<void> checkBalance() async {
    await dialUssd('*384*12345*1#');
  }

  Future<void> syncTransactions() async {
    await dialUssd('*384*12345*3#');
  }

  Future<void> topupWallet() async {
    await dialUssd('*384*12345*4#');
  }
}
```

#### 3. Wallet Top-up Service
**File:** `apps/mobile/lib/core/services/wallet_topup_service.dart`
```dart
class WalletTopupService {
  final OfflineWalletService _walletService;
  final http.Client _client;

  Future<TopupResult> initiateTopup({
    required String walletId,
    required double amount,
    required TopupSource source,
  }) async {
    // Call API to initiate top-up
    final response = await _client.post(
      Uri.parse('$baseUrl/wallets/topups'),
      body: jsonEncode({
        'wallet_id': walletId,
        'amount': amount,
        'source_type': source.type,
      }),
    );

    // Return result
  }

  Future<void> completeTopupLocally(String topupId, double amount) async {
    // Update local wallet balance
    // Mark as pending sync
  }
}
```

#### 4. Multi-Channel Sync Service
**File:** `apps/mobile/lib/core/services/multi_channel_sync_service.dart`
```dart
class MultiChannelSyncService {
  final SyncService _internetSync;
  final SmsSyncService _smsSync;
  final UssdSyncService _ussdSync;
  final Connectivity _connectivity;

  Future<SyncResult> sync() async {
    // Try internet first
    if (await _hasInternetConnection()) {
      return await _internetSync.syncAll();
    }

    // Fall back to SMS
    if (await _hasSmsCapability()) {
      return await _syncViaSms();
    }

    // Last resort: USSD (manual)
    return SyncResult.unavailable('No sync channel available');
  }

  Future<SyncResult> _syncViaSms() async {
    // Get pending sync items
    final pendingItems = await _internetSync.getPendingSyncItems();

    // Send batch SMS command
    await _smsSync.sendSmsCommand(SmsCommand.batchSync(pendingItems));

    // Wait for response (with timeout)
    // Update local database
  }
}
```

#### 5. UI Updates

**File:** `apps/mobile/lib/features/wallet/widgets/credit_line_card.dart`
```dart
class CreditLineCard extends StatelessWidget {
  final OfflineWallet wallet;

  @override
  Widget build(BuildContext context) {
    if (!wallet.hasCreditLine) return SizedBox.shrink();

    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Credit Line', style: Theme.of(context).textTheme.headline6),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Available'),
                Text('\$${wallet.creditAvailable.toStringAsFixed(2)}'),
              ],
            ),
            SizedBox(height: 4),
            LinearProgressIndicator(
              value: wallet.creditUtilization / 100,
            ),
            SizedBox(height: 4),
            Text(
              'Used: \$${wallet.creditUsed.toStringAsFixed(2)} of \$${wallet.creditLimit.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.caption,
            ),
          ],
        ),
      ),
    );
  }
}
```

**File:** `apps/mobile/lib/features/wallet/dialogs/topup_dialog.dart`
```dart
class TopupDialog extends StatefulWidget {
  final OfflineWallet wallet;

  @override
  _TopupDialogState createState() => _Top upDialogState();
}

class _TopupDialogState extends State<TopupDialog> {
  final _amountController = TextEditingController();
  TopupSource _selectedSource = TopupSource.mainWallet;

  Future<void> _submitTopup() async {
    final amount = double.tryParse(_amountController.text) ?? 0;

    final result = await context.read<WalletTopupService>().initiateTopup(
      walletId: widget.wallet.walletId,
      amount: amount,
      source: _selectedSource,
    );

    // Show result
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Top-up Wallet'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Amount',
              prefix: Text('\$ '),
            ),
          ),
          DropdownButton<TopupSource>(
            value: _selectedSource,
            items: TopupSource.values.map((source) {
              return DropdownMenuItem(
                value: source,
                child: Text(source.displayName),
              );
            }).toList(),
            onChanged: (value) {
              setState(() => _selectedSource = value!);
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _submitTopup,
          child: Text('Top-up'),
        ),
      ],
    );
  }
}
```

**Update:** `apps/mobile/lib/features/wallet/screens/offline_wallet_screen.dart`

Add:
- Credit line card display
- Top-up button in app bar
- SMS/USSD sync options in menu
- Sync channel indicator

### Testing Requirements

#### Backend Tests
1. Unit tests for `WalletTopupService`
2. Unit tests for `CreditLineService`
3. Unit tests for `SmsGatewayService` (encryption, parsing)
4. Unit tests for `UssdGatewayService` (menu navigation)
5. Integration tests for webhook endpoints
6. E2E tests for complete SMS sync flow

#### Mobile Tests
1. Unit tests for updated `OfflineWallet` model
2. Unit tests for SMS command formatting
3. Widget tests for credit line card
4. Widget tests for top-up dialog
5. Integration tests for multi-channel sync

### Security Checklist

- [ ] SMS encryption keys stored securely (environment variables)
- [ ] SMS rate limiting (max 10 per hour per user)
- [ ] USSD PIN validation (3 attempts max)
- [ ] USSD session timeout (30 seconds)
- [ ] Credit line authorization (admin-only allocation)
- [ ] Top-up source verification
- [ ] Transaction amount limits
- [ ] SMS cost alerts (prevent abuse)

### Deployment Steps

1. **Backend**
   - Run database migration
   - Configure SMS gateway credentials
   - Configure USSD gateway credentials
   - Set encryption keys
   - Deploy updated API
   - Configure webhooks with SMS/USSD providers

2. **Mobile**
   - Update app version
   - Request SMS permissions
   - Request PHONE permissions (for USSD)
   - Test on real devices with SIM cards
   - Submit to app stores

3. **Monitoring**
   - Set up alerts for SMS delivery failures
   - Monitor USSD session completion rates
   - Track credit line utilization
   - Monitor top-up success rates

## Environment Variables Required

### Backend
```bash
# SMS Gateway
SMS_ENCRYPTION_KEY=<64-character-hex-string>
SMS_GATEWAY=africastalking
SMS_API_KEY=<your-api-key>
SMS_SHORTCODE=<your-shortcode>

# USSD Gateway
USSD_GATEWAY=africastalking
USSD_SERVICE_CODE=*384*12345#

# Credit Line
CREDIT_DEFAULT_INTEREST_RATE=0
CREDIT_DEFAULT_GRACE_PERIOD=30
```

### Mobile
```bash
# Compile-time constants
API_BASE_URL=https://api.globalfintech.com
SMS_SHORT_CODE=12345
USSD_SERVICE_CODE=*384*12345#
```

## Next Steps

1. Create backend controllers and webhooks
2. Create backend database migration
3. Register SMS/USSD providers and get API credentials
4. Implement mobile SMS/USSD sync services
5. Update mobile UI with credit line and top-up
6. Write comprehensive tests
7. Perform security audit
8. Deploy to staging environment
9. Test with real SMS/USSD on physical devices
10. Deploy to production

## Support & Resources

- SMS/USSD Architecture: `docs/SMS_USSD_SYNC_ARCHITECTURE.md`
- Backend code: `apps/api/src/modules/`
- Mobile code: `apps/mobile/lib/`
- For questions, refer to the architecture document or create an issue.
