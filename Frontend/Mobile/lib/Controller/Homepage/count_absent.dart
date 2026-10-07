import '../../Service/url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CountAbsent {
  final Url _api = Url();

  /// How many days this month the employee was marked absent (0 when there are none).
  Future<int> countAbsent() async {
    final url = Uri.parse(_api.countAbsent());
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
      throw Exception('Failed to load absent count: ${response.statusCode}');
    }
    Map<String, dynamic> jsonResponse = jsonDecode(response.body);
    return jsonResponse["message"] as int;
  }
}
