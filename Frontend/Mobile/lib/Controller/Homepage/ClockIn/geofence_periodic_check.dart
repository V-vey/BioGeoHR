import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../../Service/url.dart';
import 'location_check.dart';

final Url _api = Url();

/// What one periodic check found, so the clock-in screen can react to it.
enum GeofenceResult {
  inRange,
  outOfRange, // the server flagged it
  gpsOff, // the server flagged it: the place cannot be checked
  notClockedIn, // the server has no running clock-in today: the timer should resync
  sessionExpired, // 401: the login ended, so checking again is pointless until they log in
  failed, // no connection, a timeout or a server error: nothing was learned
}

Future<GeofenceResult> checkGeofencePeriodically() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    // the background service keeps its own copy of the saved values: read the current login, not the
    // one from when it started (logged out, or another account logged in)
    await prefs.reload();
    final token = prefs.getString("token");
    if (token == null) return GeofenceResult.sessionExpired;
    final headers = {
      "Authorization": "Bearer $token",
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    late final Position position;
    try {
      // a phone that cannot get a fix must not hang the check forever
      position = await determinePosition().timeout(const Duration(seconds: 30));
    } catch (e) {
      if (!e.toString().contains('Location services are disabled')) rethrow;
      // GPS turned off while clocked in: tell the server, which flags it for HR
      final response = await http
          .post(Uri.parse(_api.geofenceCheckGpsOff()), headers: headers)
          .timeout(const Duration(seconds: 15)); // a weak connection must not hang the check
      if (response.statusCode == 404) return GeofenceResult.notClockedIn;
      if (response.statusCode == 401) return GeofenceResult.sessionExpired;
      return response.statusCode == 200
          ? GeofenceResult.gpsOff
          : GeofenceResult.failed;
    }

    final response = await http
        .post(
          Uri.parse(_api.geofenceCheck()),
          headers: headers,
          body: jsonEncode({
            "userLong": position.longitude,
            "userLat": position.latitude,
          }),
        )
        .timeout(const Duration(seconds: 15));

    if (response.statusCode == 404) return GeofenceResult.notClockedIn;
    if (response.statusCode == 401) return GeofenceResult.sessionExpired;
    if (response.statusCode != 200) {
      print('Periodic geofence check: server answered ${response.statusCode}');
      return GeofenceResult.failed;
    }
    final message = jsonDecode(response.body)['message'];
    return message == 'Within boundary'
        ? GeofenceResult.inRange
        : GeofenceResult.outOfRange;
  } catch (e) {
    // a missed periodic check shouldn't interrupt the user's clocked-in session
    print('Periodic geofence check failed: $e');
    return GeofenceResult.failed;
  }
}
