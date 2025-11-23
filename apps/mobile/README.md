# Global FinTech Mobile App (Flutter)

This directory contains the source code for the Flutter-based mobile application for iOS and Android with offline wallet capabilities.

## Features

### Offline Wallet System

The mobile app features a comprehensive offline-first wallet system that enables users to:

- **Offline Transactions**: Perform transactions without internet connectivity
- **Multi-Currency Support**: Manage multiple wallets in different currencies
- **Background Sync**: Automatic synchronization when connectivity is restored
- **Conflict Resolution**: Intelligent handling of conflicting offline transactions
- **Secure Storage**: AES-256 encryption for sensitive data
- **Balance Management**: Track available, pending, and held balances
- **Transaction History**: View all transactions with sync status indicators

## Architecture

### Core Components

1. **Local Database** (`lib/core/database/local_database.dart`)
   - SQLite database for offline storage
   - Tables: wallets, transactions, sync_queue, conflicts
   - Automatic schema migrations

2. **Data Models** (`lib/core/models/`)
   - `OfflineWallet`: Multi-currency wallet with balance tracking
   - `OfflineTransaction`: Transaction records with sync metadata

3. **Services** (`lib/core/services/`)
   - `OfflineWalletService`: Core wallet operations (credit, debit, transfer)
   - `SyncService`: Background sync with retry logic and conflict resolution
   - `WalletEncryptionService`: AES encryption for sensitive data

4. **UI Components** (`lib/features/wallet/`)
   - `OfflineWalletScreen`: Main wallet interface
   - `WalletCard`: Wallet selector widget
   - `TransactionListItem`: Transaction display widget

### Data Flow

```
User Action → Local Database (SQLite) → Sync Queue → Background Sync → Remote API
                     ↓                                        ↓
              Instant UI Update                    Server Reconciliation
```

### Sync Mechanism

- **Automatic Sync**: Every 5 minutes when connected
- **Manual Sync**: Pull-to-refresh or sync button
- **Retry Logic**: Exponential backoff for failed syncs
- **Conflict Resolution**: Server-wins strategy with tracking
- **Status Indicators**: Visual feedback for sync state

## Setup

### Prerequisites

- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio / Xcode for platform-specific builds

### Installation

1. Install dependencies:
```bash
cd apps/mobile
flutter pub get
```

2. Run the app:
```bash
# For Android
flutter run -d android

# For iOS
flutter run -d ios

# For Web
flutter run -d chrome
```

### Environment Configuration

The app uses compile-time environment variables for configuration:

```bash
flutter run --dart-define=API_BASE_URL=https://api.your-domain.com \
            --dart-define=API_KEY=your-api-key
```

## Database Schema

### offline_wallets
- `wallet_id` (TEXT PRIMARY KEY)
- `user_id` (TEXT)
- `currency` (TEXT)
- `balance` (REAL)
- `available_balance` (REAL)
- `pending_balance` (REAL)
- `held_balance` (REAL)
- `status` (TEXT)
- `is_synced` (INTEGER)
- `last_synced_at` (INTEGER)
- `created_at` (INTEGER)

### offline_transactions
- `transaction_id` (TEXT PRIMARY KEY)
- `wallet_id` (TEXT)
- `type` (TEXT) - 'credit' or 'debit'
- `amount` (REAL)
- `category` (TEXT)
- `description` (TEXT)
- `metadata` (TEXT JSON)
- `balance_before` (REAL)
- `balance_after` (REAL)
- `is_synced` (INTEGER)
- `created_at` (INTEGER)

### sync_queue
- `queue_id` (TEXT PRIMARY KEY)
- `entity_type` (TEXT) - 'transaction', 'transfer'
- `entity_id` (TEXT)
- `action` (TEXT) - 'create', 'update', 'delete'
- `payload` (TEXT JSON)
- `status` (TEXT) - 'pending', 'completed', 'failed'
- `retry_count` (INTEGER)
- `max_retries` (INTEGER)
- `created_at` (INTEGER)
- `completed_at` (INTEGER)

### transaction_conflicts
- `conflict_id` (TEXT PRIMARY KEY)
- `local_transaction_id` (TEXT)
- `server_transaction_id` (TEXT)
- `conflict_type` (TEXT)
- `local_data` (TEXT JSON)
- `server_data` (TEXT JSON)
- `resolved` (INTEGER)
- `resolution_strategy` (TEXT)
- `created_at` (INTEGER)
- `resolved_at` (INTEGER)

## Security

### Encryption
- **AES-256-GCM** encryption for sensitive data
- **SHA-256** hashing for PIN verification
- **Secure Storage** for encryption keys using platform-specific secure storage

### Data Protection
- Local database encryption
- Secure key generation and storage
- Transaction signature verification
- PIN/biometric authentication support

## Testing

```bash
# Run unit tests
flutter test

# Run integration tests
flutter test integration_test/

# Run with coverage
flutter test --coverage
```

## Dependencies

Key dependencies used in the app:

- **sqflite**: SQLite database for offline storage
- **flutter_secure_storage**: Encrypted key-value storage
- **connectivity_plus**: Network connectivity monitoring
- **encrypt**: AES encryption library
- **http**: HTTP client for API communication
- **provider**: State management
- **intl**: Internationalization and date formatting

## Build & Release

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

### iOS

```bash
# Build for iOS
flutter build ios --release

# Build IPA
flutter build ipa --release
```

## Offline Wallet Usage

### Creating a Wallet

Wallets are automatically created when a user logs in and synced from the server. Each currency gets its own wallet.

### Performing Transactions

```dart
// Credit wallet
await walletService.creditWallet(
  walletId: 'wallet-id',
  amount: 100.00,
  category: 'payment_received',
  description: 'Payment from John',
);

// Debit wallet
await walletService.debitWallet(
  walletId: 'wallet-id',
  amount: 50.00,
  category: 'payment_sent',
  description: 'Payment to merchant',
);

// Transfer between wallets
await walletService.transferBetweenWallets(
  fromWalletId: 'wallet-1',
  toWalletId: 'wallet-2',
  amount: 25.00,
  description: 'Transfer',
);
```

### Checking Sync Status

The UI automatically shows sync status indicators:
- **Cloud icon**: On wallet cards for unsynced wallets
- **Pending sync badge**: On transaction items
- **Sync button**: In app bar for manual sync

## Troubleshooting

### Common Issues

1. **Database locked**: Close other instances of the app
2. **Sync failures**: Check network connectivity and API credentials
3. **Balance mismatches**: Force sync or check conflict resolution logs

### Debug Mode

Enable debug logging:
```dart
// In main.dart
void main() {
  debugPrint('Debug mode enabled');
  runApp(const GlobalFinTechApp());
}
```

## Contributing

When contributing to the mobile app:

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Run linter before committing: `flutter analyze`
5. Format code: `flutter format .`

## License

Proprietary - Global FinTech Platform
