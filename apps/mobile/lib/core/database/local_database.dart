import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static Database? _database;

  LocalDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('global_fintech.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    const idType = 'TEXT PRIMARY KEY';
    const textType = 'TEXT NOT NULL';
    const textTypeNullable = 'TEXT';
    const intType = 'INTEGER NOT NULL';
    const realType = 'REAL NOT NULL';

    // Offline Wallets table
    await db.execute('''
      CREATE TABLE offline_wallets (
        wallet_id $idType,
        user_id $textType,
        currency $textType,
        balance $realType,
        available_balance $realType,
        pending_balance $realType DEFAULT 0,
        held_balance $realType DEFAULT 0,
        status $textType DEFAULT 'active',
        last_synced_at $intType,
        is_synced $intType DEFAULT 1,
        created_at $intType,
        updated_at $intType
      )
    ''');

    // Offline Transactions table
    await db.execute('''
      CREATE TABLE offline_transactions (
        transaction_id $idType,
        wallet_id $textType,
        user_id $textType,
        type $textType,
        category $textType,
        amount $realType,
        currency $textType,
        balance_before $realType,
        balance_after $realType,
        status $textType DEFAULT 'pending',
        description $textTypeNullable,
        counterparty_wallet_id $textTypeNullable,
        counterparty_user_id $textTypeNullable,
        metadata $textTypeNullable,
        is_synced $intType DEFAULT 0,
        sync_attempts $intType DEFAULT 0,
        last_sync_attempt $intType,
        created_at $intType,
        FOREIGN KEY (wallet_id) REFERENCES offline_wallets (wallet_id)
      )
    ''');

    // Sync Queue table
    await db.execute('''
      CREATE TABLE sync_queue (
        queue_id $idType,
        entity_type $textType,
        entity_id $textType,
        action $textType,
        payload $textType,
        priority $intType DEFAULT 0,
        status $textType DEFAULT 'pending',
        error_message $textTypeNullable,
        retry_count $intType DEFAULT 0,
        max_retries $intType DEFAULT 3,
        created_at $intType,
        scheduled_at $intType,
        completed_at $intType
      )
    ''');

    // Transaction Conflicts table
    await db.execute('''
      CREATE TABLE transaction_conflicts (
        conflict_id $idType,
        local_transaction_id $textType,
        server_transaction_id $textType,
        conflict_type $textType,
        local_data $textType,
        server_data $textType,
        resolution_strategy $textTypeNullable,
        resolved $intType DEFAULT 0,
        created_at $intType,
        resolved_at $intType
      )
    ''');

    // Create indexes
    await db.execute('CREATE INDEX idx_wallet_user ON offline_wallets(user_id)');
    await db.execute('CREATE INDEX idx_wallet_sync ON offline_wallets(is_synced)');
    await db.execute('CREATE INDEX idx_transaction_wallet ON offline_transactions(wallet_id)');
    await db.execute('CREATE INDEX idx_transaction_sync ON offline_transactions(is_synced)');
    await db.execute('CREATE INDEX idx_transaction_created ON offline_transactions(created_at DESC)');
    await db.execute('CREATE INDEX idx_sync_queue_status ON sync_queue(status, priority DESC)');
  }

  Future<void> _upgradeDB(Database db, int oldVersion, int newVersion) async {
    // Handle database upgrades here
    if (oldVersion < 2) {
      // Future migrations
    }
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }

  Future<void> clearAll() async {
    final db = await instance.database;
    await db.delete('offline_wallets');
    await db.delete('offline_transactions');
    await db.delete('sync_queue');
    await db.delete('transaction_conflicts');
  }
}
