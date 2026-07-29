import 'package:flutter/material.dart';

import '../../../../Reusable/Badge/leave_badge.dart';

class RecentLeaveItem extends StatefulWidget {
  const RecentLeaveItem({super.key});

  @override
  State<RecentLeaveItem> createState() => _RecentLeaveItemState();
}
// final RecentAttendance attendance = RecentAttendance();
// String location = '';
// String date =   '';
// String status = '';

// @override
// Future<void> _loadRecentAttendance() async {
//   final result = await attendance.getRecentAttendance();

//   setState(() {
//     location = result.$1;
//     date = result.$2;
//     status = result.$3;
//   });
// }

class _RecentLeaveItemState extends State<RecentLeaveItem> {
  @override
  Widget build(BuildContext context) {
    return Container(
      // width: 350,
      // height: 120,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(7.5),
        color: Color(0xFFFCFCFC),
      ),
      child: Column(
        children: [
          //Top Part
          Container(
            padding: EdgeInsets.only(bottom: 5, right: 10, left: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                //Reason
                Text(
                  'Sick Leave',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Color(0xFF3A3A3A),
                  ),
                ),

                LeaveBadge(status: "Pending"),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
