import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/database/local_database.dart';
import 'core/services/offline_wallet_service.dart';
import 'core/services/sync_service.dart';
import 'core/services/wallet_encryption_service.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/home/screens/home_screen.dart';
import 'features/wallet/screens/offline_wallet_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize local database
  await LocalDatabase.instance.database;

  runApp(const GlobalFinTechApp());
}

class GlobalFinTechApp extends StatelessWidget {
  const GlobalFinTechApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<OfflineWalletService>(
          create: (_) => OfflineWalletService(),
        ),
        Provider<WalletEncryptionService>(
          create: (_) => WalletEncryptionService(),
        ),
        ProxyProvider<OfflineWalletService, SyncService>(
          update: (_, walletService, __) => SyncService(
            walletService: walletService,
            baseUrl: const String.fromEnvironment(
              'API_BASE_URL',
              defaultValue: 'https://api.globalfintech.com',
            ),
            apiKey: const String.fromEnvironment(
              'API_KEY',
              defaultValue: '',
            ),
          ),
        ),
      ],
      child: MaterialApp(
        title: 'Global FinTech',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            elevation: 0,
            centerTitle: true,
          ),
          cardTheme: CardTheme(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          floatingActionButtonTheme: const FloatingActionButtonThemeData(
            elevation: 4,
          ),
        ),
        home: const SplashScreen(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const HomeScreen(),
          '/wallet': (context) => const OfflineWalletScreen(
                userId: 'demo-user-id',
              ),
        },
      ),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToHome();
  }

  Future<void> _navigateToHome() async {
    // Simulate splash screen delay
    await Future.delayed(const Duration(seconds: 2));

    // TODO: Check if user is already logged in
    // For now, always navigate to login
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Theme.of(context).primaryColor,
              Theme.of(context).primaryColor.withOpacity(0.7),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.account_balance_wallet,
                size: 100,
                color: Colors.white,
              ),
              const SizedBox(height: 24),
              const Text(
                'Global FinTech',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your Offline Wallet',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 48),
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
