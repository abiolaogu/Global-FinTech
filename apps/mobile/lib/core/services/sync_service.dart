import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;
import '../database/local_database.dart';
import '../models/offline_wallet.dart';
import '../models/offline_transaction.dart';
import 'offline_wallet_service.dart';

class SyncService {
  final OfflineWalletService _walletService;
  final String _baseUrl;
  final String _apiKey;

  Timer? _syncTimer;
  bool _isSyncing = false;
  final _syncStatusController = StreamController<SyncStatus>.broadcast();

  Stream<SyncStatus> get syncStatus => _syncStatusController.stream;

  SyncService({
    required OfflineWalletService walletService,
    required String baseUrl,
    required String apiKey,
  })  : _walletService = walletService,
        _baseUrl = baseUrl,
        _apiKey = apiKey;

  // Start automatic background sync
  void startAutoSync({Duration interval = const Duration(minutes: 5)}) {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(interval, (_) {
      syncAll();
    });
  }

  // Stop automatic sync
  void stopAutoSync() {
    _syncTimer?.cancel();
  }

  // Sync all pending items
  Future<SyncResult> syncAll() async {
    if (_isSyncing) {
      return SyncResult(
        success: false,
        message: 'Sync already in progress',
      );
    }

    // Check connectivity
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      return SyncResult(
        success: false,
        message: 'No internet connection',
      );
    }

    _isSyncing = true;
    _syncStatusController.add(SyncStatus.syncing);

