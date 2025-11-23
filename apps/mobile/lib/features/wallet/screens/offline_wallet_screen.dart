import 'package:flutter/material.dart';
import '../../../core/models/offline_wallet.dart';
import '../../../core/models/offline_transaction.dart';
import '../../../core/services/offline_wallet_service.dart';
import '../../../core/services/sync_service.dart';
import '../widgets/wallet_card.dart';
import '../widgets/transaction_list_item.dart';

class OfflineWalletScreen extends StatefulWidget {
  final String userId;

  const OfflineWalletScreen({
    Key? key,
    required this.userId,
  }) : super(key: key);

  @override
  State<OfflineWalletScreen> createState() => _OfflineWalletScreenState();
}

class _OfflineWalletScreenState extends State<OfflineWalletScreen> {
  final OfflineWalletService _walletService = OfflineWalletService();
  late SyncService _syncService;

  List<OfflineWallet> _wallets = [];
  Map<String, List<OfflineTransaction>> _transactions = {};
  bool _isLoading = true;
  bool _isSyncing = false;
  String? _selectedWalletId;

  @override
  void initState() {
    super.initState();
    _syncService = SyncService(
      walletService: _walletService,
      baseUrl: 'https://api.your-domain.com',
      apiKey: 'your-api-key',
    );
    _loadWallets();
    _listenToSyncStatus();
    _syncService.startAutoSync();
  }

  @override
  void dispose() {
    _syncService.stopAutoSync();
    _syncService.dispose();
    super.dispose();
  }

  void _listenToSyncStatus() {
    _syncService.syncStatus.listen((status) {
      setState(() {
        _isSyncing = status == SyncStatus.syncing;
      });

      if (status == SyncStatus.completed) {
        _loadWallets();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sync completed successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else if (status == SyncStatus.failed) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sync failed. Will retry later.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    });
  }

  Future<void> _loadWallets() async {
    setState(() => _isLoading = true);

    try {
      final wallets = await _walletService.getUserWallets(widget.userId);
      setState(() {
        _wallets = wallets;
        if (_selectedWalletId == null && wallets.isNotEmpty) {
          _selectedWalletId = wallets.first.walletId;
        }
      });

      if (_selectedWalletId != null) {
        await _loadTransactions(_selectedWalletId!);
      }
    } catch (e) {
      _showError('Failed to load wallets: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadTransactions(String walletId) async {
    try {
      final transactions = await _walletService.getWalletTransactions(walletId);
      setState(() {
        _transactions[walletId] = transactions;
      });
    } catch (e) {
      _showError('Failed to load transactions: $e');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  Future<void> _performManualSync() async {
    final result = await _syncService.syncAll();
    if (result.success) {
      await _loadWallets();
    }
  }

  OfflineWallet? get _selectedWallet {
    if (_selectedWalletId == null) return null;
    return _wallets.firstWhere(
      (w) => w.walletId == _selectedWalletId,
      orElse: () => _wallets.first,
    );
  }

  List<OfflineTransaction> get _selectedWalletTransactions {
    if (_selectedWalletId == null) return [];
    return _transactions[_selectedWalletId] ?? [];
  }

  void _showSendMoneyDialog() {
    final amountController = TextEditingController();
    final descriptionController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Send Money'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Amount',
                prefixText: '\$',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description (optional)',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final amount = double.tryParse(amountController.text);
              if (amount == null || amount <= 0) {
                _showError('Invalid amount');
                return;
              }

              try {
                await _walletService.debitWallet(
                  walletId: _selectedWalletId!,
                  amount: amount,
                  category: 'payment_sent',
                  description: descriptionController.text,
                );

                Navigator.pop(context);
                await _loadWallets();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Transaction queued for sync'),
                  ),
                );
              } catch (e) {
                _showError(e.toString());
              }
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Offline Wallet'),
        actions: [
          if (_isSyncing)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.sync),
              onPressed: _performManualSync,
              tooltip: 'Sync now',
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadWallets,
              child: Column(
                children: [
                  // Wallet Selector
                  if (_wallets.length > 1)
                    SizedBox(
                      height: 120,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.all(16),
                        itemCount: _wallets.length,
                        itemBuilder: (context, index) {
                          final wallet = _wallets[index];
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedWalletId = wallet.walletId;
                              });
                              _loadTransactions(wallet.walletId);
                            },
                            child: WalletCard(
                              wallet: wallet,
                              isSelected: wallet.walletId == _selectedWalletId,
                            ),
                          );
                        },
                      ),
                    ),

                  // Selected Wallet Details
                  if (_selectedWallet != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Theme.of(context).primaryColor,
                            Theme.of(context).primaryColor.withOpacity(0.7),
                          ],
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Available Balance',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Text(
                                '${_selectedWallet!.currency} ${_selectedWallet!.availableBalance.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (!_selectedWallet!.isSynced)
                                const Padding(
                                  padding: EdgeInsets.only(left: 8),
                                  child: Icon(
                                    Icons.sync_problem,
                                    color: Colors.orange,
                                    size: 20,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              _buildInfoChip(
                                'Held: ${_selectedWallet!.heldBalance.toStringAsFixed(2)}',
                              ),
                              const SizedBox(width: 8),
                              _buildInfoChip(
                                'Pending: ${_selectedWallet!.pendingBalance.toStringAsFixed(2)}',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                  // Transactions List
                  Expanded(
                    child: _selectedWalletTransactions.isEmpty
                        ? const Center(
                            child: Text('No transactions yet'),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _selectedWalletTransactions.length,
                            itemBuilder: (context, index) {
                              final transaction =
                                  _selectedWalletTransactions[index];
                              return TransactionListItem(
                                transaction: transaction,
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
      floatingActionButton: _selectedWallet != null
          ? FloatingActionButton.extended(
              onPressed: _showSendMoneyDialog,
              icon: const Icon(Icons.send),
              label: const Text('Send'),
            )
          : null,
    );
  }

  Widget _buildInfoChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
        ),
      ),
    );
  }
}
