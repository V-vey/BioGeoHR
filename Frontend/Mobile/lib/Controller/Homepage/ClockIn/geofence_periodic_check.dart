import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../../Service/url.dart';
import 'location_check.dart';

final Url _api = Url();

Future<void> checkGeofencePeriodically() async {
  try {
    final position = await determinePosition();
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");

    final url = Uri.parse(_api.geofenceCheck());
    await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "userLong": position.longitude,
        "userLat": position.latitude,
      }),
    );
  } catch (e) {
    // a missed periodic check shouldn't interrupt the user's clocked-in session
    print('Periodic geofence check failed: $e');
  }
}
