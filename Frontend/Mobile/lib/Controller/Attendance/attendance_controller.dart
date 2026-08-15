import '../../Service/url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'attendance_model.dart';

class AttendanceController {
  final Url _api = Url();

  Future<List<AttendanceModel>> getAttendance() async {
    final url = Uri.parse(_api.getAllAttendance());
    final prefs = await SharedPreferences.getInstance();
    //access the user
    String? token = prefs.getString("token");

    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );
    var jsonResponse = json.decode(response.body);
    List<AttendanceModel> attendances = [];
    for (var u in jsonResponse) {
      AttendanceModel attendance = AttendanceModel(
        location: u['location']?.toString() ?? "No Location",
        date: u['date']?.toString() ?? "No Date",
        status: u['status']?.toString() ?? "Unknown",
        clockIn: u['clock_in']?.toString() ?? "--:--",
        clockOut: u['clock_out']?.toString() ?? "--:--",
      );
      attendances.add(attendance);
    }

    print(attendances);
    return attendances;
    // return jsonResponse["message"].toString();
  }
}
