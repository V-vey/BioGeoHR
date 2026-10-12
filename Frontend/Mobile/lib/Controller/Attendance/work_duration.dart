/// Hours spent at work for one attendance row, from time-in to time-out (FR10),
/// written for the employee: "9h 02m", "45m".
///
/// [timeIn] / [timeOut] are the server's "HH:mm:ss" times (anything else counts as missing).
/// [date] ("2026-10-07" or a full timestamp) is only used to tell a day that is still in
/// progress from one where the employee forgot to clock out. [now] is for tests.
///
/// A day can have several clock-ins (in, out, in again). When the server sends [workedSeconds],
/// the total of all sessions, that is shown (the time between sessions is not counted); without
/// it the times above are used.
String workDuration(
  String timeIn,
  String timeOut, {
  String date = '',
  DateTime? now,
  int? workedSeconds,
}) {
  if (workedSeconds != null && workedSeconds > 0) {
    final h = workedSeconds ~/ 3600;
    final m = (workedSeconds % 3600) ~/ 60;
    return h == 0 ? '${m}m' : '${h}h ${m.toString().padLeft(2, '0')}m';
  }
  final start = _seconds(timeIn);
  final end = _seconds(timeOut);

  if (start != null && end != null) {
    final worked = end - start;
    if (worked < 0) return '--'; // out before in: the data is wrong, do not show nonsense
    final h = worked ~/ 3600;
    final m = (worked % 3600) ~/ 60;
    if (h == 0) return '${m}m';
    return '${h}h ${m.toString().padLeft(2, '0')}m';
  }

  // clocked in but no clock-out: working right now if it is today, otherwise unknown
  if (start != null && end == null) {
    final today = now ?? DateTime.now();
    String two(int n) => n.toString().padLeft(2, '0');
    final todayText = '${today.year}-${two(today.month)}-${two(today.day)}';
    if (date.length >= 10 && date.substring(0, 10) == todayText) {
      return 'Still working';
    }
  }
  return '--';
}

// "08:21:00" -> seconds since midnight; null for "--:--", "", "null" and the like
int? _seconds(String t) {
  final m = RegExp(r'^(\d{1,2}):(\d{2})(?::(\d{2}))?$').firstMatch(t.trim());
  if (m == null) return null;
  final h = int.parse(m.group(1)!);
  final min = int.parse(m.group(2)!);
  final s = int.parse(m.group(3) ?? '0');
  if (h > 23 || min > 59 || s > 59) return null;
  return h * 3600 + min * 60 + s;
}
