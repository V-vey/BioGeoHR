import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Controller/Attendance/attendance_model.dart';

import 'attendance.dart';
import 'monthly_attendance.dart';
import '../../../Controller/Attendance/attendance_controller.dart';
import '../../../Controller/Attendance/attendance_model.dart';

import '../../Reusable/Items/attendance_item_layout.dart';

class AttendancePageMain extends StatefulWidget {
  const AttendancePageMain({super.key});

  @override
  State<AttendancePageMain> createState() => _AttendancePageMainState();
}

class _AttendancePageMainState extends State<AttendancePageMain> {
  Map<String, dynamic> test = {};
  late Future<List<AttendanceModel>> attendance;
  final AttendanceController attendanceController = AttendanceController();

  @override
  void initState() {
    super.initState();
    attendance = attendanceController.getAttendance();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // var items = Container(
    //   margin: EdgeInsets.all(15),
    //   child: Column(
    //     children: [MonthlyAttendance(), SizedBox(height: 15), Attendance()],
    //   ),
    // );
    var items = FutureBuilder<List<AttendanceModel>>(
      future: attendance,
      builder: (context, snapshot) {
        // 1. Show a loader while waiting for backend response
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        // 2. Show error if backend request fails
        if (snapshot.hasError) {
          return Center(child: Text('Error loading data: ${snapshot.error}'));
        }

        // 3. Handle case where data returns empty
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No attendance records found.'));
        }

        // 4. Safely extract your loaded list of elements
        final List<AttendanceModel> records = snapshot.data!;

        return ListView.builder(
          padding: const EdgeInsets.all(15),
          itemCount: records.length,
          itemBuilder: (context, index) {
            final record = records[index];
            return AttendanceItemLayout(
              status: record.status,
              location: record.location,
              date: record.date,
              isVisible: false,
              clockIn: record.clockIn,
              clockOut: record.clockOut,
            );
          },
        );
      },
    );
    return items;
  }
}
