import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';

import 'core/api/dio_client.dart';
import 'core/routes/app_router.dart';
import 'features/movement/pages/movement_detail_page.dart';
import 'features/qr/services/qr_parser_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  DioClient.ensureInitialized();

  OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
  OneSignal.initialize('5ceca32c-58cc-42b9-bb9c-d6f1145c34df');
  await OneSignal.Notifications.requestPermission(true);

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late final AppLinks _appLinks;

  @override
  void initState() {
    super.initState();
    _appLinks = AppLinks();
    _initDeepLinks();
  }

  void _initDeepLinks() {
    _appLinks.uriLinkStream.listen(_handleDeepLink);

    _appLinks.getInitialLink().then((uri) {
      if (uri != null) _handleDeepLink(uri);
    });
  }

  void _handleDeepLink(Uri uri) {
    if (uri.scheme != 'activos-app') return;
    if (uri.host != 'sign-movement') return;

    final payload = QrParserService.parse(uri.toString());
    if (payload == null) return;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final context = navigatorKey.currentContext;
      if (context == null) return;

      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => MovementDetailPage(payload: payload),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      debugShowCheckedModeBanner: false,
      title: 'Flutter Signature',
      initialRoute: '/',
      routes: AppRouter.routes,
    );
  }
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
