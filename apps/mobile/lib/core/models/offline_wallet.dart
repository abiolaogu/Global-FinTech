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

  // Credit line fields
  double creditLimit;
  double creditUsed;
  double offlineSpendLimit;
  double creditInterestRate;
  int creditGracePeriodDays;
  DateTime? creditAllocatedAt;
  DateTime? creditLastUsedAt;
  DateTime? creditNextPaymentDue;

  // SMS/USSD sync tracking
  DateTime? lastSmsSyncAt;
  DateTime? lastUssdSyncAt;
  int smsSyncCount;
  int ussdSyncCount;
  String? preferredSyncChannel; // 'internet', 'sms', 'ussd'

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
    this.creditLimit = 0.0,
    this.creditUsed = 0.0,
    this.offlineSpendLimit = 0.0,
    this.creditInterestRate = 0.0,
    this.creditGracePeriodDays = 30,
    this.creditAllocatedAt,
    this.creditLastUsedAt,
    this.creditNextPaymentDue,
    this.lastSmsSyncAt,
    this.lastUssdSyncAt,
    this.smsSyncCount = 0,
    this.ussdSyncCount = 0,
    this.preferredSyncChannel = 'internet',
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
      'credit_limit': creditLimit,
      'credit_used': creditUsed,
      'offline_spend_limit': offlineSpendLimit,
      'credit_interest_rate': creditInterestRate,
      'credit_grace_period_days': creditGracePeriodDays,
      'credit_allocated_at': creditAllocatedAt?.millisecondsSinceEpoch,
      'credit_last_used_at': creditLastUsedAt?.millisecondsSinceEpoch,
      'credit_next_payment_due': creditNextPaymentDue?.millisecondsSinceEpoch,
      'last_sms_sync_at': lastSmsSyncAt?.millisecondsSinceEpoch,
      'last_ussd_sync_at': lastUssdSyncAt?.millisecondsSinceEpoch,
      'sms_sync_count': smsSyncCount,
      'ussd_sync_count': ussdSyncCount,
      'preferred_sync_channel': preferredSyncChannel,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  factory OfflineWallet.fromMap(Map<String, dynamic> map) {
    return OfflineWallet(
      walletId: map['wallet_id'],
      userId: map['user_id'],
      currency: map['currency'],
      balance: (map['balance'] as num?)?.toDouble() ?? 0.0,
      availableBalance: (map['available_balance'] as num?)?.toDouble() ?? 0.0,
      pendingBalance: (map['pending_balance'] as num?)?.toDouble() ?? 0.0,
      heldBalance: (map['held_balance'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] ?? 'active',
      lastSyncedAt: map['last_synced_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['last_synced_at'])
          : null,
      isSynced: map['is_synced'] == 1,
      creditLimit: (map['credit_limit'] as num?)?.toDouble() ?? 0.0,
      creditUsed: (map['credit_used'] as num?)?.toDouble() ?? 0.0,
      offlineSpendLimit: (map['offline_spend_limit'] as num?)?.toDouble() ?? 0.0,
      creditInterestRate: (map['credit_interest_rate'] as num?)?.toDouble() ?? 0.0,
      creditGracePeriodDays: map['credit_grace_period_days'] ?? 30,
      creditAllocatedAt: map['credit_allocated_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['credit_allocated_at'])
          : null,
      creditLastUsedAt: map['credit_last_used_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['credit_last_used_at'])
          : null,
      creditNextPaymentDue: map['credit_next_payment_due'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['credit_next_payment_due'])
          : null,
      lastSmsSyncAt: map['last_sms_sync_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['last_sms_sync_at'])
          : null,
      lastUssdSyncAt: map['last_ussd_sync_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['last_ussd_sync_at'])
          : null,
      smsSyncCount: map['sms_sync_count'] ?? 0,
      ussdSyncCount: map['ussd_sync_count'] ?? 0,
      preferredSyncChannel: map['preferred_sync_channel'] ?? 'internet',
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

  // Credit line getters
  double get creditAvailable => creditLimit - creditUsed;

  double get totalAvailable => availableBalance + creditAvailable;

  double get creditUtilization =>
      creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

  bool get hasCreditLine => creditLimit > 0;

  bool get canUseCredit =>
      hasCreditLine && creditAvailable > 0 && status == 'active';

  // Credit line methods
  bool canDebitWithCredit(double amount) {
    return totalAvailable >= amount && status == 'active';
  }

  void useCredit(double amount) {
    if (!canUseCredit) {
      throw Exception('Credit line not available');
    }
    if (amount > creditAvailable) {
      throw Exception('Amount exceeds available credit');
    }

    creditUsed += amount;
    balance += amount;
    availableBalance += amount;
    creditLastUsedAt = DateTime.now();
    updatedAt = DateTime.now();
    isSynced = false;
  }

  void repayCredit(double amount) {
    if (amount > creditUsed) {
      throw Exception('Repayment amount exceeds credit used');
    }

    creditUsed -= amount;
    balance -= amount;
    availableBalance -= amount;
    updatedAt = DateTime.now();
    isSynced = false;
  }

  void debitWithCredit(double amount) {
    if (!canDebitWithCredit(amount)) {
      throw Exception('Insufficient total available funds or wallet inactive');
    }

    // Use wallet balance first, then credit
    if (amount <= availableBalance) {
      debit(amount);
    } else {
      final walletAmount = availableBalance;
      final creditAmount = amount - walletAmount;

      // Debit available wallet balance
      if (walletAmount > 0) {
        balance -= walletAmount;
        availableBalance = 0;
      }

      // Use credit for remainder
      creditUsed += creditAmount;
      creditLastUsedAt = DateTime.now();

      updatedAt = DateTime.now();
      isSynced = false;
    }
  }

  // Offline spend limit check
  bool withinOfflineLimit(double amount) {
    if (offlineSpendLimit <= 0) return true; // No limit
    return amount <= offlineSpendLimit;
  }

  // SMS/USSD sync methods
  void recordSmsSync() {
    lastSmsSyncAt = DateTime.now();
    smsSyncCount++;
    lastSyncedAt = DateTime.now();
    isSynced = true;
    updatedAt = DateTime.now();
  }

  void recordUssdSync() {
    lastUssdSyncAt = DateTime.now();
    ussdSyncCount++;
    lastSyncedAt = DateTime.now();
    isSynced = true;
    updatedAt = DateTime.now();
  }

  String get lastSyncMethod {
    if (lastSmsSyncAt == null && lastUssdSyncAt == null) {
      return 'internet';
    }

    final smsTime = lastSmsSyncAt ?? DateTime(1970);
    final ussdTime = lastUssdSyncAt ?? DateTime(1970);

    if (smsTime.isAfter(ussdTime)) {
      return 'sms';
    } else if (ussdTime.isAfter(smsTime)) {
      return 'ussd';
    } else {
      return 'internet';
    }
  }
}