    try {
      final result = await _performSync();
      _syncStatusController.add(
        result.success ? SyncStatus.completed : SyncStatus.failed,
      );
      return result;
    } catch (e) {
      _syncStatusController.add(SyncStatus.failed);
      return SyncResult(
        success: false,
        message: 'Sync failed: $e',
      );
    } finally {
      _isSyncing = false;
    }
  }

  Future<SyncResult> _performSync() async {
    final db = await LocalDatabase.instance.database;
    int successCount = 0;
    int failureCount = 0;
    final errors = <String>[];

    // 1. Fetch latest wallet data from server
    try {
      await _syncWalletsFromServer();
      successCount++;
    } catch (e) {
      errors.add('Wallet sync failed: $e');
      failureCount++;
    }

    // 2. Push pending transactions to server
    final pendingItems = await _walletService.getPendingSyncItems();

    for (final item in pendingItems) {
      try {
        final success = await _syncItem(item);
        if (success) {
          successCount++;
          await _markItemSynced(item['queue_id']);
        } else {
          failureCount++;
          await _incrementRetryCount(item['queue_id']);
        }
      } catch (e) {
        errors.add('Item sync failed: $e');
        failureCount++;
        await _incrementRetryCount(item['queue_id']);
      }
    }

    return SyncResult(
      success: failureCount == 0,
      message: 'Synced $successCount items, $failureCount failed',
      syncedCount: successCount,
      failedCount: failureCount,
      errors: errors,
    );
  }

  Future<void> _syncWalletsFromServer() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/v1/wallets'),
      headers: {
        'Authorization': 'Bearer $_apiKey',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> walletsJson = jsonDecode(response.body);
      final db = await LocalDatabase.instance.database;

      for (final walletJson in walletsJson) {
        final wallet = OfflineWallet(
          walletId: walletJson['walletId'],
          userId: walletJson['userId'],
          currency: walletJson['currency'],
          balance: double.parse(walletJson['balance'].toString()),
          availableBalance: double.parse(walletJson['availableBalance'].toString()),
          pendingBalance: double.parse(walletJson['pendingBalance'].toString()),
          heldBalance: double.parse(walletJson['heldBalance'].toString()),
          status: walletJson['status'],
          lastSyncedAt: DateTime.now(),
          isSynced: true,
        );

        await db.insert(
          'offline_wallets',
          wallet.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    } else {
      throw Exception('Failed to fetch wallets: ${response.statusCode}');
    }
  }

  Future<bool> _syncItem(Map<String, dynamic> item) async {
    final entityType = item['entity_type'];
    final action = item['action'];
    final payload = jsonDecode(item['payload']);

    String endpoint;
    String method;

    switch (entityType) {
      case 'transaction':
        endpoint = '$_baseUrl/api/v1/wallets/${payload['walletId']}/transactions';
        method = 'POST';
        break;
      case 'transfer':
        endpoint = '$_baseUrl/api/v1/wallets/transfer';
        method = 'POST';
        break;
      default:
        throw Exception('Unknown entity type: $entityType');
    }

    final response = await http.post(
      Uri.parse(endpoint),
      headers: {
        'Authorization': 'Bearer $_apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(payload),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      // Mark local transaction as synced
      if (entityType == 'transaction') {
        await _walletService.markTransactionSynced(item['entity_id']);
      }
      return true;
    } else if (response.statusCode == 409) {
      // Conflict - handle separately
      await _handleConflict(item, jsonDecode(response.body));
      return false;
    } else {
      return false;
    }
  }

  Future<void> _handleConflict(
    Map<String, dynamic> localItem,
    Map<String, dynamic> serverData,
  ) async {
    final db = await LocalDatabase.instance.database;
    final now = DateTime.now().millisecondsSinceEpoch;

    await db.insert('transaction_conflicts', {
      'conflict_id': DateTime.now().millisecondsSinceEpoch.toString(),
      'local_transaction_id': localItem['entity_id'],
      'server_transaction_id': serverData['transactionId'],
      'conflict_type': 'duplicate',
      'local_data': localItem['payload'],
      'server_data': jsonEncode(serverData),
      'resolved': 0,
      'created_at': now,
    });

    // Auto-resolve: Server wins (for now)
    // In production, this should be configurable
    await _resolveConflict(
      localItem['entity_id'],
      'server_wins',
    );
  }

  Future<void> _resolveConflict(
    String transactionId,
    String strategy,
  ) async {
    final db = await LocalDatabase.instance.database;

    if (strategy == 'server_wins') {
      // Mark local transaction as synced (accept server version)
      await db.update(
        'offline_transactions',
        {'is_synced': 1},
        where: 'transaction_id = ?',
        whereArgs: [transactionId],
      );

      // Mark conflict as resolved
      await db.update(
        'transaction_conflicts',
        {
          'resolved': 1,
          'resolution_strategy': strategy,
          'resolved_at': DateTime.now().millisecondsSinceEpoch,
        },
        where: 'local_transaction_id = ?',
        whereArgs: [transactionId],
      );
    }
  }

  Future<void> _markItemSynced(String queueId) async {
    final db = await LocalDatabase.instance.database;
    await db.update(
      'sync_queue',
      {
        'status': 'completed',
        'completed_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'queue_id = ?',
      whereArgs: [queueId],
    );
  }

  Future<void> _incrementRetryCount(String queueId) async {
    final db = await LocalDatabase.instance.database;
    final items = await db.query(
      'sync_queue',
      where: 'queue_id = ?',
      whereArgs: [queueId],
    );

    if (items.isNotEmpty) {
      final item = items.first;
      final retryCount = item['retry_count'] as int;
      final maxRetries = item['max_retries'] as int;

      if (retryCount >= maxRetries) {
        // Max retries reached, mark as failed
        await db.update(
          'sync_queue',
          {'status': 'failed'},
          where: 'queue_id = ?',
          whereArgs: [queueId],
        );
      } else {
        // Increment retry count
        await db.update(
          'sync_queue',
          {'retry_count': retryCount + 1},
          where: 'queue_id = ?',
          whereArgs: [queueId],
        );
      }
    }
  }

  // Force sync a specific transaction
  Future<bool> syncTransaction(String transactionId) async {
    final db = await LocalDatabase.instance.database;
    final items = await db.query(
      'sync_queue',
      where: 'entity_id = ? AND status = ?',
      whereArgs: [transactionId, 'pending'],
    );

    if (items.isNotEmpty) {
      return await _syncItem(items.first);
    }

    return false;
  }

  void dispose() {
    _syncTimer?.cancel();
    _syncStatusController.close();
  }
}

enum SyncStatus {
  idle,
  syncing,
  completed,
  failed,
}

class SyncResult {
  final bool success;
  final String message;
  final int syncedCount;
  final int failedCount;
  final List<String> errors;

  SyncResult({
    required this.success,
    required this.message,
    this.syncedCount = 0,
    this.failedCount = 0,
    this.errors = const [],
  });
}
