import 'package:flutter/material.dart';
import '../../../core/models/offline_wallet.dart';

class WalletCard extends StatelessWidget {
  final OfflineWallet wallet;
  final bool isSelected;

  const WalletCard({
    Key? key,
    required this.wallet,
    this.isSelected = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isSelected
              ? [Colors.blue.shade400, Colors.blue.shade600]
              : [Colors.grey.shade300, Colors.grey.shade400],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  wallet.currency,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.black87,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (!wallet.isSynced)
                  Icon(
                    Icons.cloud_off,
                    size: 16,
                    color: isSelected ? Colors.white70 : Colors.black54,
                  ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Balance',
                  style: TextStyle(
                    color: isSelected
                        ? Colors.white.withOpacity(0.8)
                        : Colors.black54,
                    fontSize: 10,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  wallet.balance.toStringAsFixed(2),
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.black87,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
