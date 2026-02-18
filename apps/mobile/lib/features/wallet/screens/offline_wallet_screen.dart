import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:google_fonts/google_fonts.dart';

class OfflineWalletScreen extends StatefulWidget {
  const OfflineWalletScreen({super.key});

  @override
  State<OfflineWalletScreen> createState() => _OfflineWalletScreenState();
}

class _OfflineWalletScreenState extends State<OfflineWalletScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E17), // fintech-dark
      body: Stack(
        children: [
          // Background Gradients - Optimized with RepaintBoundary
          Positioned(
            top: -100,
            left: -100,
            child: RepaintBoundary(
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF2D5BFF).withOpacity(0.2),
                  blurRadius: 100,
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            right: -100,
            child: RepaintBoundary(
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF6C42F5).withOpacity(0.2),
                  blurRadius: 100,
                ),
              ),
            ),
          ),
          
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome back,',
                            style: GoogleFonts.inter(
                              color: Colors.grey[400],
                              fontSize: 14,
                            ),
                          ).animate().fadeIn().slideX(),
                          const SizedBox(height: 4),
                          Text(
                            'Abiola',
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ).animate().fadeIn().slideX(delay: 100.ms),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.notifications_none, color: Colors.white),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ),

                // Wallet Card
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: GlassmorphicContainer(
                    width: double.infinity,
                    height: 200,
                    borderRadius: 24,
                    blur: 20,
                    alignment: Alignment.center,
                    border: 1,
                    linearGradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withOpacity(0.1),
                        Colors.white.withOpacity(0.05),
                      ],
                    ),
                    borderGradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withOpacity(0.5),
                        Colors.white.withOpacity(0.1),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Total Balance',
                                style: GoogleFonts.inter(
                                  color: Colors.grey[300],
                                  fontSize: 14,
                                ),
                              ),
                              const Icon(Icons.credit_card, color: Colors.white),
                            ],
                          ),
                          Text(
                            '\$24,500.00',
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ).animate().fadeIn().scale(delay: 200.ms),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '**** 4589',
                                style: GoogleFonts.inter(
                                  color: Colors.grey[300],
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                'EXP 12/28',
                                style: GoogleFonts.inter(
                                  color: Colors.grey[300],
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ).animate().fadeIn().slideY(begin: 0.2, end: 0, delay: 200.ms),

                const SizedBox(height: 32),

                // Actions
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildActionButton(context, Icons.send, 'Send', () {}),
                      _buildActionButton(context, Icons.add, 'Top Up', () {}),
                      _buildActionButton(context, Icons.history, 'History', () {
                        Navigator.pushNamed(context, '/history');
                      }),
                      _buildActionButton(context, Icons.more_horiz, 'More', () {}),
                    ],
                  ),
                ).animate().fadeIn().slideY(begin: 0.2, end: 0, delay: 300.ms),

                const SizedBox(height: 32),

                // AI Advisor Banner
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: GestureDetector(
                    onTap: _showAIAdvisor,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF2D5BFF), Color(0xFF00D2FF)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF2D5BFF).withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.psychology, color: Colors.white),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'AI Financial Advisor',
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  'Tap for insights',
                                  style: GoogleFonts.inter(
                                    color: Colors.white.withOpacity(0.8),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 16),
                        ],
                      ),
                    ),
                  ),
                ).animate().fadeIn().slideX(delay: 400.ms),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: GoogleFonts.inter(
              color: Colors.grey[400],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  void _showAIAdvisor() async {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Color(0xFF0A0E17),
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          border: Border(top: BorderSide(color: Color(0xFF2D5BFF), width: 1)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 16),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[800],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 32),
            const Icon(Icons.psychology, size: 64, color: Color(0xFF00D2FF)),
            const SizedBox(height: 16),
            Text(
              'AI Insights',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 32),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Text(
                'Based on your transaction history, you could save 15% by optimizing your transfer times. Would you like to enable auto-optimization?',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  color: Colors.grey[300],
                  fontSize: 16,
                  height: 1.5,
                ),
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2D5BFF),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    'Enable Optimization',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
