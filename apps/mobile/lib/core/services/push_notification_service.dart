import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'dart:io' show Platform;

class PushNotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'atlasx_notifications',
    'AtlasX Notifications',
    description: 'Notifications for transactions, payments, and account activity',
    importance: Importance.high,
  );

  /// Initialize push notifications
  Future<void> initialize() async {
    // Request permission (iOS)
    final settings = await _fcm.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    if (settings.authorizationStatus != AuthorizationStatus.authorized) {
      print('User declined push notification permissions');
      return;
    }

    // Configure local notifications
    const initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const initializationSettingsIOS = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channel (Android)
    if (Platform.isAndroid) {
      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(_channel);
    }

    // Get FCM token
    final token = await _fcm.getToken();
    print('FCM Token: $token');

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification taps
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
  }

  /// Get FCM token for backend registration
  Future<String?> getToken() async {
    return await _fcm.getToken();
  }

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    await _fcm.subscribeToTopic(topic);
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _fcm.unsubscribeFromTopic(topic);
  }

  /// Handle foreground messages
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('Foreground message: ${message.messageId}');

    final notification = message.notification;
    final data = message.data;

    if (notification != null) {
      await _showLocalNotification(
        title: notification.title ?? 'AtlasX',
        body: notification.body ?? '',
        payload: data.toString(),
      );
    }
  }

  /// Handle background messages
  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    print('Background message: ${message.messageId}');
    // Process notification in background
  }

  /// Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    print('Notification tapped: ${message.messageId}');

    final data = message.data;

    // Navigate based on notification type
    if (data.containsKey('type')) {
      switch (data['type']) {
        case 'transaction':
          // Navigate to transaction details
          break;
        case 'payment':
          // Navigate to payment details
          break;
        case 'card':
          // Navigate to cards
          break;
        case 'kyc':
          // Navigate to KYC screen
          break;
        default:
          // Navigate to home
          break;
      }
    }
  }

  /// Show local notification
  Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'atlasx_notifications',
      'AtlasX Notifications',
      channelDescription: 'Notifications for transactions, payments, and account activity',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecond,
      title,
      body,
      details,
      payload: payload,
    );
  }

  /// Handle local notification tap
  void _onNotificationTapped(NotificationResponse response) {
    print('Local notification tapped: ${response.payload}');
    // Parse payload and navigate
  }

  /// Send notification types
  Future<void> sendTransactionNotification({
    required String title,
    required String body,
    required String transactionId,
  }) async {
    await _showLocalNotification(
      title: title,
      body: body,
      payload: 'transaction:$transactionId',
    );
  }

  Future<void> sendPaymentNotification({
    required String title,
    required String body,
    required String paymentId,
  }) async {
    await _showLocalNotification(
      title: title,
      body: body,
      payload: 'payment:$paymentId',
    );
  }

  Future<void> sendSecurityAlert({
    required String title,
    required String body,
  }) async {
    await _showLocalNotification(
      title: title,
      body: body,
      payload: 'security:alert',
    );
  }

  /// Clear all notifications
  Future<void> clearAllNotifications() async {
    await _localNotifications.cancelAll();
  }
}
