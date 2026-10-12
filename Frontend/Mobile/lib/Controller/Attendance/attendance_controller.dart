import '../../Service/url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'attendance_model.dart';

class AttendanceController {
  final Url _api = Url();

  AttendanceModel _record(dynamic u) => AttendanceModel(
    location: u['location']?.toString() ?? "No Location",
    date: u['date']?.toString() ?? "No Date",
    status: u['status']?.toString() ?? "Unknown",
    clockIn: u['clock_in']?.toString() ?? "--:--",
    clockOut: u['clock_out']?.toString() ?? "--:--",
    workedSeconds: (u['worked_seconds'] as num?)?.toInt(),
  );

  /// One page of the logged-in employee's attendance, newest day first. The server sends only
  /// [perPage] records, so a long history is never downloaded whole. A page past the end gives
  /// the last page; an employee with no records gets an empty page 1. With [date] only that
  /// day is returned (null = every day).
  Future<AttendancePage> getAttendancePage(
    int page, {
    int perPage = 7,
    DateTime? date,
  }) async {
    String two(int n) => n.toString().padLeft(2, '0');
    final day = date == null ? null : '${date.year}-${two(date.month)}-${two(date.day)}';
    final url = Uri.parse(_api.getAllAttendance()).replace(
      queryParameters: {
        'page': '$page',
        'per_page': '$perPage',
        'date': ?day,
      },
    );
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

    // an error reply (expired session, server down) is not a page: stop here
    // instead of crashing while reading it
    if (response.statusCode != 200) {
      throw Exception('Failed to load attendance: ${response.statusCode}');
    }

    final body = json.decode(response.body);

    // a server that has not been updated yet still sends the whole list: page it here
    if (body is List) {
      final all = body.map(_record).toList()
        ..sort((a, b) => b.date.compareTo(a.date));
      // an old server ignores the date too: keep only that day here
      if (day != null) all.removeWhere((a) => !a.date.startsWith(day));
      final lastPage = all.isEmpty ? 1 : (all.length / perPage).ceil();
      final shown = page > lastPage ? lastPage : page;
      final start = (shown - 1) * perPage;
      return AttendancePage(
        records: all.skip(start).take(perPage).toList(),
        page: shown,
        lastPage: lastPage,
        total: all.length,
      );
    }

    final records = (body['data'] as List).map(_record).toList();
    final lastPage = (body['last_page'] as num?)?.toInt() ?? 1;
    final total = (body['total'] as num?)?.toInt() ?? records.length;

    // the page asked for no longer exists (records were removed): show the last one
    if (records.isEmpty && total > 0 && page > lastPage) {
      return getAttendancePage(lastPage, perPage: perPage, date: date);
    }

    return AttendancePage(
      records: records,
      page: (body['current_page'] as num?)?.toInt() ?? page,
      lastPage: lastPage < 1 ? 1 : lastPage,
      total: total,
    );
  }
}
