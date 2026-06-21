import 'package:flutter/material.dart';

import '../../features/auth/pages/home_page.dart';
import '../../features/auth/pages/login_page.dart';
import '../../features/chatbot/pages/chatbot_page.dart';

class AppRouter {
  static Map<String, WidgetBuilder> routes = {
    '/': (_) => const LoginPage(),
    '/home': (_) => const HomePage(),
    '/chatbot': (_) => const ChatbotPage(),
  };
}
