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
      final response = await http.post(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: jsonEncode({"location_name": locationName}),
      );
      print('Clock-in response: ${response.statusCode} - ${response.body}');
      return response.statusCode == 201;
    } catch (e) {
      print('Clock-in request failed: $e');
      return false;
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
