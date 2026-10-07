import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// import '../../Service/AuthStorage.dart';
import '../../Service/url.dart';

class RecentAttendance {
  final Url _api = Url();

  /// The last finished day, or null when there is none yet (the server answers 404).
  Future<(String, String, String, String, String)?> getRecentAttendance() async {
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

    // no attendance yet: a normal empty state, not an error
    if (response.statusCode == 404) return null;

    if (response.statusCode == 200) {
      Map<String, dynamic> jsonResponse = jsonDecode(response.body);
      return (
        jsonResponse['location'].toString(),
        jsonResponse['date'].toString(),
        jsonResponse['status'].toString(),
        jsonResponse['clock_in'].toString(),
        jsonResponse['clock_out'].toString(),
      );
    } else {
      throw Exception('Failed to load recent attendance: ${response.statusCode}');
    }
  }
}
