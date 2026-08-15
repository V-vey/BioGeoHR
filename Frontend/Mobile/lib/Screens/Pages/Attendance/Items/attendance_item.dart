import 'package:flutter/material.dart';

import '../../../Reusable/Items/attendance_item_layout.dart';

class AttendanceItems extends StatefulWidget {
  const AttendanceItems({super.key});

  @override
  State<AttendanceItems> createState() => _AttendanceItemsState();
}

class _AttendanceItemsState extends State<AttendanceItems> {
  // const AttendanceItems({super.key});
  String status = "Late";

  String location = "Home";

  String date = "2026-07-30";

  bool isVisible = false;

  String clockIn = "09:00";

  String clockOut = "17:00";

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap:
          true, // Forces the list to only take up the space of its 10 items
      physics: AlwaysScrollableScrollPhysics(),
      itemCount: 7,
      itemBuilder: (BuildContext context, int index) {
        return GestureDetector(
          onTap: () {
            setState(() {
              isVisible = !isVisible;
            });
          },
          child: AttendanceItemLayout(
            status: status,
            location: location,
            date: date,
            isVisible: isVisible,
            clockIn: clockIn,
            clockOut: clockOut,
          ),
        );
      },
    );
  }
}
