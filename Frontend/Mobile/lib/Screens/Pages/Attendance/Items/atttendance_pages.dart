import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/LoginPage/text_box_password.dart';

//Remove
import '../../../../Controller/Attendance/attendance_controller.dart';

class AttendancePages extends StatefulWidget {
  final int pageNum;
  final int totalPages; // Added to prevent scrolling past the last page
  final ValueChanged<int> onPageChanged; // Added callback function
  const AttendancePages({
    super.key,
    required this.pageNum,
    required this.totalPages,
    required this.onPageChanged,
  });

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
          Text("Page ${widget.pageNum} of ${widget.totalPages}"),
          Spacer(),
          //back page
          IconButton(
            icon: const Icon(Icons.chevron_left),
            // Disables button if on page 1
            onPressed: widget.pageNum > 1
                ? () => widget.onPageChanged(widget.pageNum - 1)
                : null,
          ),
          //next page
          IconButton(
            icon: const Icon(Icons.chevron_right),
            // Disables button if on the last page
            onPressed: widget.pageNum < widget.totalPages
                ? () => widget.onPageChanged(widget.pageNum + 1)
                : null,
          ),
        ],
      ),
    );
  }
}
