import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:workmanager/workmanager.dart';

import '../../Service/url.dart';
import '../Homepage/ClockIn/geofence_service.dart';

class Logout {
  final Url api = Url();
  Future<String> logoutUser() async {
    //get global token and id variables
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");
    String? userId = prefs.getString("id");

    //API
    final url = Uri.parse(api.getLogout());

    //Removing token from the database; with no connection the phone still logs out
    String body = '';
    try {
      final response = await http
          .post(
            url,
            headers: {
              "Authorization": "Bearer $token",
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            body: jsonEncode({"id": userId}),
          )
          .timeout(const Duration(seconds: 15));
      body = response.body;
    } catch (e) {
      // offline: the token is still removed from this phone below
    }

    // no one is logged in to check: stop every location check
    Workmanager().cancelByUniqueName("geofence-check");
    await stopGeofenceService();

    //Removing global var
    await prefs.remove('id');
    await prefs.remove('token');
    await prefs.remove('temp'); // the chosen location belongs to this account

    return body;
  }
}
