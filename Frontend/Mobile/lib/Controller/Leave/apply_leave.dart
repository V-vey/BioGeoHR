import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

/// What the server answered to a leave application.
class ApplyLeaveResult {
  final bool ok; // true = saved, it now waits for HR
  final String message; // text to show the employee

  ApplyLeaveResult(this.ok, this.message);
}

class ApplyLeave {
  final Url _api = Url();

  Future<ApplyLeaveResult> send({
    required String type,
    required DateTime start,
    required DateTime end,
    required String reason,
  }) async {
    String two(int n) => n.toString().padLeft(2, '0');
    String day(DateTime d) =>
        '${d.year}-${two(d.month)}-${two(d.day)}'; // 2026-10-19

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final response = await http.post(
        Uri.parse(_api.applyLeave()),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'leave_type': type,
          'start_date': day(start),
          'end_date': day(end),
          'reason': reason,
        }),
      );

      if (response.statusCode == 401) {
        return ApplyLeaveResult(
          false,
          'Your session expired. Please log in again.',
        );
      }

      // 200 {"message": "..."}  or  422 {"message": "Insufficient leave balance"}
      String? message;
      try {
        message = (jsonDecode(response.body) as Map<String, dynamic>)['message']
            ?.toString();
      } catch (_) {
        // not JSON (for example an HTML error page): use the generic text below
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ApplyLeaveResult(true, message ?? 'Leave request sent');
      }
      return ApplyLeaveResult(
        false,
        message ?? 'Could not send your request (${response.statusCode})',
      );
    } catch (_) {
      return ApplyLeaveResult(
        false,
        'Could not reach the server. Check your connection.',
      );
    }
  }
}
