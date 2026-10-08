import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

/// What the server answered to a cancel request.
class CancelLeaveResult {
  final bool ok; // true = the request is gone
  final String message; // text to show the employee

  CancelLeaveResult(this.ok, this.message);
}

class CancelLeave {
  final Url _api = Url();

  Future<CancelLeaveResult> cancel(int id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final response = await http.delete(
        Uri.parse(_api.cancelLeave(id)),
        headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
      );

      if (response.statusCode == 401) {
        return CancelLeaveResult(false, 'Your session expired. Please log in again.');
      }

      // 200 {"message": "Leave request cancelled"}, or 404 / 422 with the reason
      String? message;
      try {
        message = (jsonDecode(response.body) as Map<String, dynamic>)['message']?.toString();
      } catch (_) {
        // not JSON (for example an HTML error page): use the generic text below
      }

      if (response.statusCode == 200) {
        return CancelLeaveResult(true, message ?? 'Leave request cancelled');
      }
      return CancelLeaveResult(
        false,
        message ?? 'Could not cancel your request (${response.statusCode})',
      );
    } catch (_) {
      return CancelLeaveResult(false, 'Could not reach the server. Check your connection.');
    }
  }
}
