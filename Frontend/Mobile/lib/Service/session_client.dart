import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:workmanager/workmanager.dart';

// lets code outside a screen change screens and show a message
final navigatorKey = GlobalKey<NavigatorState>();
final messengerKey = GlobalKey<ScaffoldMessengerState>();

bool _handling = false;

Future<void> sessionExpired() async {
  Workmanager().cancelByUniqueName("geofence-check");
  if (_handling) return; // five cards fail at once -> only the first one acts
  _handling = true;
  final prefs = await SharedPreferences.getInstance();
  if (prefs.getString('token') != null) {
    // already logged out? then nothing to do
    await prefs.remove('token');
    await prefs.remove('id');
    navigatorKey.currentState?.popUntil(
      (r) => r.isFirst,
    ); // back to the login screen
    messengerKey.currentState?.showSnackBar(
      const SnackBar(
        content: Text('Your session expired. Please log in again.'),
      ),
    );
  }
  _handling = false;
}

// wraps the normal client and looks at every reply
class SessionClient extends http.BaseClient {
  final http.Client _inner;
  SessionClient(this._inner);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final response = await _inner.send(request);
    final sentToken =
        request.headers['Authorization']?.startsWith('Bearer ') ?? false;
    if (response.statusCode == 401 && sentToken) {
      sessionExpired(); // not awaited: the card still gets its reply
    }
    return response;
  }
}
