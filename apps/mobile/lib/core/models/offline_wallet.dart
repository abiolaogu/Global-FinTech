class OfflineWallet {
  final String walletId;
  final String userId;
  final String currency;
  double balance;
  double availableBalance;
  double pendingBalance;
  double heldBalance;
  String status;
  DateTime? lastSyncedAt;
  bool isSynced;
  DateTime createdAt;
  DateTime updatedAt;

  OfflineWallet({
    required this.walletId,
    required this.userId,
    required this.currency,
    this.balance = 0.0,
    this.availableBalance = 0.0,
    this.pendingBalance = 0.0,
    this.heldBalance = 0.0,
    this.status = 'active',
    this.lastSyncedAt,
    this.isSynced = true,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'wallet_id': walletId,
      'user_id': userId,
      'currency': currency,
      'balance': balance,
      'available_balance': availableBalance,
      'pending_balance': pendingBalance,
      'held_balance': heldBalance,
      'status': status,
      'last_synced_at': lastSyncedAt?.millisecondsSinceEpoch,
      'is_synced': isSynced ? 1 : 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  factory OfflineWallet.fromMap(Map<String, dynamic> map) {
    return OfflineWallet(
      walletId: map['wallet_id'],
      userId: map['user_id'],
      currency: map['currency'],
      balance: (map['balance'] as num).toDouble(),
      availableBalance: (map['available_balance'] as num).toDouble(),
      pendingBalance: (map['pending_balance'] as num).toDouble(),
      heldBalance: (map['held_balance'] as num).toDouble(),
      status: map['status'],
      lastSyncedAt: map['last_synced_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['last_synced_at'])
          : null,
      isSynced: map['is_synced'] == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at']),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updated_at']),
    );
  }

  OfflineWallet copyWith({
    String? walletId,
    String? userId,
    String? currency,
    double? balance,
    double? availableBalance,
    double? pendingBalance,
    double? heldBalance,
    String? status,
    DateTime? lastSyncedAt,
    bool? isSynced,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return OfflineWallet(
      walletId: walletId ?? this.walletId,
      userId: userId ?? this.userId,
      currency: currency ?? this.currency,
      balance: balance ?? this.balance,
      availableBalance: availableBalance ?? this.availableBalance,
      pendingBalance: pendingBalance ?? this.pendingBalance,
      heldBalance: heldBalance ?? this.heldBalance,
      status: status ?? this.status,
      lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      isSynced: isSynced ?? this.isSynced,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool canDebit(double amount) {
    return availableBalance >= amount && status == 'active';
  }

  void credit(double amount) {
    balance += amount;
    availableBalance += amount;
    updatedAt = DateTime.now();
    isSynced = false;
  }

  void debit(double amount) {
    if (!canDebit(amount)) {
      throw Exception('Insufficient funds or wallet inactive');
    }
    balance -= amount;
    availableBalance -= amount;
    updatedAt = DateTime.now();
    isSynced = false;
  }

  void hold(double amount) {
    if (!canDebit(amount)) {
      throw Exception('Insufficient funds for hold');
    }
    heldBalance += amount;
    availableBalance -= amount;
    updatedAt = DateTime.now();
    isSynced = false;
  }

  void releaseHold(double amount) {
    heldBalance -= amount;
    availableBalance += amount;
    updatedAt = DateTime.now();
    isSynced = false;
  }
}
