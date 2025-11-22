import 'package:sqflite/sqflite.dart';
import '../database/local_database.dart';
import '../models/offline_wallet.dart';
import '../models/offline_transaction.dart';
import 'dart:convert';
import 'package:uuid/uuid.dart';

class OfflineWalletService {
  final _uuid = const Uuid();

  // Get wallet by ID
  Future<OfflineWallet?> getWallet(String walletId) async {
    final db = await LocalDatabase.instance.database;
    final maps = await db.query(
      'offline_wallets',
      where: 'wallet_id = ?',
      whereArgs: [walletId],
    );

    if (maps.isNotEmpty) {
      return OfflineWallet.fromMap(maps.first);
    }
    return null;
  }

  // Get all wallets for a user
  Future<List<OfflineWallet>> getUserWallets(String userId) async {
    final db = await LocalDatabase.instance.database;
    final maps = await db.query(
      'offline_wallets',
      where: 'user_id = ?',
      whereArgs: [userId],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) => OfflineWallet.fromMap(maps[i]));
  }

  // Create or update wallet
  Future<OfflineWallet> upsertWallet(OfflineWallet wallet) async {
    final db = await LocalDatabase.instance.database;
    await db.insert(
      'offline_wallets',
      wallet.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    return wallet;
  }

  // Credit wallet (add funds)
  Future<OfflineTransaction> creditWallet({
    required String walletId,
    required double amount,
    required String category,
    String? description,
    Map<String, dynamic>? metadata,
  }) async {
    final wallet = await getWallet(walletId);
    if (wallet == null) {
      throw Exception('Wallet not found');
    }

    if (wallet.status != 'active') {
      throw Exception('Wallet is not active');
    }

    final db = await LocalDatabase.instance.database;

    return await db.transaction((txn) async {
      final balanceBefore = wallet.balance;
      wallet.credit(amount);

      // Create transaction record
      final transaction = OfflineTransaction(
        transactionId: _uuid.v4(),
        walletId: walletId,
        userId: wallet.userId,
        type: 'credit',
        category: category,
        amount: amount,
        currency: wallet.currency,
        balanceBefore: balanceBefore,
        balanceAfter: wallet.balance,
        status: 'completed',
        description: description,
        metadata: metadata,
        isSynced: false,
      );

      // Save wallet
      await txn.insert(
        'offline_wallets',
        wallet.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      // Save transaction
      await txn.insert('offline_transactions', transaction.toMap());

      // Add to sync queue
      await _addToSyncQueue(
        txn: txn,
        entityType: 'transaction',
        entityId: transaction.transactionId,
        action: 'create',
        payload: transaction.toServerPayload(),
      );

      return transaction;
    });
  }

  // Debit wallet (remove funds)
  Future<OfflineTransaction> debitWallet({
    required String walletId,
    required double amount,
    required String category,
    String? description,
    Map<String, dynamic>? metadata,
  }) async {
    final wallet = await getWallet(walletId);
    if (wallet == null) {
      throw Exception('Wallet not found');
    }

    if (!wallet.canDebit(amount)) {
      throw Exception('Insufficient funds');
    }

    final db = await LocalDatabase.instance.database;

    return await db.transaction((txn) async {
      final balanceBefore = wallet.balance;
      wallet.debit(amount);

      // Create transaction record
      final transaction = OfflineTransaction(
        transactionId: _uuid.v4(),
        walletId: walletId,
        userId: wallet.userId,
        type: 'debit',
        category: category,
        amount: amount,
        currency: wallet.currency,
        balanceBefore: balanceBefore,
        balanceAfter: wallet.balance,
        status: 'completed',
        description: description,
        metadata: metadata,
        isSynced: false,
      );

      // Save wallet
      await txn.insert(
        'offline_wallets',
        wallet.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      // Save transaction
      await txn.insert('offline_transactions', transaction.toMap());

      // Add to sync queue
      await _addToSyncQueue(
        txn: txn,
        entityType: 'transaction',
        entityId: transaction.transactionId,
        action: 'create',
        payload: transaction.toServerPayload(),
      );

      return transaction;
    });
  }

  // Transfer between wallets
  Future<Map<String, OfflineTransaction>> transfer({
    required String fromWalletId,
    required String toWalletId,
    required double amount,
    String? description,
    Map<String, dynamic>? metadata,
  }) async {
    final fromWallet = await getWallet(fromWalletId);
    final toWallet = await getWallet(toWalletId);

    if (fromWallet == null || toWallet == null) {
      throw Exception('Wallet not found');
    }

    if (fromWallet.currency != toWallet.currency) {
      throw Exception('Currency mismatch');
    }

    if (!fromWallet.canDebit(amount)) {
      throw Exception('Insufficient funds');
    }

    final db = await LocalDatabase.instance.database;

    return await db.transaction((txn) async {
      // Debit from sender
      final fromBalanceBefore = fromWallet.balance;
      fromWallet.debit(amount);

      final debitTxn = OfflineTransaction(
        transactionId: _uuid.v4(),
        walletId: fromWalletId,
        userId: fromWallet.userId,
        type: 'debit',
        category: 'transfer_out',
        amount: amount,
        currency: fromWallet.currency,
        balanceBefore: fromBalanceBefore,
        balanceAfter: fromWallet.balance,
        status: 'completed',
        description: description ?? 'Transfer to ${toWallet.userId}',
        counterpartyWalletId: toWalletId,
        counterpartyUserId: toWallet.userId,
        metadata: metadata,
        isSynced: false,
      );

      // Credit to receiver
      final toBalanceBefore = toWallet.balance;
      toWallet.credit(amount);

      final creditTxn = OfflineTransaction(
        transactionId: _uuid.v4(),
        walletId: toWalletId,
        userId: toWallet.userId,
        type: 'credit',
        category: 'transfer_in',
        amount: amount,
        currency: toWallet.currency,
        balanceBefore: toBalanceBefore,
        balanceAfter: toWallet.balance,
        status: 'completed',
        description: description ?? 'Transfer from ${fromWallet.userId}',
        counterpartyWalletId: fromWalletId,
        counterpartyUserId: fromWallet.userId,
        metadata: metadata,
        isSynced: false,
      );

      // Save both wallets
      await txn.insert(
        'offline_wallets',
        fromWallet.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      await txn.insert(
        'offline_wallets',
        toWallet.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      // Save both transactions
      await txn.insert('offline_transactions', debitTxn.toMap());
      await txn.insert('offline_transactions', creditTxn.toMap());

      // Add to sync queue
      await _addToSyncQueue(
        txn: txn,
        entityType: 'transfer',
        entityId: debitTxn.transactionId,
        action: 'create',
        payload: {
          'fromTransaction': debitTxn.toServerPayload(),
          'toTransaction': creditTxn.toServerPayload(),
        },
        priority: 1,
      );

      return {
        'debit': debitTxn,
        'credit': creditTxn,
      };
    });
  }

  // Get wallet transactions
  Future<List<OfflineTransaction>> getWalletTransactions(
    String walletId, {
    int limit = 50,
    int offset = 0,
  }) async {
    final db = await LocalDatabase.instance.database;
    final maps = await db.query(
      'offline_transactions',
      where: 'wallet_id = ?',
      whereArgs: [walletId],
      orderBy: 'created_at DESC',
      limit: limit,
      offset: offset,
    );

    return List.generate(maps.length, (i) => OfflineTransaction.fromMap(maps[i]));
  }

  // Get unsynced transactions
  Future<List<OfflineTransaction>> getUnsyncedTransactions() async {
    final db = await LocalDatabase.instance.database;
    final maps = await db.query(
      'offline_transactions',
      where: 'is_synced = ?',
      whereArgs: [0],
      orderBy: 'created_at ASC',
    );

    return List.generate(maps.length, (i) => OfflineTransaction.fromMap(maps[i]));
  }

  // Mark transaction as synced
  Future<void> markTransactionSynced(String transactionId) async {
    final db = await LocalDatabase.instance.database;
    await db.update(
      'offline_transactions',
      {'is_synced': 1},
      where: 'transaction_id = ?',
      whereArgs: [transactionId],
    );
  }

  // Get wallet balance
  Future<Map<String, double>> getWalletBalance(String walletId) async {
    final wallet = await getWallet(walletId);
    if (wallet == null) {
      throw Exception('Wallet not found');
    }

    return {
      'balance': wallet.balance,
      'availableBalance': wallet.availableBalance,
      'pendingBalance': wallet.pendingBalance,
      'heldBalance': wallet.heldBalance,
    };
  }

  // Add item to sync queue
  Future<void> _addToSyncQueue({
    required Transaction txn,
    required String entityType,
    required String entityId,
    required String action,
    required Map<String, dynamic> payload,
    int priority = 0,
  }) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    await txn.insert('sync_queue', {
      'queue_id': _uuid.v4(),
      'entity_type': entityType,
      'entity_id': entityId,
      'action': action,
      'payload': jsonEncode(payload),
      'priority': priority,
      'status': 'pending',
      'retry_count': 0,
      'max_retries': 3,
      'created_at': now,
      'scheduled_at': now,
    });
  }

  // Get pending sync items
  Future<List<Map<String, dynamic>>> getPendingSyncItems() async {
    final db = await LocalDatabase.instance.database;
    return await db.query(
      'sync_queue',
      where: 'status = ?',
      whereArgs: ['pending'],
      orderBy: 'priority DESC, created_at ASC',
    );
  }
}
