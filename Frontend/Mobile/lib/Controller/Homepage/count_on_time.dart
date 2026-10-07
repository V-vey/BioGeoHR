import '../../Service/url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CountOnTime {
  final Url _api = Url();

  /// How many days this month the employee clocked in on time (0 when there is nothing yet).
  Future<int> countOnTime() async {
    final url = Uri.parse(_api.countOnTime());
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");

    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load on-time count: ${response.statusCode}');
    }
    Map<String, dynamic> jsonResponse = jsonDecode(response.body);
    return jsonResponse["message"] as int;
  }
}
