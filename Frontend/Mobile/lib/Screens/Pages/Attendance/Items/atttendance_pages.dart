import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/LoginPage/text_box_password.dart';

//Remove
import '../../../../Controller/Attendance/attendance_controller.dart';

class AttendancePages extends StatefulWidget {
  final int pageNum;
  const AttendancePages({super.key, required this.pageNum});

  @override
  State<AttendancePages> createState() => _AtttendancePagesState();
}

class _AtttendancePagesState extends State<AttendancePages> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10),
      child: Row(
        children: [
          Text("Page ${widget.pageNum}"),
          Spacer(),
          //back page
          IconButton(icon: const Icon(Icons.chevron_left), onPressed: () {}),
          //next page
          IconButton(icon: const Icon(Icons.chevron_right), onPressed: () {}),
        ],
      ),
    );
  }
}
