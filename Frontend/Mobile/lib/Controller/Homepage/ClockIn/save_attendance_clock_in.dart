import '../../../Service/url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SaveclockInOut {
  final Url _api = Url();

  Future<bool> clockIn() async {
    final url = Uri.parse(_api.clockIn());
    final prefs = await SharedPreferences.getInstance();
    //access the user
    String? token = prefs.getString("token");
    String? locationName = prefs.getString("temp");

    try {
      final response = await http
          .post(
            url,
            headers: {
              "Authorization": "Bearer $token",
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            body: jsonEncode({"location_name": locationName}),
          )
          .timeout(const Duration(seconds: 15)); // a weak connection must not hang the button
      print('Clock-in response: ${response.statusCode} - ${response.body}');
      return response.statusCode == 201;
    } catch (e) {
      print('Clock-in request failed: $e');
      // a dead connection is not "the server said no": the clock-in button tells them apart
      rethrow;
    }
  }

  /// Clock In was pressed with the GPS off: tell the server so it goes in the audit log. The server
  /// writes the message itself, so nothing is sent. Best effort: if it fails, the employee is not told.
  Future<void> reportGpsOff() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await http
          .post(
            Uri.parse(_api.clockInGpsOff()),
            headers: {
              "Authorization": "Bearer ${prefs.getString("token")}",
              "Accept": "application/json",
            },
          )
          .timeout(const Duration(seconds: 10));
    } catch (e) {
      print('Could not report GPS off: $e');
    }
  }

  /// The fingerprint/face check did not pass: send only the reason code (see Biometric.failureCode),
  /// the server writes the audit sentence. Best effort: a failure here is not shown to the employee.
  Future<void> reportBiometricFailed(String reason) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await http
          .post(
            Uri.parse(_api.clockInBiometricFailed()),
            headers: {
              "Authorization": "Bearer ${prefs.getString("token")}",
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            body: jsonEncode({"reason": reason}),
          )
          .timeout(const Duration(seconds: 10));
    } catch (e) {
      print('Could not report the biometric failure: $e');
    }
  }

  void clockOut() async {
    final url = Uri.parse(_api.clockOut());
    final prefs = await SharedPreferences.getInstance();
    //access the user
    String? token = prefs.getString("token");

    await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );
  }
}
