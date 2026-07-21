import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/Reusable/Items/AttendanceItem.dart';

// import 'RecentAttendanceItem.dart';
// import '../../../../Reusable/Items/AttendanceItem.dart';

class RecentAttendance extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        print('Container clicked!');
        for (int i = 78; i <= 153; i++) {
          print(i);
        }
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
            AttendanceItem(
              status: "On-Time",
              location: "TSU San Isidro",
              date: '2026-07-08',
            ), // Recent
          ],
        ),
      ),
    );
  }
}
