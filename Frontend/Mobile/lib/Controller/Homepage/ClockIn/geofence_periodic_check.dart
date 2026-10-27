import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:workmanager/workmanager.dart';

import '../../../Service/url.dart';
import 'location_check.dart';

final Url _api = Url();

/// What one periodic check found, so the clock-in screen can react to it.
enum GeofenceResult {
  inRange,
  outOfRange, // the server flagged it
  gpsOff, // the server flagged it: the place cannot be checked
  notClockedIn, // the server has no running clock-in today: the timer should resync
  failed, // no connection, a timeout or a server error: nothing was learned
}

Future<GeofenceResult> checkGeofencePeriodically() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final headers = {
      "Authorization": "Bearer ${prefs.getString("token")}",
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    late final Position position;
    try {
      position = await determinePosition();
    } catch (e) {
      if (!e.toString().contains('Location services are disabled')) rethrow;
      // GPS turned off while clocked in: tell the server, which flags it for HR
      final response = await http
          .post(Uri.parse(_api.geofenceCheckGpsOff()), headers: headers)
          .timeout(const Duration(seconds: 15)); // a weak connection must not hang the check
      if (response.statusCode == 404) return GeofenceResult.notClockedIn;
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

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    // in the background there is no screen to update; the server has already flagged what it needs to
    await checkGeofencePeriodically();
    return Future.value(true);
  });
}
