import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class BiometricService {
  final LocalAuthentication _localAuth = LocalAuthentication();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  static const String _biometricEnabledKey = 'biometric_enabled';
  static const String _biometricTokenKey = 'biometric_token';

  /// Check if device supports biometric authentication
  Future<bool> isBiometricAvailable() async {
    try {
      return await _localAuth.canCheckBiometrics;
    } catch (e) {
      return false;
    }
  }

  /// Get available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      return [];
    }
  }

  /// Check if biometric is enabled for the user
  Future<bool> isBiometricEnabled() async {
    final enabled = await _secureStorage.read(key: _biometricEnabledKey);
    return enabled == 'true';
  }

  /// Enable biometric authentication
  Future<bool> enableBiometric(String authToken) async {
    try {
      // Authenticate first to verify user intent
      final authenticated = await authenticate(
        reason: 'Enable biometric login',
      );

      if (!authenticated) {
        return false;
      }

      // Store auth token securely
      await _secureStorage.write(
        key: _biometricTokenKey,
        value: authToken,
      );

      await _secureStorage.write(
        key: _biometricEnabledKey,
        value: 'true',
      );

      return true;
    } catch (e) {
      return false;
    }
  }

  /// Disable biometric authentication
  Future<void> disableBiometric() async {
    await _secureStorage.delete(key: _biometricTokenKey);
    await _secureStorage.write(
      key: _biometricEnabledKey,
      value: 'false',
    );
  }

  /// Authenticate with biometric
  Future<bool> authenticate({
    required String reason,
    bool useErrorDialogs = true,
    bool stickyAuth = true,
  }) async {
    try {
      final isAvailable = await isBiometricAvailable();
      if (!isAvailable) {
        return false;
      }

      return await _localAuth.authenticate(
        localizedReason: reason,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: true,
        ),
      );
    } catch (e) {
      return false;
    }
  }

  /// Login with biometric
  Future<String?> loginWithBiometric() async {
    try {
      final isEnabled = await isBiometricEnabled();
      if (!isEnabled) {
        return null;
      }

      final authenticated = await authenticate(
        reason: 'Authenticate to access AtlasX',
      );

      if (!authenticated) {
        return null;
      }

      // Retrieve stored auth token
      final token = await _secureStorage.read(key: _biometricTokenKey);
      return token;
    } catch (e) {
      return null;
    }
  }

  /// Authenticate for sensitive action
  Future<bool> authenticateForSensitiveAction(String action) async {
    return await authenticate(
      reason: 'Authenticate to $action',
      useErrorDialogs: true,
      stickyAuth: true,
    );
  }

  /// Get biometric type name
  String getBiometricTypeName(List<BiometricType> types) {
    if (types.contains(BiometricType.face)) {
      return 'Face ID';
    } else if (types.contains(BiometricType.fingerprint)) {
      return 'Fingerprint';
    } else if (types.contains(BiometricType.iris)) {
      return 'Iris';
    } else {
      return 'Biometric';
    }
  }

  /// Clear all biometric data
  Future<void> clearBiometricData() async {
    await _secureStorage.delete(key: _biometricTokenKey);
    await _secureStorage.delete(key: _biometricEnabledKey);
  }
}
