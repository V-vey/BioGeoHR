import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/Reusable/Items/attendance_item_layout.dart';

// import 'RecentAttendanceItem.dart';
// import '../../../../Reusable/Items/AttendanceItem.dart';
import '../../../../../Controller/Homepage/recent_attendance.dart';

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

  @override
  void initState() {
    super.initState();

    _loadRecentAttendance();
  }

  Future<void> _loadRecentAttendance() async {
    final result = await attendance.getRecentAttendance();

    setState(() {
      location = result.$1;
      date = result.$2;
      status = result.$3;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        //do something
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
            AttendanceItemLayout(
              status: status,
              location: location,
              date: date,
            ), // Recent
          ],
        ),
      ),
    );
  }
}
