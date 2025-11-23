import 'dart:convert';

class OfflineTransaction {
  final String transactionId;
  final String walletId;
  final String userId;
  final String type; // credit, debit, transfer
  final String category;
  double amount;
  final String currency;
  double balanceBefore;
  double balanceAfter;
  String status;
  String? description;
  String? counterpartyWalletId;
  String? counterpartyUserId;
  Map<String, dynamic>? metadata;
  bool isSynced;
  int syncAttempts;
  DateTime? lastSyncAttempt;
  DateTime createdAt;

  OfflineTransaction({
    required this.transactionId,
    required this.walletId,
    required this.userId,
    required this.type,
    required this.category,
    required this.amount,
    required this.currency,
    required this.balanceBefore,
    required this.balanceAfter,
    this.status = 'pending',
    this.description,
    this.counterpartyWalletId,
    this.counterpartyUserId,
    this.metadata,
    this.isSynced = false,
    this.syncAttempts = 0,
    this.lastSyncAttempt,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'transaction_id': transactionId,
      'wallet_id': walletId,
      'user_id': userId,
      'type': type,
      'category': category,
      'amount': amount,
      'currency': currency,
      'balance_before': balanceBefore,
      'balance_after': balanceAfter,
      'status': status,
      'description': description,
      'counterparty_wallet_id': counterpartyWalletId,
      'counterparty_user_id': counterpartyUserId,
      'metadata': metadata != null ? jsonEncode(metadata) : null,
      'is_synced': isSynced ? 1 : 0,
      'sync_attempts': syncAttempts,
      'last_sync_attempt': lastSyncAttempt?.millisecondsSinceEpoch,
      'created_at': createdAt.millisecondsSinceEpoch,
    };
  }

  factory OfflineTransaction.fromMap(Map<String, dynamic> map) {
    return OfflineTransaction(
      transactionId: map['transaction_id'],
      walletId: map['wallet_id'],
      userId: map['user_id'],
      type: map['type'],
      category: map['category'],
      amount: (map['amount'] as num).toDouble(),
      currency: map['currency'],
      balanceBefore: (map['balance_before'] as num).toDouble(),
      balanceAfter: (map['balance_after'] as num).toDouble(),
      status: map['status'],
      description: map['description'],
      counterpartyWalletId: map['counterparty_wallet_id'],
      counterpartyUserId: map['counterparty_user_id'],
      metadata: map['metadata'] != null ? jsonDecode(map['metadata']) : null,
      isSynced: map['is_synced'] == 1,
      syncAttempts: map['sync_attempts'],
      lastSyncAttempt: map['last_sync_attempt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['last_sync_attempt'])
          : null,
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at']),
    );
  }

  Map<String, dynamic> toServerPayload() {
    return {
      'transactionId': transactionId,
      'walletId': walletId,
      'userId': userId,
      'type': type,
      'category': category,
      'amount': amount.toString(),
      'currency': currency,
      'balanceBefore': balanceBefore.toString(),
      'balanceAfter': balanceAfter.toString(),
      'description': description,
      'counterpartyWalletId': counterpartyWalletId,
      'counterpartyUserId': counterpartyUserId,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  OfflineTransaction copyWith({
    String? transactionId,
    String? walletId,
    String? userId,
    String? type,
    String? category,
    double? amount,
    String? currency,
    double? balanceBefore,
    double? balanceAfter,
    String? status,
    String? description,
    String? counterpartyWalletId,
    String? counterpartyUserId,
    Map<String, dynamic>? metadata,
    bool? isSynced,
    int? syncAttempts,
    DateTime? lastSyncAttempt,
    DateTime? createdAt,
  }) {
    return OfflineTransaction(
      transactionId: transactionId ?? this.transactionId,
      walletId: walletId ?? this.walletId,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      category: category ?? this.category,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      balanceBefore: balanceBefore ?? this.balanceBefore,
      balanceAfter: balanceAfter ?? this.balanceAfter,
      status: status ?? this.status,
      description: description ?? this.description,
      counterpartyWalletId: counterpartyWalletId ?? this.counterpartyWalletId,
      counterpartyUserId: counterpartyUserId ?? this.counterpartyUserId,
      metadata: metadata ?? this.metadata,
      isSynced: isSynced ?? this.isSynced,
      syncAttempts: syncAttempts ?? this.syncAttempts,
      lastSyncAttempt: lastSyncAttempt ?? this.lastSyncAttempt,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
