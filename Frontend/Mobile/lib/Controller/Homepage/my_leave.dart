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
  final DateTime? createdAt; // when the employee submitted it

  LeaveRequestData({
    required this.id,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.reason,
    required this.status,
    this.remarks,
    this.createdAt,
  });

  /// Calendar days covered, counted the way the server counts them (both ends included).
  int get days => endDate.difference(startDate).inDays + 1;

  /// "1 day" / "2 days"
  String get durationText => days == 1 ? '1 day' : '$days days';

  /// "4/7/2026 - 4/8/2026" (the style of the mockup)
  String get dateSpan {
    final f = DateFormat('M/d/yyyy');
    return '${f.format(startDate)} - ${f.format(endDate)}';
  }

  /// "4/6/2026", or '' when the server did not send it
  String get submittedOn => createdAt == null
      ? ''
      : DateFormat('M/d/yyyy').format(createdAt!.toLocal());

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
        createdAt: DateTime.tryParse((j['created_at'] ?? '').toString()),
      );
}

/// One page of the employee's leave requests, newest first.
class LeavePage {
  final List<LeaveRequestData> records;
  final int page; // the page these records belong to (1-based)
  final int lastPage; // how many pages there are (at least 1)
  final int total; // how many requests the employee has in all

  const LeavePage({
    required this.records,
    required this.page,
    required this.lastPage,
    required this.total,
  });
}

class MyLeave {
  final Url _api = Url();

  /// One page of the employee's leave requests, newest first. The server sends only [perPage]
  /// requests, so a long history is never downloaded whole. A page past the end gives the last
  /// page; an employee who has not applied yet gets an empty page 1.
  Future<LeavePage> getPage(int page, {int perPage = 5}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      Uri.parse(_api.getMyLeave()).replace(
        queryParameters: {'page': '$page', 'per_page': '$perPage'},
      ),
      headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load leave requests: ${response.statusCode}');
    }
    final body = jsonDecode(response.body);

    // a server that has not been updated yet still sends the whole list (newest first): page it here
    if (body is List) {
      final all = body
          .map((e) => LeaveRequestData.fromJson(e as Map<String, dynamic>))
          .toList();
      final lastPage = all.isEmpty ? 1 : (all.length / perPage).ceil();
      final shown = page > lastPage ? lastPage : page;
      return LeavePage(
        records: all.skip((shown - 1) * perPage).take(perPage).toList(),
        page: shown,
        lastPage: lastPage,
        total: all.length,
      );
    }

    final records = (body['data'] as List)
        .map((e) => LeaveRequestData.fromJson(e as Map<String, dynamic>))
        .toList();
    final lastPage = (body['last_page'] as num?)?.toInt() ?? 1;
    final total = (body['total'] as num?)?.toInt() ?? records.length;

    // the page asked for no longer exists (requests were removed): show the last one
    if (records.isEmpty && total > 0 && page > lastPage) {
      return getPage(lastPage, perPage: perPage);
    }

    return LeavePage(
      records: records,
      page: (body['current_page'] as num?)?.toInt() ?? page,
      lastPage: lastPage < 1 ? 1 : lastPage,
      total: total,
    );
  }
}
