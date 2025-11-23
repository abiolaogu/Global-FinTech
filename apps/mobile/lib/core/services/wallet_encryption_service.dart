import 'dart:convert';
import 'dart:typed_data';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:crypto/crypto.dart';

class WalletEncryptionService {
  static const String _keyStorageKey = 'wallet_encryption_key';
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // Get or create encryption key
  Future<encrypt.Key> _getEncryptionKey() async {
    String? keyString = await _secureStorage.read(key: _keyStorageKey);

    if (keyString == null) {
      // Generate new key
      final key = encrypt.Key.fromSecureRandom(32);
      await _secureStorage.write(
        key: _keyStorageKey,
        value: base64Encode(key.bytes),
      );
      return key;
    } else {
      return encrypt.Key(base64Decode(keyString));
    }
  }

  // Encrypt data
  Future<String> encryptData(String data) async {
    final key = await _getEncryptionKey();
    final iv = encrypt.IV.fromSecureRandom(16);
    final encrypter = encrypt.Encrypter(encrypt.AES(key));

    final encrypted = encrypter.encrypt(data, iv: iv);

    // Combine IV and encrypted data
    return '${base64Encode(iv.bytes)}:${encrypted.base64}';
  }

  // Decrypt data
  Future<String> decryptData(String encryptedData) async {
    final key = await _getEncryptionKey();
    final parts = encryptedData.split(':');

    if (parts.length != 2) {
      throw Exception('Invalid encrypted data format');
    }

    final iv = encrypt.IV(base64Decode(parts[0]));
    final encrypted = encrypt.Encrypted.fromBase64(parts[1]);
    final encrypter = encrypt.Encrypter(encrypt.AES(key));

    return encrypter.decrypt(encrypted, iv: iv);
  }

  // Hash PIN for verification
  String hashPin(String pin) {
    final bytes = utf8.encode(pin);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Verify PIN
  bool verifyPin(String pin, String hashedPin) {
    return hashPin(pin) == hashedPin;
  }

  // Encrypt wallet balance (for display purposes)
  Future<String> encryptBalance(double balance) async {
    return await encryptData(balance.toString());
  }

  // Decrypt wallet balance
  Future<double> decryptBalance(String encryptedBalance) async {
    final decrypted = await decryptData(encryptedBalance);
    return double.parse(decrypted);
  }

  // Generate transaction signature
  String generateTransactionSignature(Map<String, dynamic> transaction) {
    final data = json.encode(transaction);
    final bytes = utf8.encode(data);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Verify transaction signature
  bool verifyTransactionSignature(
    Map<String, dynamic> transaction,
    String signature,
  ) {
    return generateTransactionSignature(transaction) == signature;
  }

  // Clear all encryption keys (logout)
  Future<void> clearKeys() async {
    await _secureStorage.delete(key: _keyStorageKey);
  }
}
