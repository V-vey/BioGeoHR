import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

/// One leave request of the logged-in employee.
class LeaveRequestData {
  final int id;
  final String type; // "Sick Leave", "Vacation Leave", ...
  final DateTime startDate;
  final DateTime endDate;
  final String reason;
  final String status; // "Pending" | "Approved" | "Rejected"
  final String? remarks; // what HR wrote when deciding (can be empty)

  LeaveRequestData({
    required this.id,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.reason,
    required this.status,
    this.remarks,
  });

  /// "Oct 14 – Oct 15, 2026", or "Oct 12, 2026" for a one-day leave.
  String get dateRange {
    final day = DateFormat('MMM d');
    final full = DateFormat('MMM d, yyyy');
    return startDate == endDate
        ? full.format(startDate)
        : '${day.format(startDate)} – ${full.format(endDate)}';
  }

  factory LeaveRequestData.fromJson(Map<String, dynamic> j) => LeaveRequestData(
        id: j['id'] as int,
        type: j['leave_type'].toString(),
        startDate: DateTime.parse(j['start_date']),
        endDate: DateTime.parse(j['end_date']),
        reason: (j['reason'] ?? '').toString(),
        status: j['status'].toString(),
        remarks: j['remarks']?.toString(),
      );
}

class MyLeave {
  final Url _api = Url();

  /// All of the employee's leave requests, newest first (the server sorts them).
  /// An empty list means they have not applied for leave yet.
  Future<List<LeaveRequestData>> getAll() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      Uri.parse(_api.getMyLeave()),
      headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load leave requests: ${response.statusCode}');
    }
    final List<dynamic> list = jsonDecode(response.body);
    return list
        .map((e) => LeaveRequestData.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
