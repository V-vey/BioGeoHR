import '../../../Service/url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SaveclockInOut {
  final Url _api = Url();

  void clockIn() async {
    final url = Uri.parse(_api.clockIn());
    final prefs = await SharedPreferences.getInstance();
    //access the user
    String? token = prefs.getString("token");
    String? locationName = prefs.getString("temp");
    String? userId = prefs.getString('id');

    await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: jsonEncode({"user_id": userId, "location_name": locationName}),
    );
  }

  void clockOut() async {
    final url = Uri.parse(_api.clockOut());
    final prefs = await SharedPreferences.getInstance();
    //access the user
    String? token = prefs.getString("token");
    String? userId = prefs.getString('id');

    await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: jsonEncode({"user_id": userId}),
    );
  }
}
