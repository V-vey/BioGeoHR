import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/Reusable/Items/attendance_item_layout.dart';

// import 'RecentAttendanceItem.dart';
// import '../../../../Reusable/Items/AttendanceItem.dart';
import '../../../../../Controller/Homepage/recent_attendance.dart';
import '../../../../../Controller/Attendance/work_duration.dart';

//format time
import 'package:intl/intl.dart';

class RecentAttendancePage extends StatefulWidget {
  const RecentAttendancePage({super.key});

  @override
  State<RecentAttendancePage> createState() => _RecentAttendancePageState();
}

class _RecentAttendancePageState extends State<RecentAttendancePage> {
  final RecentAttendance attendance = RecentAttendance();
  String location = '';
  String date = '';
  String status = '';
  String clockIn = '';
  String clockOut = '';
  String duration = '--';

  // what the card shows: still loading, nothing recorded yet, or the server failed
  bool loading = true;
  bool empty = false;
  bool failed = false;

  @override
  void initState() {
    super.initState();

    _loadRecentAttendance();
  }

  Future<void> _loadRecentAttendance() async {
    try {
      final result = await attendance.getRecentAttendance();
      if (!mounted) return; // the screen was closed while waiting

      // null = the employee has no finished day yet
      if (result == null) {
        setState(() {
          loading = false;
          empty = true;
        });
        return;
      }

      DateFormat inputFormat = DateFormat("HH:mm:ss");
      DateFormat outputFormat = DateFormat("h:mm a");

      final parsedIn = outputFormat.format(inputFormat.parse(result.$4));
      final parsedOut = outputFormat.format(inputFormat.parse(result.$5));

      setState(() {
        location = result.$1;
        date = result.$2;
        status = result.$3;
        clockIn = parsedIn;
        clockOut = parsedOut;
        duration = workDuration(result.$4, result.$5, date: result.$2);
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        loading = false;
        failed = true;
      });
    }
  }

  bool isVisible = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() {
          isVisible = !isVisible;
        });
      },
      child: Container(
        width: 350,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Color(0xFFFCFCFC),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(20),
              blurRadius: 6.0,
              spreadRadius: 4.0,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(10),
              child: Text(
                'Recent Attendance',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0xFF6675EC),
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
            SizedBox(height: 5),
            if (loading)
              const Padding(
                padding: EdgeInsets.all(16),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              )
            else if (failed)
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Unavailable',
                  style: TextStyle(color: Colors.grey),
                ),
              )
            else if (empty)
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'No attendance yet',
                  style: TextStyle(color: Colors.grey),
                ),
              )
            else
              AttendanceItemLayout(
                status: status,
                location: location,
                date: date,
                isVisible: isVisible,
                clockIn: clockIn,
                clockOut: clockOut,
                duration: duration,
              ), // Recent
          ],
        ),
      ),
    );
  }
}
