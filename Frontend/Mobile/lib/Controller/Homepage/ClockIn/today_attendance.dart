import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../Service/url.dart';

class TodayAttendance {
  final bool running; // clocked in and not yet clocked out
  final int elapsedSeconds; // time since clock-in, measured by the server
  final String status; // On-Time / Late

  TodayAttendance({
    required this.running,
    required this.elapsedSeconds,
    required this.status,
  });

  factory TodayAttendance.fromJson(Map<String, dynamic> j) => TodayAttendance(
    running: j['running'] == true,
    elapsedSeconds: (j['elapsed_seconds'] as num? ?? 0).toInt(),
    status: j['status']?.toString() ?? '',
  );
}

class GetTodayAttendance {
  final Url _api = Url();

  /// Today's record, or null when the employee has not clocked in today (404).
  Future<TodayAttendance?> get() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      Uri.parse(_api.todayAttendance()),
      headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
    );

    if (response.statusCode == 200) {
      return TodayAttendance.fromJson(jsonDecode(response.body));
    }
    if (response.statusCode == 404) return null; // "Not clocked in today"
    throw Exception('Failed to load today\'s attendance: ${response.statusCode}');
  }
}
