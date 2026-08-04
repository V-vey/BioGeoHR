import 'package:flutter/material.dart';

import '../../../Reusable/Items/attendance_item_layout.dart';

class AttendanceItems extends StatelessWidget {
  // const AttendanceItems({super.key});

  String status = "Late";
  String location = "Home";
  String date = "2026-07-30";
  bool isVisible = false;
  String clockIn = "09:00";
  String clockOut = "17:00";

  AttendanceItems({super.key});
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap:
          true, // Forces the list to only take up the space of its 10 items
      physics: AlwaysScrollableScrollPhysics(),
      itemCount: 4,
      itemBuilder: (BuildContext context, int index) {
        return AttendanceItemLayout(
          status: status,
          location: location,
          date: date,
          isVisible: isVisible,
          clockIn: clockIn,
          clockOut: clockOut,
        );
      },
    );
  }
}
