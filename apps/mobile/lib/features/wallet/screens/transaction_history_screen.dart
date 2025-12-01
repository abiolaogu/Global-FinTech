import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:google_fonts/google_fonts.dart';

class TransactionHistoryScreen extends StatelessWidget {
  const TransactionHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E17),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Text(
                    'History',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.filter_list, color: Colors.white),
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            // List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                itemCount: 10,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16.0),
                    child: GlassmorphicContainer(
                      width: double.infinity,
                      height: 80,
                      borderRadius: 16,
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
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.shopping_bag, color: Colors.white, size: 20),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Apple Store',
                                    style: GoogleFonts.inter(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    'Today, 10:30 AM',
                                    style: GoogleFonts.inter(
                                      color: Colors.grey[400],
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '-\$45.20',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ).animate().fadeIn().slideY(delay: (50 * index).ms);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
