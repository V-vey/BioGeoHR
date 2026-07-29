import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// import '../../Service/AuthStorage.dart';
import '../../Service/url.dart';

class RecentAttendance {
  final Url _api = Url();

  Future<(String, String, String)> getRecentAttendance() async {
    //get global var
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");

    final url = Uri.parse(_api.recentAttendance());
    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );
    Map<String, dynamic> jsonResponse = await jsonDecode(response.body);

    if (response.statusCode == 200) {
      return (
        jsonResponse['location'].toString(),
        jsonResponse['date'].toString(),
        jsonResponse['status'].toString(),
      );
    } else {
      throw Exception('Failed to load leave balance: ${response.statusCode}');
    }
  }
}
