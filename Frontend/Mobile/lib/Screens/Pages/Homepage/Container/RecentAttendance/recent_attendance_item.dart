import 'package:flutter/material.dart';
import '../../../../Reusable/Badge/attendance_badge.dart';

import '../../../../../Controller/Homepage/recent_attendance.dart';

class RecentAttendanceItem extends StatefulWidget {
  const RecentAttendanceItem({super.key});

  @override
  State<RecentAttendanceItem> createState() => _RecentAttendanceItemState();
}

class _RecentAttendanceItemState extends State<RecentAttendanceItem> {
  final RecentAttendance attendance = RecentAttendance();
  String location = '';
  String date = '';
  String status = '';
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(7.5),
        color: Color(0xFFFCFCFC),
      ),
      child: Column(
        children: [
          //Top Part
          Container(
            padding: EdgeInsets.only(top: 5, bottom: 5, right: 15, left: 15),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                //Location
                Text(
                  'Office',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Color(0xFF3A3A3A),
                  ),
                ),
                AttendanceBadge(
                  status: 'Absent',
                ), // change the status to the flexible
              ],
            ),
          ),

          //line
        ],
      ),
    );
  }
}
