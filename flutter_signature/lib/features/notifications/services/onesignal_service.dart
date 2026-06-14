import 'package:onesignal_flutter/onesignal_flutter.dart';

class OneSignalService {
  static Future<void> initialize() async {
    OneSignal.initialize(
      '5ceca32c-58cc-42b9-bb9c-d6f1145c34df',
    );

    await OneSignal.Notifications.requestPermission(
      true,
    );
  }
}